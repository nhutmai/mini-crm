<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function login(): Response
    {
        return Inertia::render('auth/Login');
    }

    public function profile(): Response
    {
        return Inertia::render('auth/Profile');
    }

    public function members(Request $request): Response
    {
        $validated = $request->validate([
            'role' => ['nullable', Rule::in(User::ROLES)],
            'status' => ['nullable', Rule::in(User::STATUSES)],
            'keyword' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'status', 'created_at')
            ->withCount(['campaigns', 'assignedLeads'])
            ->latest();

        $query
            ->when($validated['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['keyword'] ?? null, function (Builder $query, string $keyword) {
                $query->where(function (Builder $query) use ($keyword) {
                    $query
                        ->where('name', 'like', "%{$keyword}%")
                        ->orWhere('email', 'like', "%{$keyword}%");
                });
            });

        $members = $query->paginate($validated['limit'] ?? 10)->withQueryString();

        return Inertia::render('Members', [
            'members' => $members->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'campaigns_count' => $user->campaigns_count,
                'assigned_leads_count' => $user->assigned_leads_count,
                'created_at' => $user->created_at?->toDateString(),
            ]),
            'meta' => [
                'filters' => [
                    'roles' => User::ROLES,
                    'statuses' => User::STATUSES,
                ],
            ],
            'query' => [
                'role' => $validated['role'] ?? '',
                'status' => $validated['status'] ?? '',
                'keyword' => $validated['keyword'] ?? '',
                'page' => $validated['page'] ?? 1,
            ],
        ]);
    }

    public function handleLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            $request->session()->regenerate();

            return redirect()->route('dashboard');
        }

        return back()->withErrors([
            'email' => 'Invalid credentials.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
        ]);

        $user->update($data);

        return back()->with('success', 'Profile updated successfully.');
    }
}
