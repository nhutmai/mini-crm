<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PublicLeadController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\IsLogin;
use App\Http\Middleware\IsNotLogin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware([IsNotLogin::class])->group(function () {
    Route::get('/login', [UserController::class, 'login'])->name('login');
    Route::post('/login', [UserController::class, 'handleLogin'])->name('login.handle');
});

Route::get('/public/leads/{campaign?}', [PublicLeadController::class, 'create'])->name('public.leads.form');
Route::post('/public/leads', [PublicLeadController::class, 'store'])->name('public.leads.store');

Route::middleware([IsLogin::class])->group(function () {
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');

    Route::get('/me', fn () => response()->json([
        'user' => request()->user(),
    ]))->name('me');

    Route::get('/profile', [UserController::class, 'profile'])->name('profile.edit');
    Route::patch('/profile/update', [UserController::class, 'updateProfile'])->name('profile.update');

    Route::get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');

    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');
    Route::patch('/leads/{lead}/assign', [LeadController::class, 'assign'])->name('leads.assign');
    Route::post('/leads/{lead}/activities', [LeadController::class, 'storeActivity'])->name('leads.activities.store');

    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus'])->name('campaigns.status');
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');
});
