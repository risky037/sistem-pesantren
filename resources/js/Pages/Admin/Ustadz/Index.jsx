import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';
import FilterBar from '@/Components/FilterBar';
import { useForm } from '@inertiajs/react';

export default function UstadzIndex({ ustadzs, filters }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.ustadz.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('admin.ustadz.index'));
    };
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus ustadz "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Rute disesuaikan dengan web.php
                router.delete(route('admin.ustadz.destroy', id), {
                    preserveScroll: true,
                    // Tambahkan onSuccess di sini untuk memunculkan popup berhasil
                    onSuccess: () => {
                        Swal.fire(
                            'Terhapus!',
                            `Data ustadz "${name}" berhasil dihapus.`,
                            'success'
                        );
                    }
                });
            }
        });
    };

    const handleDeactivate = (id, name) => {
        Swal.fire({
            title: 'Nonaktifkan Akun?',
            text: `Ustadz "${name}" tidak akan bisa login lagi, namun riwayat akademik akan tetap tersimpan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, nonaktifkan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.ustadz.deactivate', id), {}, {
                    preserveScroll: true
                });
            }
        });
    };

    const handleReactivate = (id) => {
        router.post(route('admin.ustadz.reactivate', id), {}, {
            preserveScroll: true
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ustadz" />
            
            <div className="space-y-6">
                <PageHeader 
                    title={<div className="flex items-center"><Icon name="teacher" className="w-7 h-7 mr-3 text-emerald-600" /> Manajemen Ustadz</div>} 
                    actionText="Tambah Ustadz" 
                    actionHref={route('admin.ustadz.create')} // Rute disesuaikan
                />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari nama atau email..."
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">No</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {ustadzs.data.map((u, idx) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{ustadzs.from + idx}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{u.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                                <td className="px-6 py-4 text-center">
                                    {u.is_active ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                            <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                            <span className="w-1.5 h-1.5 mr-1.5 bg-slate-500 rounded-full"></span>
                                            Nonaktif
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('admin.ustadz.edit', u.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit ${u.name}`}>
                                            <Icon name="edit" className="w-4 h-4 mr-1.5" /> Edit
                                        </Link>

                                        {u.is_active ? (
                                            <button onClick={() => handleDeactivate(u.id, u.name)} className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Nonaktifkan ${u.name}`}>
                                                <Icon name="xCircle" className="w-4 h-4 mr-1.5" /> Nonaktifkan
                                            </button>
                                        ) : (
                                            <button onClick={() => handleReactivate(u.id)} className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Aktifkan ${u.name}`}>
                                                <Icon name="check" className="w-4 h-4 mr-1.5" /> Aktifkan
                                            </button>
                                        )}

                                        <button onClick={() => handleDelete(u.id, u.name)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus ${u.name}`}>
                                            <Icon name="trash" className="w-4 h-4 mr-1.5" /> Hapus
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {ustadzs.data.length === 0 && (
                            <EmptyState 
                                title="Data Ustadz Kosong" 
                                description={filters?.search ? "Tidak ada ustadz yang cocok dengan pencarian." : "Belum ada ustadz yang terdaftar."}
                                colSpan={4} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={ustadzs.links} />
            </div>
        </AdminLayout>
    );
}