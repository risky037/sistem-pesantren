import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Index({ periods, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.academic-period.index'), { search }, { preserveState: true });
    };

    const deletePeriod = (id) => {
        Swal.fire({
            title: 'Hapus Tahun Ajaran?',
            text: 'Data yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.academic-period.destroy', id));
            }
        });
    };

    const activatePeriod = (id) => {
        Swal.fire({
            title: 'Aktifkan Tahun Ajaran?',
            text: 'Ini akan menonaktifkan tahun ajaran sebelumnya secara otomatis.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ya, aktifkan!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.academic-period.activate', id));
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Tahun Ajaran</h2>}>
            <Head title="Manajemen Tahun Ajaran" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {flash.success && <div className="mb-4 text-green-600 bg-green-100 p-3 rounded">{flash.success}</div>}
                            {flash.error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{flash.error}</div>}
                            
                            <div className="flex justify-between items-center mb-6">
                                <Link href={route('admin.academic-period.create')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Tambah Tahun Ajaran
                                </Link>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Cari..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="border-gray-300 rounded-md shadow-sm"
                                    />
                                    <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md">Cari</button>
                                </form>
                            </div>
                            
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun Ajaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mulai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selesai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {periods.data.map((period) => (
                                        <tr key={period.id}>
                                            <td className="px-6 py-4">{period.tahun_ajaran}</td>
                                            <td className="px-6 py-4">{period.semester}</td>
                                            <td className="px-6 py-4">
                                                {period.is_active ? (
                                                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">Aktif</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded-full">Non-Aktif</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{period.started_at || '-'}</td>
                                            <td className="px-6 py-4">{period.ended_at || '-'}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Link href={route('admin.academic-period.edit', period.id)} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                                {!period.is_active && (
                                                    <>
                                                        <button onClick={() => activatePeriod(period.id)} className="text-green-600 hover:text-green-900">Aktifkan</button>
                                                        <button onClick={() => deletePeriod(period.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
