import { Head, Link, useForm } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';

export default function PenilaianInput({ subject, santris, existingGrades }) {
    // Initialize grades from existing data or empty
    const initialGrades = (santris ?? []).map(s => {
        const existing = existingGrades?.[s.id];
        return {
            santri_id: s.id,
            tugas: existing?.tugas ?? '',
            uts: existing?.uts ?? '',
            uas: existing?.uas ?? '',
        };
    });

    const { data, setData, post, processing, errors } = useForm({
        grades: initialGrades,
    });

    const updateGrade = (index, field, value) => {
        const updated = [...data.grades];
        updated[index] = { ...updated[index], [field]: value };
        setData('grades', updated);
    };

    const calcAvg = (grade) => {
        const vals = [grade.tugas, grade.uts, grade.uas].filter(v => v !== '' && v !== null && v !== undefined).map(Number);
        if (vals.length === 0) return '-';
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('ustadz.penilaian.store', subject.id));
    };

    return (
        <UstadzLayout>
            <Head title="Input Penilaian" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('ustadz.penilaian.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Penilaian">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Input Penilaian - {subject.nama_mapel}</h1>
                </div>

                {errors.grades && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert"><p className="font-medium">Kesalahan Input</p><p className="text-sm">{errors.grades}</p></div>}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={submit}>
                        <DataTableWrapper>
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama Santri</th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Tugas</th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">UTS</th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">UAS</th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {(santris ?? []).map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{s.nama} <span className="text-slate-400 text-xs font-normal">({s.nis})</span></td>
                                        <td className="px-6 py-4">
                                            <TextInput type="number" min="0" max="100" value={data.grades[idx]?.tugas ?? ''} onChange={e => updateGrade(idx, 'tugas', e.target.value)} className="w-20 text-center mx-auto block" aria-label={`Nilai Tugas ${s.nama}`} />
                                            <InputError message={errors[`grades.${idx}.tugas`]} className="mt-1 text-center" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <TextInput type="number" min="0" max="100" value={data.grades[idx]?.uts ?? ''} onChange={e => updateGrade(idx, 'uts', e.target.value)} className="w-20 text-center mx-auto block" aria-label={`Nilai UTS ${s.nama}`} />
                                            <InputError message={errors[`grades.${idx}.uts`]} className="mt-1 text-center" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <TextInput type="number" min="0" max="100" value={data.grades[idx]?.uas ?? ''} onChange={e => updateGrade(idx, 'uas', e.target.value)} className="w-20 text-center mx-auto block" aria-label={`Nilai UAS ${s.nama}`} />
                                            <InputError message={errors[`grades.${idx}.uas`]} className="mt-1 text-center" />
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{calcAvg(data.grades[idx] || {})}</td>
                                    </tr>
                                ))}
                                {(!santris || santris.length === 0) && (
                                    <EmptyState title="Tidak Ada Santri" description="Tidak ada santri untuk mapel ini." colSpan={5} />
                                )}
                            </tbody>
                        </DataTableWrapper>

                        <div className="p-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100 bg-gray-50">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan Nilai'}
                            </PrimaryButton>
                            <Link href={route('ustadz.penilaian.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    ❌ Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
