import { Head } from '@inertiajs/react';
import SantriLayout from './Components/Layouts/SantriLayout';
import Icon from '@/Components/Icon';

export default function Grades({ grades }) {
    
    // Group grades by academic period for a cleaner display
    const groupedGrades = (grades || []).reduce((acc, grade) => {
        const periodKey = grade.academic_period 
            ? `${grade.academic_period.tahun_ajaran} - ${grade.academic_period.semester}` 
            : 'Periode Tidak Diketahui';
        
        if (!acc[periodKey]) {
            acc[periodKey] = [];
        }
        acc[periodKey].push(grade);
        return acc;
    }, {});

    const periodKeys = Object.keys(groupedGrades).sort().reverse(); // Show newest first ideally

    return (
        <SantriLayout>
            <Head title="Nilai Akademik" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Nilai Akademik</h2>
                        <p className="text-sm text-gray-500 mt-1">Transkrip nilai untuk setiap mata pelajaran.</p>
                    </div>
                </div>

                {periodKeys.length > 0 ? (
                    periodKeys.map((periodKey) => (
                        <div key={periodKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Icon name="book" className="w-5 h-5 text-emerald-600" />
                                    {periodKey}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-white border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Mata Pelajaran</th>
                                            <th className="px-6 py-4 font-bold text-center">Tugas</th>
                                            <th className="px-6 py-4 font-bold text-center">UTS</th>
                                            <th className="px-6 py-4 font-bold text-center">UAS</th>
                                            <th className="px-6 py-4 font-bold text-center">Nilai Akhir</th>
                                            <th className="px-6 py-4 font-bold">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupedGrades[periodKey].map((grade) => (
                                            <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {grade.subject?.nama_mapel}
                                                    <div className="text-xs text-slate-500 font-normal mt-0.5">Pengajar: {grade.ustadz?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-slate-700">
                                                    {grade.tugas ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-slate-700">
                                                    {grade.uts ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-slate-700">
                                                    {grade.uas ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                                                        parseFloat(grade.nilai_akhir) >= 75 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : (grade.nilai_akhir ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200')
                                                    }`}>
                                                        {grade.nilai_akhir ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 italic">
                                                    {grade.catatan || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-slate-500">
                        <Icon name="check" className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-base font-medium">Belum ada catatan nilai akademik untuk Anda.</p>
                    </div>
                )}
            </div>
        </SantriLayout>
    );
}
