<?php

namespace App\Http\Requests;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $team instanceof Team && (bool) $this->user()?->can('updateLead', $team);
    }

    public function rules(): array
    {
        return [
            'lead_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')
                    ->where('team_id', $this->route('team')?->id)
                    ->where('status', User::STATUS_ACTIVE),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'lead_id.exists' => 'The selected lead must be an active member of this team.',
        ];
    }
}
