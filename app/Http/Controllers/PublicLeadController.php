<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadController extends Controller
{
    public function create(?Campaign $campaign = null): Response
    {
        $campaignError = null;

        if ($campaign && $campaign->status !== 'active') {
            $campaignError = 'This campaign is not accepting new leads right now.';
        }

        return Inertia::render('PublicLeadForm', [
            'campaign' => $campaign ? [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'source' => $campaign->source,
                'status' => $campaign->status,
            ] : null,
            'campaignError' => $campaignError,
        ]);
    }

    public function store(Request $request): RedirectResponse
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
            return redirect()->back()->with('error', 'This campaign is not accepting new leads right now.');
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

        return redirect()->back()->with('success', 'Thank you! We received your information and will contact you soon.');
    }
}
