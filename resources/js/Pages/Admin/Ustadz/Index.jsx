import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';

export default function UstadzIndex({ ustadzs }) {
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
                router.delete(route('ustadz.destroy', id), {
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

    return (
        <AdminLayout>
            <Head title="Kelola Ustadz" />
            
            <div className="space-y-6">
                <PageHeader 
                    title={<div className="flex items-center"><Icon name="teacher" className="w-7 h-7 mr-3 text-emerald-600" /> Manajemen Ustadz</div>} 
                    actionText="Tambah Ustadz" 
                    actionHref={route('ustadz.create')} // Rute disesuaikan
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">No</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {ustadzs.data.map((u, idx) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{ustadzs.from + idx}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{u.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        {/* Rute disesuaikan */}
                                        <Link href={route('ustadz.edit', u.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit ${u.name}`}>
                                            <Icon name="edit" className="w-4 h-4 mr-1.5" /> Edit
                                        </Link>
                                        <button onClick={() => handleDelete(u.id, u.name)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus ${u.name}`}>
                                            <Icon name="trash" className="w-4 h-4 mr-1.5" /> Hapus
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {ustadzs.data.length === 0 && (
                            <EmptyState title="Data Ustadz Kosong" description="Belum ada ustadz yang terdaftar." colSpan={4} />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={ustadzs.links} />
            </div>
        </AdminLayout>
    );
}