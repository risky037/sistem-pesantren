import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';

export default function JadwalIndex({ jadwals }) {
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus jadwal ini?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.jadwal.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Jadwal Kelas" />
            
            <div className="space-y-6">
                <PageHeader 
                    title="📅 Jadwal Kelas" 
                    actionText="Tambah Jadwal" 
                    actionHref={route('admin.jadwal.create')} 
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Hari</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Jam</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Mapel</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Ustadz</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Ruang</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {jadwals.data.map((j) => (
                            <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{j.hari}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{j.jam_mulai?.substring(0,5)} - {j.jam_selesai?.substring(0,5)}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{j.subject?.nama_mapel}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{j.ustadz?.name}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">{j.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{j.ruang || '-'}</td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('admin.jadwal.edit', j.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit Jadwal`}>✏️ Edit</Link>
                                        <button onClick={() => handleDelete(j.id)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus Jadwal`}>🗑️ Hapus</button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {jadwals.data.length === 0 && (
                            <EmptyState title="Data Jadwal Kosong" description="Belum ada jadwal yang terdaftar." colSpan={7} />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={jadwals.links} />
            </div>
        </AdminLayout>
    );
}
