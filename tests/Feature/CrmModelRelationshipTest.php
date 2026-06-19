<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrmModelRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_crm_models_have_expected_relationships(): void
    {
        $marketer = User::factory()->marketer()->create();
        $sales = User::factory()->sales()->create();

        $campaign = Campaign::create([
            'owner_id' => $marketer->id,
            'name' => 'Relationship Campaign',
            'source' => 'facebook_ads',
            'status' => 'active',
        ]);

        $lead = Lead::create([
            'campaign_id' => $campaign->id,
            'assigned_to' => $sales->id,
            'created_by' => $marketer->id,
            'full_name' => 'Relationship Lead',
            'email' => 'lead@example.com',
            'source' => 'facebook_ads',
            'status' => 'new',
        ]);

        $activity = $lead->activities()->create([
            'user_id' => $sales->id,
            'type' => 'note',
            'content' => 'Initial follow-up note.',
        ]);

        $this->assertTrue($marketer->campaigns->contains($campaign));
        $this->assertTrue($campaign->owner->is($marketer));
        $this->assertTrue($campaign->leads->contains($lead));
        $this->assertTrue($lead->campaign->is($campaign));
        $this->assertTrue($lead->assignedSales->is($sales));
        $this->assertTrue($lead->activities->contains($activity));
        $this->assertTrue($activity->lead->is($lead));
        $this->assertTrue($activity->user->is($sales));
    }
}
