import { Head } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';

export default function JadwalIndex({ jadwals }) {
    return (
        <UstadzLayout>
            <Head title="Jadwal Mengajar" />
            
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">📅 Jadwal Mengajar Saya</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hari</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Jam</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mapel</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ruang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {jadwals.data.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{j.hari}</td>
                                        <td className="px-6 py-4 text-gray-600">{j.jam_mulai?.substring(0,5)} - {j.jam_selesai?.substring(0,5)}</td>
                                        <td className="px-6 py-4 text-gray-600">{j.subject?.nama_mapel}</td>
                                        <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{j.kelas}</span></td>
                                        <td className="px-6 py-4 text-gray-600">{j.ruang || '-'}</td>
                                    </tr>
                                ))}
                                {jadwals.data.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada jadwal mengajar.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={jadwals.links} />
            </div>
        </UstadzLayout>
    );
}
