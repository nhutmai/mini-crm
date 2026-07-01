<?php

namespace App\Http\Requests;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $team instanceof Team && (bool) $this->user()?->can('addMember', $team);
    }

    public function rules(): array
    {
        return [
            'member_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('status', User::STATUS_ACTIVE),
            ],
            'transfer' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $team = $this->route('team');
            $member = User::query()->find($this->input('member_id'));

            if (! $team instanceof Team || ! $member) {
                return;
            }

            if ($member->team_id === $team->id) {
                $validator->errors()->add('member_id', 'This member is already in this team.');

                return;
            }

            if ($member->team_id !== null && ! $this->boolean('transfer')) {
                $validator->errors()->add(
                    'transfer',
                    'Confirm transfer to move this member from their current team.',
                );
            }
        });
    }
}
