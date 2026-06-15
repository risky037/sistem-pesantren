import { Head } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function JadwalIndex() {
    const jadwalData = [
        { id: 1, hari: 'Senin', jam: '08:00 - 09:30', mapel: 'Fiqih', kelas: 'XII-A', ruang: 'Ruang 1' },
        { id: 2, hari: 'Selasa', jam: '09:30 - 11:00', mapel: 'Fiqih', kelas: 'XII-B', ruang: 'Ruang 2' },
        { id: 3, hari: 'Rabu', jam: '13:00 - 14:30', mapel: 'Fiqih', kelas: 'XI-A', ruang: 'Ruang 3' },
        { id: 4, hari: 'Kamis', jam: '10:00 - 11:30', mapel: 'Fiqih', kelas: 'XI-B', ruang: 'Ruang 4' },
    ];

    return (
        <UstadzLayout>
            <Head title="Jadwal Mengajar" />
            
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">📅 Jadwal Mengajar Saya</h1>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Kelas</p>
                        <p className="text-3xl font-bold text-indigo-600">{jadwalData.length}</p>
                    </div>
                    <div className="bg-cyan-50 border-l-4 border-cyan-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Jam Mengajar/Minggu</p>
                        <p className="text-3xl font-bold text-cyan-600">6 jam</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hari</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Jam</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ruang</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jadwalData.map((j) => (
                                <tr key={j.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{j.hari}</td>
                                    <td className="px-6 py-4 text-gray-600">{j.jam}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{j.kelas}</span></td>
                                    <td className="px-6 py-4 text-gray-600">{j.ruang}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UstadzLayout>
    );
}
