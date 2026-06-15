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
import FormSelect from '@/Components/FormSelect';
import { useForm } from '@inertiajs/react';

export default function JadwalIndex({ jadwals, filters, subjects, ustadzs }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
        hari: filters?.hari || '',
        subject_id: filters?.subject_id || '',
        user_id: filters?.user_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.jadwal.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('admin.jadwal.index'));
    };
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
                    title={<div className="flex items-center"><Icon name="calendar" className="w-7 h-7 mr-3 text-emerald-600" /> Jadwal Kelas</div>} 
                    actionText="Tambah Jadwal" 
                    actionHref={route('admin.jadwal.create')} 
                />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari jadwal, ustadz, ruang, kelas..."
                >
                    <FormSelect
                        value={data.hari}
                        onChange={(e) => setData('hari', e.target.value)}
                        className="w-full md:w-40"
                    >
                        <option value="">Semua Hari</option>
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </FormSelect>
                    
                    <FormSelect
                        value={data.subject_id}
                        onChange={(e) => setData('subject_id', e.target.value)}
                        className="w-full md:w-48"
                    >
                        <option value="">Semua Mapel</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                        ))}
                    </FormSelect>

                    <FormSelect
                        value={data.user_id}
                        onChange={(e) => setData('user_id', e.target.value)}
                        className="w-full md:w-48"
                    >
                        <option value="">Semua Ustadz</option>
                        {ustadzs.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </FormSelect>
                </FilterBar>

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
                                        <Link href={route('admin.jadwal.edit', j.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit Jadwal`}>
                                            <Icon name="edit" className="w-4 h-4 mr-1.5" /> Edit
                                        </Link>
                                        <button onClick={() => handleDelete(j.id)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus Jadwal`}>
                                            <Icon name="trash" className="w-4 h-4 mr-1.5" /> Hapus
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {jadwals.data.length === 0 && (
                            <EmptyState 
                                title="Data Jadwal Kosong" 
                                description={(filters?.search || filters?.hari || filters?.subject_id || filters?.user_id) ? "Tidak ada jadwal yang cocok dengan pencarian/filter." : "Belum ada jadwal yang terdaftar."} 
                                colSpan={7} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={jadwals.links} />
            </div>
        </AdminLayout>
    );
}
