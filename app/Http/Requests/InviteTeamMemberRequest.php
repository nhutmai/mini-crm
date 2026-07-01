<?php

namespace App\Http\Requests;

use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;

class InviteTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $team instanceof Team && (bool) $this->user()?->can('inviteMember', $team);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:160'],
        ];
    }
}
