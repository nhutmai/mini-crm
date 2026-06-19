<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PublicLeadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Dashboard'))->name('dashboard');
Route::get('/login', fn () => Inertia::render('Login'))->name('login');

Route::get('/me', fn () => response()->json([
    'user' => request()->user(),
]))->name('me');

Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');

Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
Route::patch('/leads/{lead}/assign', [LeadController::class, 'assign'])->name('leads.assign');
Route::post('/leads/{lead}/activities', [LeadController::class, 'storeActivity'])->name('leads.activities.store');

Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus'])->name('campaigns.status');
Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');

Route::get('/public/leads/{campaign?}', [PublicLeadController::class, 'create'])->name('public.leads.form');
Route::post('/public/leads', [PublicLeadController::class, 'store'])->name('public.leads.store');
