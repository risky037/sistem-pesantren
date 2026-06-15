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

export default function SantriIndex({ santris, filters, kelasList }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
        status: filters?.status || '',
        jenis_kelamin: filters?.jenis_kelamin || '',
        kelas: filters?.kelas || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.santri.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('admin.santri.index'));
    };
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus santri "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.santri.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Santri" />
            
            <div className="space-y-6">
                <PageHeader 
                    title={<div className="flex items-center"><Icon name="users" className="w-7 h-7 mr-3 text-emerald-600" /> Manajemen Santri</div>} 
                    actionText="Tambah Santri" 
                    actionHref={route('admin.santri.create')} 
                />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari NIS, nama, kelas, program..."
                >
                    <FormSelect
                        value={data.kelas}
                        onChange={(e) => setData('kelas', e.target.value)}
                        className="w-full md:w-40"
                    >
                        <option value="">Semua Kelas</option>
                        {kelasList.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </FormSelect>
                    
                    <FormSelect
                        value={data.jenis_kelamin}
                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                        className="w-full md:w-40"
                    >
                        <option value="">Semua JK</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </FormSelect>

                    <FormSelect
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="w-full md:w-40"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="alumni">Alumni</option>
                        <option value="keluar">Keluar</option>
                    </FormSelect>
                </FilterBar>

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">NIS</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">JK</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {santris.data.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.nis}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{s.nama}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">{s.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold capitalize">{s.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('admin.santri.edit', s.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit ${s.nama}`}>
                                            <Icon name="edit" className="w-4 h-4 mr-1.5" /> Edit
                                        </Link>
                                        <button onClick={() => handleDelete(s.id, s.nama)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus ${s.nama}`}>
                                            <Icon name="trash" className="w-4 h-4 mr-1.5" /> Hapus
                                        </button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {santris.data.length === 0 && (
                            <EmptyState 
                                title="Data Santri Kosong" 
                                description={(filters?.search || filters?.status || filters?.jenis_kelamin || filters?.kelas) ? "Tidak ada santri yang cocok dengan pencarian/filter." : "Belum ada santri yang terdaftar."} 
                                colSpan={6} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={santris.links} />
            </div>
        </AdminLayout>
    );
}
