import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function MateriIndex() {
    const materiData = [
        { id: 1, judul: 'Rukun Islam', tanggal: '2024-01-15', kelas: 'XII-A', file: 'rukun-islam.pdf' },
        { id: 2, judul: 'Fiqih Ibadah', tanggal: '2024-01-20', kelas: 'XII-B', file: 'fiqih-ibadah.pdf' },
        { id: 3, judul: 'Akidah Tawhid', tanggal: '2024-01-25', kelas: 'XI-A', file: 'akidah.pdf' },
    ];

    return (
        <UstadzLayout>
            <Head title="Materi Ajar" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Materi Ajar Saya</h1>
                    <Link href={route('ustadz.materi.create')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg">
                        ➕ Tambah Materi
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Materi</p>
                        <p className="text-3xl font-bold text-emerald-600">{materiData.length}</p>
                    </div>
                    <div className="bg-teal-50 border-l-4 border-teal-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Bulan Ini</p>
                        <p className="text-3xl font-bold text-teal-600">3</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Judul Materi</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Tanggal Upload</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {materiData.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{m.judul}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{m.kelas}</span></td>
                                    <td className="px-6 py-4 text-gray-600">{m.tanggal}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Link href={route('ustadz.materi.edit', m.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">✏️</Link>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UstadzLayout>
    );
}
