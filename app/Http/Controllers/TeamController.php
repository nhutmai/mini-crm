<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTeamMemberRequest;
use App\Http\Requests\InviteTeamMemberRequest;
use App\Http\Requests\RemoveTeamMemberRequest;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamLeadRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Team::class);

        $validated = $request->validate([
            'tab' => ['nullable', Rule::in(['teams', 'members'])],
            'keyword' => ['nullable', 'string', 'max:120'],
            'role' => ['nullable', Rule::in(User::ROLES)],
            'status' => ['nullable', Rule::in(User::STATUSES)],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        $tab = $validated['tab'] ?? 'teams';

        return Inertia::render('TeamList', [
            'teams' => $this->teamPaginator($user, $validated),
            'members' => $this->memberPaginator($user, $validated),
            'meta' => [
                'filters' => [
                    'roles' => User::ROLES,
                    'statuses' => User::STATUSES,
                    'teams' => $this->teamOptions($user),
                ],
                'permissions' => [
                    'create_team' => (bool) $user?->can('create', Team::class),
                ],
            ],
            'query' => [
                'tab' => $tab,
                'keyword' => $validated['keyword'] ?? '',
                'role' => $validated['role'] ?? '',
                'status' => $validated['status'] ?? '',
                'team_id' => $validated['team_id'] ?? '',
                'page' => $validated['page'] ?? 1,
            ],
        ]);
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        Team::create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
        ]);

        return redirect()->route('teams.index')->with('success', 'Team created.');
    }

    public function show(Request $request, Team $team): Response
    {
        $this->authorize('view', $team);

        $team->load([
            'lead:id,name,email,role,status,team_id',
            'creator:id,name,email',
            'members:id,name,email,role,status,team_id,created_at',
        ])->loadCount('members');

        return Inertia::render('TeamDetail', [
            'team' => $this->teamDetail($team, $request->user()),
            'meta' => [
                'member_options' => $this->memberOptions($request->user()),
                'permissions' => [
                    'delete_team' => (bool) $request->user()?->can('delete', $team),
                    'update_lead' => (bool) $request->user()?->can('updateLead', $team),
                    'manage_members' => (bool) $request->user()?->can('addMember', $team),
                    'invite_members' => (bool) $request->user()?->can('inviteMember', $team),
                ],
            ],
        ]);
    }

    public function destroy(Request $request, Team $team): RedirectResponse
    {
        $this->authorize('delete', $team);

        DB::transaction(function () use ($team) {
            User::query()
                ->where('team_id', $team->id)
                ->update(['team_id' => null]);

            $team->delete();
        });

        return redirect()->route('teams.index')->with('success', 'Team deleted.');
    }

    public function updateLead(UpdateTeamLeadRequest $request, Team $team): RedirectResponse
    {
        $team->update([
            'lead_id' => $request->validated('lead_id'),
        ]);

        return redirect()->back()->with('success', $request->validated('lead_id') ? 'Team lead updated.' : 'Team lead removed.');
    }

    public function addMember(AddTeamMemberRequest $request, Team $team): RedirectResponse
    {
        $member = User::query()->findOrFail($request->validated('member_id'));

        DB::transaction(function () use ($member, $team) {
            if ($member->team_id && $member->team_id !== $team->id) {
                Team::query()
                    ->where('id', $member->team_id)
                    ->where('lead_id', $member->id)
                    ->update(['lead_id' => null]);
            }

            $member->update(['team_id' => $team->id]);
        });

        return redirect()->back()->with('success', 'Member added to team.');
    }

    public function removeMember(RemoveTeamMemberRequest $request, Team $team, User $user): RedirectResponse
    {
        DB::transaction(function () use ($team, $user) {
            if ($team->lead_id === $user->id) {
                $team->update(['lead_id' => null]);
            }

            $user->update(['team_id' => null]);
        });

        return redirect()->back()->with('success', 'Member removed from team.');
    }

    public function invite(InviteTeamMemberRequest $request, Team $team): RedirectResponse
    {
        return redirect()
            ->back()
            ->with('success', 'Invitation prepared for '.$request->validated('email').'.');
    }

    private function teamPaginator(?User $user, array $validated)
    {
        $query = Team::query()
            ->with(['lead:id,name,email,role,status', 'creator:id,name,email'])
            ->withCount('members')
            ->latest();

        $this->applyTeamScope($query, $user);

        $query->when($validated['keyword'] ?? null, function (Builder $query, string $keyword) {
            $query->where('name', 'like', "%{$keyword}%");
        });

        return $query
            ->paginate($validated['limit'] ?? 10, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString()
            ->through(fn (Team $team) => $this->teamSummary($team, $user));
    }

    private function memberPaginator(?User $user, array $validated)
    {
        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'status', 'team_id', 'created_at')
            ->with('team:id,name,lead_id')
            ->withCount(['campaigns', 'assignedLeads'])
            ->latest();

        $this->applyMemberScope($query, $user);

        $query
            ->when($validated['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['team_id'] ?? null, fn (Builder $query, int $teamId) => $query->where('team_id', $teamId))
            ->when($validated['keyword'] ?? null, function (Builder $query, string $keyword) {
                $query->where(function (Builder $query) use ($keyword) {
                    $query
                        ->where('name', 'like', "%{$keyword}%")
                        ->orWhere('email', 'like', "%{$keyword}%");
                });
            });

        return $query
            ->paginate($validated['limit'] ?? 10, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString()
            ->through(fn (User $member) => $this->memberSummary($member));
    }

    private function applyTeamScope(Builder $query, ?User $user): void
    {
        if (! $user || $user->isAdmin()) {
            return;
        }

        $query->where(function (Builder $query) use ($user) {
            $query
                ->where('lead_id', $user->id)
                ->orWhere('id', $user->team_id);
        });
    }

    private function applyMemberScope(Builder $query, ?User $user): void
    {
        if (! $user || $user->isAdmin()) {
            return;
        }

        $leadingTeamIds = $user->leadingTeams()->pluck('id');

        if ($leadingTeamIds->isNotEmpty()) {
            $query->whereIn('team_id', $leadingTeamIds);

            return;
        }

        $query->where('team_id', $user->team_id);
    }

    private function teamOptions(?User $user)
    {
        $query = Team::query()->select('id', 'name')->orderBy('name');
        $this->applyTeamScope($query, $user);

        return $query->get();
    }

    private function memberOptions(?User $user)
    {
        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'status', 'team_id')
            ->with('team:id,name')
            ->where('status', User::STATUS_ACTIVE)
            ->orderBy('name');

        if ($user && ! $user->isAdmin()) {
            $query->where('id', '!=', $user->id);
        }

        return $query->get()->map(fn (User $member) => [
            ...$this->memberSummary($member),
            'team' => $member->team,
        ]);
    }

    private function teamSummary(Team $team, ?User $user): array
    {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'description' => $team->description,
            'lead' => $team->lead,
            'creator' => $team->creator,
            'members_count' => $team->members_count,
            'created_at' => $team->created_at?->toDateString(),
            'permissions' => [
                'view' => (bool) $user?->can('view', $team),
                'delete' => (bool) $user?->can('delete', $team),
                'update_lead' => (bool) $user?->can('updateLead', $team),
                'manage_members' => (bool) $user?->can('addMember', $team),
            ],
        ];
    }

    private function teamDetail(Team $team, ?User $user): array
    {
        return [
            ...$this->teamSummary($team, $user),
            'members' => $team->members->map(fn (User $member) => $this->memberSummary($member)),
            'updated_at' => $team->updated_at?->toDateTimeString(),
        ];
    }

    private function memberSummary(User $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'role' => $member->role,
            'status' => $member->status,
            'team_id' => $member->team_id,
            'team' => $member->team,
            'campaigns_count' => $member->campaigns_count ?? null,
            'assigned_leads_count' => $member->assigned_leads_count ?? null,
            'created_at' => $member->created_at?->toDateString(),
        ];
    }
}
