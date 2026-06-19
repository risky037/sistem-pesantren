import { Head } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import Icon from '@/Components/Icon';
import FilterBar from '@/Components/FilterBar';
import FormSelect from '@/Components/FormSelect';
import { useForm, router } from '@inertiajs/react';

export default function JadwalIndex({ jadwals, filters, subjects }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
        hari: filters?.hari || '',
        subject_id: filters?.subject_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('ustadz.jadwal.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('ustadz.jadwal.index'));
    };
    return (
        <UstadzLayout>
            <Head title="Jadwal Mengajar" />
            
            <div className="space-y-6">
                <PageHeader title={<div className="flex items-center"><Icon name="calendar" className="w-7 h-7 mr-3 text-emerald-600" /> Jadwal Mengajar Saya</div>} />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari jadwal, ruang, kelas..."
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
                </FilterBar>

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Hari</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Jam</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Mapel</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Ruang</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {jadwals.data.map((j) => (
                            <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{j.hari}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{j.jam_mulai?.substring(0,5)} - {j.jam_selesai?.substring(0,5)}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{j.subject?.nama_mapel}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">{j.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{j.ruang || '-'}</td>
                            </tr>
                        ))}
                        {jadwals.data.length === 0 && (
                            <EmptyState 
                                title="Jadwal Kosong" 
                                description={(filters?.search || filters?.hari || filters?.subject_id) ? "Tidak ada jadwal yang cocok dengan pencarian/filter." : "Belum ada jadwal mengajar."} 
                                colSpan={5} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={jadwals.links} />
            </div>
        </UstadzLayout>
    );
}
