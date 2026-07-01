<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->team_id !== null || $user->leadingTeams()->exists();
    }

    public function view(User $user, Team $team): bool
    {
        return $user->isAdmin() || $user->isTeamLeadOf($team) || $user->team_id === $team->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Team $team): bool
    {
        return $user->isAdmin();
    }

    public function updateLead(User $user, Team $team): bool
    {
        return $user->isAdmin();
    }

    public function addMember(User $user, Team $team): bool
    {
        return $user->isAdmin() || $user->isTeamLeadOf($team);
    }

    public function removeMember(User $user, Team $team): bool
    {
        return $user->isAdmin() || $user->isTeamLeadOf($team);
    }

    public function inviteMember(User $user, Team $team): bool
    {
        return $user->isAdmin() || $user->isTeamLeadOf($team);
    }
}
