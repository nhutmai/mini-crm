<?php

namespace App\Http\Requests;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class RemoveTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $team instanceof Team && (bool) $this->user()?->can('removeMember', $team);
    }

    public function rules(): array
    {
        return [];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $team = $this->route('team');
            $member = $this->route('user');

            if (! $team instanceof Team || ! $member instanceof User) {
                return;
            }

            if ($member->team_id !== $team->id) {
                $validator->errors()->add('member', 'This member does not belong to this team.');
            }
        });
    }
}
