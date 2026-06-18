<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(Campaign::STATUSES)],
            'source' => ['nullable', 'string', 'max:80'],
            'keyword' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Campaign::query()
            ->with('owner:id,name,email,role')
            ->withCount('leads')
            ->latest();

        $this->applyCampaignScope($query, $request->user());

        $query
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['source'] ?? null, fn (Builder $query, string $source) => $query->where('source', $source))
            ->when($validated['keyword'] ?? null, fn (Builder $query, string $keyword) => $query->where('name', 'like', "%{$keyword}%"));

        $campaigns = $query->paginate($validated['limit'] ?? 10)->withQueryString();

        return response()->json([
            'data' => $campaigns->through(fn (Campaign $campaign) => $this->campaignSummary($campaign, $request->user())),
            'meta' => [
                'filters' => [
                    'statuses' => Campaign::STATUSES,
                    'sources' => Campaign::query()->select('source')->distinct()->orderBy('source')->pluck('source')->values(),
                ],
                'permissions' => [
                    'create' => $this->canCreateCampaign($request->user()),
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, Campaign $campaign): JsonResponse
    {
        abort_unless($this->canManageCampaign($request->user(), $campaign), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(Campaign::STATUSES)],
        ]);

        $campaign->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Campaign status updated.',
            'campaign' => $campaign->fresh(),
        ]);
    }

    public function destroy(Request $request, Campaign $campaign): JsonResponse
    {
        abort_unless((bool) ($request->user()?->isAdmin()), 403);

        $campaign->delete();

        return response()->json([
            'message' => 'Campaign deleted.',
        ]);
    }

    private function campaignSummary(Campaign $campaign, ?User $user): array
    {
        return [
            'id' => $campaign->id,
            'name' => $campaign->name,
            'source' => $campaign->source,
            'status' => $campaign->status,
            'budget' => $campaign->budget,
            'leads_count' => $campaign->leads_count,
            'owner' => $campaign->owner,
            'start_date' => $campaign->start_date?->toDateString(),
            'end_date' => $campaign->end_date?->toDateString(),
            'created_at' => $campaign->created_at?->toDateString(),
            'permissions' => [
                'view' => true,
                'edit' => $this->canManageCampaign($user, $campaign),
                'pause' => $this->canManageCampaign($user, $campaign) && $campaign->status === 'active',
                'activate' => $this->canManageCampaign($user, $campaign) && in_array($campaign->status, ['draft', 'paused'], true),
                'delete' => (bool) ($user?->isAdmin()),
            ],
        ];
    }

    private function applyCampaignScope(Builder $query, ?User $user): void
    {
        if (! $user || $user->isAdmin()) {
            return;
        }

        if ($user->isMarketer()) {
            $query->where('owner_id', $user->id);
            return;
        }

        if ($user->isSales()) {
            $query->whereHas('leads', fn (Builder $query) => $query->where('assigned_to', $user->id));
        }
    }

    private function canCreateCampaign(?User $user): bool
    {
        return ! $user || $user->isAdmin() || $user->isMarketer();
    }

    private function canManageCampaign(?User $user, Campaign $campaign): bool
    {
        return ! $user || $user->isAdmin() || ($user->isMarketer() && $campaign->owner_id === $user->id);
    }
}
