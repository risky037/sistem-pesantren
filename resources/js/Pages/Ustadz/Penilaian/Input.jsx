import { Head, Link, useForm } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';

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
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.penilaian.index')} className="text-amber-600 hover:text-amber-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Input Penilaian - {subject.nama_mapel}</h1>
                </div>

                {errors.grades && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{errors.grades}</div>}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={submit}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Santri</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Tugas</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">UTS</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">UAS</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rata-rata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {(santris ?? []).map((s, idx) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{s.nama} <span className="text-gray-400 text-xs">({s.nis})</span></td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="number" min="0" max="100" value={data.grades[idx]?.tugas ?? ''} onChange={e => updateGrade(idx, 'tugas', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 text-center" />
                                                <InputError message={errors[`grades.${idx}.tugas`]} className="mt-1" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="number" min="0" max="100" value={data.grades[idx]?.uts ?? ''} onChange={e => updateGrade(idx, 'uts', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 text-center" />
                                                <InputError message={errors[`grades.${idx}.uts`]} className="mt-1" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="number" min="0" max="100" value={data.grades[idx]?.uas ?? ''} onChange={e => updateGrade(idx, 'uas', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 text-center" />
                                                <InputError message={errors[`grades.${idx}.uas`]} className="mt-1" />
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-blue-600">{calcAvg(data.grades[idx] || {})}</td>
                                        </tr>
                                    ))}
                                    {(!santris || santris.length === 0) && (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada santri untuk mapel ini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan Nilai'}
                            </button>
                            <Link href={route('ustadz.penilaian.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
