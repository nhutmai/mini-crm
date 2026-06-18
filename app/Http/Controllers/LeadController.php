<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(Lead::STATUSES)],
            'campaign_id' => ['nullable', 'integer', 'exists:campaigns,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'source' => ['nullable', 'string', 'max:80'],
            'keyword' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Lead::query()
            ->with(['campaign:id,name,source,status', 'assignedSales:id,name,email,role'])
            ->latest();

        $this->applyLeadScope($query, $request->user());

        $query
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['campaign_id'] ?? null, fn (Builder $query, int $campaignId) => $query->where('campaign_id', $campaignId))
            ->when($validated['assigned_to'] ?? null, fn (Builder $query, int $salesId) => $query->where('assigned_to', $salesId))
            ->when($validated['source'] ?? null, fn (Builder $query, string $source) => $query->where('source', $source))
            ->when($validated['keyword'] ?? null, function (Builder $query, string $keyword) {
                $query->where(function (Builder $query) use ($keyword) {
                    $query
                        ->where('full_name', 'like', "%{$keyword}%")
                        ->orWhere('email', 'like', "%{$keyword}%")
                        ->orWhere('phone', 'like', "%{$keyword}%");
                });
            });

        $leads = $query->paginate($validated['limit'] ?? 10)->withQueryString();

        return Inertia::render('LeadList', [
            'leads' => $leads->through(fn (Lead $lead) => $this->leadSummary($lead)),
            'meta' => [
                'filters' => $this->leadFilters($request),
                'permissions' => [
                    'create' => $this->canCreateLead($request->user()),
                ],
            ],
            'query' => [
                'status' => $validated['status'] ?? '',
                'campaign_id' => $validated['campaign_id'] ?? '',
                'assigned_to' => $validated['assigned_to'] ?? '',
                'source' => $validated['source'] ?? '',
                'keyword' => $validated['keyword'] ?? '',
                'page' => $validated['page'] ?? 1,
            ],
        ]);
    }

    public function show(Request $request, Lead $lead): Response
    {
        abort_unless($this->canViewLead($request->user(), $lead), 403);

        $lead->load([
            'campaign:id,name,source,status,start_date,end_date',
            'assignedSales:id,name,email,role',
            'creator:id,name,email,role',
            'activities.user:id,name,email,role',
        ]);

        return Inertia::render('LeadDetail', [
            'lead' => $this->leadDetail($lead),
            'meta' => [
                'statuses' => Lead::STATUSES,
                'sales' => $this->salesOptions(),
                'permissions' => [
                    'update_status' => $this->canUpdateLead($request->user(), $lead),
                    'assign' => $this->canAssignLead($request->user(), $lead),
                    'add_note' => $this->canUpdateLead($request->user(), $lead),
                    'edit' => $this->canUpdateLead($request->user(), $lead),
                    'delete' => $this->canDeleteLead($request->user(), $lead),
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        abort_unless($this->canUpdateLead($request->user(), $lead), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(Lead::STATUSES)],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $oldStatus = $lead->status;
        $lead->update(['status' => $validated['status']]);

        $lead->activities()->create([
            'user_id' => $request->user()?->id,
            'type' => 'status_change',
            'content' => $validated['note'] ?? null,
            'old_status' => $oldStatus,
            'new_status' => $lead->status,
        ]);

        return redirect()->back()->with('success', 'Status updated.');
    }

    public function assign(Request $request, Lead $lead): RedirectResponse
    {
        abort_unless($this->canAssignLead($request->user(), $lead), 403);

        $validated = $request->validate([
            'sales_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'sales')->where('status', 'active')],
        ]);

        $sales = User::findOrFail($validated['sales_id']);
        $lead->update([
            'assigned_to' => $sales->id,
            'status' => $lead->status === 'new' ? 'contacted' : $lead->status,
        ]);

        $lead->activities()->create([
            'user_id' => $request->user()?->id,
            'type' => 'assignment',
            'content' => 'Assigned to '.$sales->name.'.',
        ]);

        return redirect()->back()->with('success', 'Lead assigned.');
    }

    public function storeActivity(Request $request, Lead $lead): RedirectResponse
    {
        abort_unless($this->canUpdateLead($request->user(), $lead), 403);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $lead->activities()->create([
            'user_id' => $request->user()?->id,
            'type' => 'note',
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Note added.');
    }

    private function leadFilters(Request $request): array
    {
        $campaigns = Campaign::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $sources = Lead::query()
            ->select('source')
            ->distinct()
            ->orderBy('source')
            ->pluck('source')
            ->values();

        return [
            'statuses' => Lead::STATUSES,
            'campaigns' => $campaigns,
            'sales' => $this->salesOptions(),
            'sources' => $sources,
        ];
    }

    private function salesOptions()
    {
        return User::query()
            ->select('id', 'name', 'email')
            ->where('role', 'sales')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }

    private function leadSummary(Lead $lead): array
    {
        return [
            'id' => $lead->id,
            'full_name' => $lead->full_name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'company' => $lead->company,
            'status' => $lead->status,
            'source' => $lead->source,
            'created_at' => $lead->created_at?->toDateString(),
            'campaign' => $lead->campaign,
            'assigned_sales' => $lead->assignedSales,
            'permissions' => [
                'view' => true,
                'edit' => true,
            ],
        ];
    }

    private function leadDetail(Lead $lead): array
    {
        return [
            ...$this->leadSummary($lead),
            'need' => $lead->need,
            'estimated_value' => $lead->estimated_value,
            'score' => $lead->score,
            'creator' => $lead->creator,
            'updated_at' => $lead->updated_at?->toDateTimeString(),
            'activities' => $lead->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'content' => $activity->content,
                'old_status' => $activity->old_status,
                'new_status' => $activity->new_status,
                'created_at' => $activity->created_at?->toDateTimeString(),
                'user' => $activity->user,
            ]),
        ];
    }

    private function applyLeadScope(Builder $query, ?User $user): void
    {
        if (! $user || $user->isAdmin()) {
            return;
        }

        if ($user->isMarketer()) {
            $query->whereHas('campaign', fn (Builder $query) => $query->where('owner_id', $user->id));
            return;
        }

        if ($user->isSales()) {
            $query->where('assigned_to', $user->id);
        }
    }

    private function canCreateLead(?User $user): bool
    {
        return ! $user || $user->isAdmin() || $user->isMarketer();
    }

    private function canViewLead(?User $user, Lead $lead): bool
    {
        if (! $user || $user->isAdmin()) {
            return true;
        }

        if ($user->isSales()) {
            return $lead->assigned_to === $user->id;
        }

        return $lead->campaign()->where('owner_id', $user->id)->exists();
    }

    private function canUpdateLead(?User $user, Lead $lead): bool
    {
        return $this->canViewLead($user, $lead);
    }

    private function canAssignLead(?User $user, Lead $lead): bool
    {
        return ! $user || $user->isAdmin() || ($user->isMarketer() && $this->canViewLead($user, $lead));
    }

    private function canDeleteLead(?User $user, Lead $lead): bool
    {
        return (bool) ($user?->isAdmin());
    }
}
