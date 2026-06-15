import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';

export default function MapelIndex({ subjects }) {
    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus mapel "${nama}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.mapel.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Mata Pelajaran" />
            
            <div className="space-y-6">
                <PageHeader 
                    title={<div className="flex items-center"><Icon name="book" className="w-7 h-7 mr-3 text-emerald-600" /> Mata Pelajaran</div>} 
                    actionText="Tambah Mapel" 
                    actionHref={route('admin.mapel.create')} 
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kode</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama Mapel</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Deskripsi</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {subjects.data.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.kode_mapel}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.nama_mapel}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{s.deskripsi || '-'}</td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('admin.mapel.edit', s.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit ${s.nama_mapel}`}>
                                            <Icon name="edit" className="w-4 h-4 mr-1.5" /> Edit
                                        </Link>
                                        <button onClick={() => handleDelete(s.id, s.nama_mapel)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus ${s.nama_mapel}`}>
                                            <Icon name="trash" className="w-4 h-4 mr-1.5" /> Hapus
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {subjects.data.length === 0 && (
                            <EmptyState title="Data Mapel Kosong" description="Belum ada mata pelajaran yang terdaftar." colSpan={4} />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={subjects.links} />
            </div>
        </AdminLayout>
    );
}
