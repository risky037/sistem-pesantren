import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';
import FilterBar from '@/Components/FilterBar';
import { useForm, router } from '@inertiajs/react';

export default function PenilaianIndex({ summary, filters }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('ustadz.penilaian.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('ustadz.penilaian.index'));
    };
    return (
        <UstadzLayout>
            <Head title="Penilaian" />
            
            <div className="space-y-6">
                <PageHeader title={<div className="flex items-center"><Icon name="check" className="w-7 h-7 mr-3 text-emerald-600" /> Manajemen Penilaian</div>} />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari mapel atau kelas..."
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Mata Pelajaran</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Total Santri</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Sudah Dinilai</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {(summary ?? []).map((s) => {
                            const pct = s.totalSantri > 0 ? Math.round((s.gradedSantri / s.totalSantri) * 100) : 0;
                            return (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{s.nama_mapel}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{(s.kelas ?? []).join(', ')}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{s.totalSantri}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">{s.gradedSantri}/{s.totalSantri}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${pct}%`}}></div>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{pct}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ActionButtons>
                                            <Link href={route('ustadz.penilaian.input', s.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Input Nilai ${s.nama_mapel}`}>
                                                <Icon name="edit" className="w-4 h-4 mr-1.5" /> Input Nilai
                                            </Link>
                                        </ActionButtons>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!summary || summary.length === 0) && (
                            <EmptyState 
                                title="Data Mapel Kosong" 
                                description={filters?.search ? "Tidak ada mapel yang cocok dengan pencarian." : "Belum ada mata pelajaran yang diampu."} 
                                colSpan={6} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>
            </div>
        </UstadzLayout>
    );
}
