<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'santri' && $this->user()->santri !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $assignment = $this->route('assignment');
            if (! $assignment) {
                return;
            }

            if (! $assignment->academicPeriod->is_active) {
                $validator->errors()->add('assignment_id', 'Cannot submit to an inactive academic period.');
            }

            if (! $assignment->isOpen()) {
                $validator->errors()->add('assignment_id', 'This assignment is not open for submissions.');
            }

            $santri = $this->user()->santri;
            if ($santri && $assignment->kelas !== $santri->kelas) {
                $validator->errors()->add('assignment_id', 'Assignment class does not match your class.');
            }
        });
    }
}
