<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicLeadController extends Controller
{
    public function campaign(?Campaign $campaign = null): JsonResponse
    {
        if ($campaign && $campaign->status !== 'active') {
            return response()->json([
                'message' => 'This campaign is not accepting new leads right now.',
                'campaign' => [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'status' => $campaign->status,
                ],
            ], 409);
        }

        return response()->json([
            'campaign' => $campaign ? [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'source' => $campaign->source,
                'status' => $campaign->status,
            ] : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', 'integer', 'exists:campaigns,id'],
            'full_name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:160'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:160'],
            'need' => ['nullable', 'string', 'max:2000'],
        ]);

        $campaign = isset($validated['campaign_id'])
            ? Campaign::findOrFail($validated['campaign_id'])
            : null;

        if ($campaign && $campaign->status !== 'active') {
            return response()->json([
                'message' => 'This campaign is not accepting new leads right now.',
            ], 409);
        }

        $lead = Lead::create([
            'campaign_id' => $campaign?->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company' => $validated['company'] ?? null,
            'need' => $validated['need'] ?? null,
            'source' => $campaign?->source ?? 'public_form',
            'status' => 'new',
        ]);

        $lead->activities()->create([
            'type' => 'note',
            'content' => 'Lead submitted from public form.',
        ]);

        return response()->json([
            'message' => 'Thank you! We received your information and will contact you soon.',
            'lead_id' => $lead->id,
        ], 201);
    }
}
