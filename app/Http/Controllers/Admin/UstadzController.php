<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUstadzRequest;
use App\Http\Requests\UpdateUstadzRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UstadzController extends Controller
{
    public function index()
    {
        $ustadzs = User::where('role', 'ustadz')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Ustadz/Index', [
            'ustadzs' => $ustadzs,
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
            'role' => 'ustadz',
        ]);

        return redirect()->route('admin.ustadz.index')->with('success', 'Ustadz berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $ustadz = User::where('role', 'ustadz')->findOrFail($id);

        return Inertia::render('Admin/Ustadz/Edit', [
            'ustadz' => $ustadz,
        ]);
    }

    public function update(UpdateUstadzRequest $request, $id)
    {
        $ustadz = User::where('role', 'ustadz')->findOrFail($id);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $ustadz->update($data);

        return redirect()->route('admin.ustadz.index')->with('success', 'Data ustadz berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $ustadz = User::where('role', 'ustadz')->findOrFail($id);
        $ustadz->delete();

        return redirect()->route('admin.ustadz.index')->with('success', 'Ustadz berhasil dihapus.');
    }
}
