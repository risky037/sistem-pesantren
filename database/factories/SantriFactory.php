<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Santri>
 */
class SantriFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::factory()->make();
        $user->role = UserRole::Santri->value;
        $user->save();

        return [
            'user_id' => $user->id,
            'nis' => $this->faker->unique()->numerify('2024###'),
            'nama' => $this->faker->name(),
            'jenis_kelamin' => $this->faker->randomElement(['L', 'P']),
            'tanggal_lahir' => $this->faker->date(),
            'alamat' => $this->faker->address(),
            'kelas' => $this->faker->randomElement(['X-A', 'XI-A', 'XII-A']),
            'program' => $this->faker->randomElement(['Reguler', 'Tahfiz']),
            'status' => 'aktif',
            'email_wali' => $this->faker->optional()->safeEmail(),
            'telepon' => $this->faker->phoneNumber(),
        ];
    }
}
