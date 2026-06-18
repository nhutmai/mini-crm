<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin',
            'password' => '123123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $marketer = User::factory()->create([
            'name' => 'Marketing Lead',
            'email' => 'marketer@marketer',
            'password' => '123123',
            'role' => 'marketer',
            'status' => 'active',
        ]);

        $sales = User::factory()->create([
            'name' => 'Sales One',
            'email' => 'sales@sales',
            'password' => '123123',
            'role' => 'sales',
            'status' => 'active',
        ]);

        $salesTwo = User::factory()->create([
            'name' => 'Sales Two',
            'email' => 'sales2@sales',
            'password' => '123123',
            'role' => 'sales',
            'status' => 'active',
        ]);

        $summer = Campaign::create([
            'owner_id' => $marketer->id,
            'name' => 'Summer Consultation Push',
            'source' => 'facebook_ads',
            'description' => 'Lead capture campaign for summer consultations.',
            'status' => 'active',
            'budget' => 2500,
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->endOfMonth(),
        ]);

        $event = Campaign::create([
            'owner_id' => $admin->id,
            'name' => 'Offline Event Follow-up',
            'source' => 'offline_event',
            'description' => 'Contacts collected from the June product event.',
            'status' => 'paused',
            'budget' => 1200,
            'start_date' => now()->subWeeks(2),
            'end_date' => now()->addWeeks(2),
        ]);

        $leads = [
            [
                'campaign_id' => $summer->id,
                'assigned_to' => $sales->id,
                'created_by' => $marketer->id,
                'full_name' => 'Nguyen Minh Anh',
                'email' => 'minhanh@example.com',
                'phone' => '0900000001',
                'company' => 'An Phu Retail',
                'need' => 'Needs a CRM workflow for a small sales team.',
                'source' => 'facebook_ads',
                'status' => 'qualified',
                'estimated_value' => 3500,
            ],
            [
                'campaign_id' => $summer->id,
                'assigned_to' => $salesTwo->id,
                'created_by' => $marketer->id,
                'full_name' => 'Tran Bao Chau',
                'email' => 'baochau@example.com',
                'phone' => '0900000002',
                'company' => 'Chau Studio',
                'need' => 'Looking for lead tracking and follow-up reminders.',
                'source' => 'landing_page',
                'status' => 'contacted',
                'estimated_value' => 1800,
            ],
            [
                'campaign_id' => $event->id,
                'assigned_to' => null,
                'created_by' => $admin->id,
                'full_name' => 'Le Quang Huy',
                'email' => 'huy@example.com',
                'phone' => '0900000003',
                'company' => 'Huy Logistics',
                'need' => 'Asked for a follow-up after the event.',
                'source' => 'offline_event',
                'status' => 'new',
                'estimated_value' => 4200,
            ],
        ];

        foreach ($leads as $leadData) {
            $lead = Lead::create($leadData);

            $lead->activities()->create([
                'user_id' => $leadData['created_by'],
                'type' => 'note',
                'content' => 'Lead created from '.$leadData['source'].'.',
            ]);
        }
    }
}
