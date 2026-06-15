import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';

export default function SantriIndex({ santris }) {
    return (
        <UstadzLayout>
            <Head title="Data Santri" />
            
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">👥 Data Santri</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-cyan-500 to-cyan-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">NIS</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {santris.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{s.nama}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.nis}</td>
                                        <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{s.kelas}</span></td>
                                        <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">{s.status}</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={route('ustadz.santri.detail', s.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-xs font-semibold transition">👁️ Detail</Link>
                                        </td>
                                    </tr>
                                ))}
                                {santris.data.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada data santri.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={santris.links} />
            </div>
        </UstadzLayout>
    );
}
