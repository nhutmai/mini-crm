<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PublicLeadController;
use App\Models\Lead;
use Illuminate\Support\Facades\Route;

Route::get('/me', fn () => response()->json([
    'user' => request()->user(),
]));

Route::get('/leads', function () {
    return request()->expectsJson()
        ? app(LeadController::class)->index(request())
        : view('app');
})->name('leads.index');

Route::get('/leads/{lead}', function (Lead $lead) {
    return request()->expectsJson()
        ? app(LeadController::class)->show(request(), $lead)
        : view('app');
})->name('leads.show');

Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
Route::patch('/leads/{lead}/assign', [LeadController::class, 'assign'])->name('leads.assign');
Route::post('/leads/{lead}/activities', [LeadController::class, 'storeActivity'])->name('leads.activities.store');

Route::get('/campaigns', function () {
    return request()->expectsJson()
        ? app(CampaignController::class)->index(request())
        : view('app');
})->name('campaigns.index');
Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus'])->name('campaigns.status');
Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');

Route::get('/public/leads/{campaign?}', fn () => view('app'))->name('public.leads.form');
Route::get('/public-lead-campaign/{campaign?}', [PublicLeadController::class, 'campaign'])->name('public.leads.campaign');
Route::post('/public/leads', [PublicLeadController::class, 'store'])->name('public.leads.store');

Route::view('/{path?}', 'app')->where('path', '.*');
