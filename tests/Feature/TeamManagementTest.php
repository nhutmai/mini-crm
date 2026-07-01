<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_team_without_lead(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/teams', [
            'name' => 'Customer Success',
            'description' => 'Handles retained customer expansion.',
        ]);

        $response->assertRedirect('/teams');

        $this->assertDatabaseHas('teams', [
            'name' => 'Customer Success',
            'lead_id' => null,
            'created_by' => $admin->id,
        ]);
    }

    public function test_non_admin_cannot_create_team(): void
    {
        $sales = User::factory()->sales()->create();

        $response = $this->actingAs($sales)->post('/teams', [
            'name' => 'Unauthorized Team',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_assign_lead_only_from_team_members(): void
    {
        $admin = User::factory()->admin()->create();
        $team = Team::create(['name' => 'Sales Team', 'created_by' => $admin->id]);
        $member = User::factory()->sales()->create(['team_id' => $team->id]);
        $outsider = User::factory()->sales()->create();

        $this->actingAs($admin)
            ->patch("/teams/{$team->id}/lead", ['lead_id' => $outsider->id])
            ->assertSessionHasErrors('lead_id');

        $this->actingAs($admin)
            ->patch("/teams/{$team->id}/lead", ['lead_id' => $member->id])
            ->assertRedirect();

        $this->assertSame($member->id, $team->fresh()->lead_id);
    }

    public function test_adding_member_to_new_team_clears_old_team_lead(): void
    {
        $admin = User::factory()->admin()->create();
        $oldTeam = Team::create(['name' => 'Old Team', 'created_by' => $admin->id]);
        $newTeam = Team::create(['name' => 'New Team', 'created_by' => $admin->id]);
        $member = User::factory()->sales()->create(['team_id' => $oldTeam->id]);
        $oldTeam->update(['lead_id' => $member->id]);

        $this->actingAs($admin)
            ->post("/teams/{$newTeam->id}/members", [
                'member_id' => $member->id,
                'transfer' => true,
            ])
            ->assertRedirect();

        $this->assertSame($newTeam->id, $member->fresh()->team_id);
        $this->assertNull($oldTeam->fresh()->lead_id);
    }

    public function test_transfer_requires_explicit_confirmation(): void
    {
        $admin = User::factory()->admin()->create();
        $oldTeam = Team::create(['name' => 'Old Team', 'created_by' => $admin->id]);
        $newTeam = Team::create(['name' => 'New Team', 'created_by' => $admin->id]);
        $member = User::factory()->sales()->create(['team_id' => $oldTeam->id]);

        $this->actingAs($admin)
            ->post("/teams/{$newTeam->id}/members", ['member_id' => $member->id])
            ->assertSessionHasErrors('transfer');

        $this->assertSame($oldTeam->id, $member->fresh()->team_id);
    }

    public function test_team_lead_can_manage_members_but_cannot_assign_lead(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = User::factory()->sales()->create();
        $member = User::factory()->sales()->create();
        $team = Team::create(['name' => 'Managed Team', 'created_by' => $admin->id]);
        $lead->update(['team_id' => $team->id]);
        $team->update(['lead_id' => $lead->id]);

        $this->actingAs($lead)
            ->post("/teams/{$team->id}/members", ['member_id' => $member->id])
            ->assertRedirect();

        $this->assertSame($team->id, $member->fresh()->team_id);

        $this->actingAs($lead)
            ->patch("/teams/{$team->id}/lead", ['lead_id' => $member->id])
            ->assertForbidden();

        $this->assertSame($lead->id, $team->fresh()->lead_id);
    }

    public function test_removing_current_lead_clears_team_lead(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = User::factory()->sales()->create();
        $team = Team::create(['name' => 'Lead Removal Team', 'created_by' => $admin->id]);
        $lead->update(['team_id' => $team->id]);
        $team->update(['lead_id' => $lead->id]);

        $this->actingAs($admin)
            ->delete("/teams/{$team->id}/members/{$lead->id}")
            ->assertRedirect();

        $this->assertNull($lead->fresh()->team_id);
        $this->assertNull($team->fresh()->lead_id);
    }
}
