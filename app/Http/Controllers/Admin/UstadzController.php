<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\StoreUstadzRequest;
use App\Http\Requests\UpdateUstadzRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UstadzController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $ustadzs = User::where('role', UserRole::Ustadz->value)
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Ustadz/Index', [
            'ustadzs' => $ustadzs,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Ustadz/Create');
    }

    public function store(StoreUstadzRequest $request)
    {
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => UserRole::Ustadz->value,
        ]);

        return redirect()->route('admin.ustadz.index')->with('success', 'Ustadz berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        return Inertia::render('Admin/Ustadz/Edit', [
            'ustadz' => $ustadz,
        ]);
    }

    public function update(UpdateUstadzRequest $request, $id)
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        $ustadz->update($data);

        return redirect()->route('admin.ustadz.index')->with('success', 'Data ustadz berhasil diperbarui.');
    }

    /**
     * Reset the password for a managed Ustadz account.
     *
     * This action is restricted to Administrators via the `role:admin` middleware.
     * No plaintext password is stored or logged. The new password is hashed
     * immediately before persisting. The Admin communicates the new credential
     * to the account holder via institutional channels.
     */
    public function resetPassword(ResetUserPasswordRequest $request, int $id): RedirectResponse
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        $ustadz->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()
            ->route('admin.ustadz.index')
            ->with('success', 'Password ustadz berhasil direset.');
    }

    public function deactivate(int $id): RedirectResponse
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        $ustadz->update(['is_active' => false]);

        return redirect()
            ->route('admin.ustadz.index')
            ->with('success', "Akun ustadz \"{$ustadz->name}\" berhasil dinonaktifkan.");
    }

    public function reactivate(int $id): RedirectResponse
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        $ustadz->update(['is_active' => true]);

        return redirect()
            ->route('admin.ustadz.index')
            ->with('success', "Akun ustadz \"{$ustadz->name}\" berhasil diaktifkan kembali.");
    }

    public function destroy($id)
    {
        $ustadz = User::where('role', UserRole::Ustadz->value)->findOrFail($id);

        $hasDependents = $ustadz->jadwals()->exists()
            || $ustadz->materis()->exists()
            || $ustadz->penilaians()->exists();

        if ($hasDependents) {
            return redirect()
                ->route('admin.ustadz.index')
                ->with('error', "Tidak dapat menghapus ustadz \"{$ustadz->name}\" karena memiliki data akademik. Gunakan fitur nonaktifkan akun.");
        }

        $ustadz->delete();

        return redirect()->route('admin.ustadz.index')->with('success', 'Ustadz berhasil dihapus.');
    }
}
