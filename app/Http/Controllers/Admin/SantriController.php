<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\StoreSantriRequest;
use App\Http\Requests\UpdateSantriRequest;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'jenis_kelamin', 'kelas']);

        $santris = Santri::when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', '%'.$search.'%')
                    ->orWhere('nama', 'like', '%'.$search.'%')
                    ->orWhere('kelas', 'like', '%'.$search.'%')
                    ->orWhere('program', 'like', '%'.$search.'%')
                    ->orWhere('status', 'like', '%'.$search.'%');
            });
        })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['jenis_kelamin'] ?? null, function ($query, $jk) {
                $query->where('jenis_kelamin', $jk);
            })
            ->when($filters['kelas'] ?? null, function ($query, $kelas) {
                $query->where('kelas', $kelas);
            })
            ->with('user')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Get unique kelas for filter dropdown
        $kelasList = Santri::select('kelas')->distinct()->orderBy('kelas')->pluck('kelas');

        return Inertia::render('Admin/Santri/Index', [
            'santris' => $santris,
            'filters' => $filters,
            'kelasList' => $kelasList,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Santri/Create');
    }

    public function store(StoreSantriRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $user = User::forceCreate([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => UserRole::Santri->value,
            ]);

            Santri::create([
                'user_id' => $user->id,
                'nis' => $validated['nis'],
                'nama' => $validated['nama'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'kelas' => $validated['kelas'],
                'program' => $validated['program'] ?? null,
                'status' => $validated['status'] ?? 'aktif',
                'email_wali' => $validated['email_wali'] ?? null,
                'telepon' => $validated['telepon'] ?? null,
            ]);
        });

        return redirect()->route('admin.santri.index')->with('success', 'Santri berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $santri = Santri::with('user')->findOrFail($id);

        return Inertia::render('Admin/Santri/Edit', [
            'santri' => $santri,
        ]);
    }

    public function update(UpdateSantriRequest $request, $id)
    {
        $santri = Santri::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($santri, $validated) {
            $santri->update([
                'nis' => $validated['nis'],
                'nama' => $validated['nama'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'kelas' => $validated['kelas'],
                'program' => $validated['program'] ?? null,
                'status' => $validated['status'],
                'email_wali' => $validated['email_wali'] ?? null,
                'telepon' => $validated['telepon'] ?? null,
            ]);

            $userData = ['name' => $validated['nama']];
            if (isset($validated['email'])) {
                $userData['email'] = $validated['email'];
            }

            if ($santri->user) {
                $santri->user->update($userData);
            }
        });

        return redirect()->route('admin.santri.index')->with('success', 'Data santri berhasil diperbarui.');
    }

    public function resetPassword(ResetUserPasswordRequest $request, int $id): RedirectResponse
    {
        $santri = Santri::with('user')->findOrFail($id);

        if ($santri->user) {
            $santri->user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()
            ->route('admin.santri.index')
            ->with('success', 'Password santri berhasil direset.');
    }

    public function destroy($id)
    {
        $santri = Santri::findOrFail($id);

        if ($santri->penilaians()->exists()) {
            return redirect()
                ->route('admin.santri.index')
                ->with('error', "Tidak dapat menghapus santri \"{$santri->nama}\" karena memiliki data penilaian. Ubah status santri menjadi alumni.");
        }

        DB::transaction(function () use ($santri) {
            $user = $santri->user;
            $santri->delete();
            if ($user) {
                $user->delete();
            }
        });

        return redirect()->route('admin.santri.index')->with('success', 'Data santri berhasil dihapus.');
    }
}
