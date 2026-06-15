import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';

export default function PenilaianIndex({ summary }) {
    return (
        <UstadzLayout>
            <Head title="Penilaian" />
            
            <div className="space-y-6">
                <PageHeader title="⭐ Manajemen Penilaian" />

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
                                            <Link href={route('ustadz.penilaian.input', s.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Input Nilai ${s.nama_mapel}`}>✏️ Input Nilai</Link>
                                        </ActionButtons>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!summary || summary.length === 0) && (
                            <EmptyState title="Data Mapel Kosong" description="Belum ada mata pelajaran yang diampu." colSpan={6} />
                        )}
                    </tbody>
                </DataTableWrapper>
            </div>
        </UstadzLayout>
    );
}
