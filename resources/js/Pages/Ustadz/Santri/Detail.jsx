import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function SantriDetail() {
    return (
        <UstadzLayout>
            <Head title="Detail Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.santri.index')} className="text-cyan-600 hover:text-cyan-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Detail Santri</h1>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informasi Pribadi</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-gray-600 text-sm">Nama</p><p className="font-semibold text-gray-900">Ahmad Rizki</p></div>
                                <div><p className="text-gray-600 text-sm">NIM</p><p className="font-semibold text-gray-900">2024001</p></div>
                                <div><p className="text-gray-600 text-sm">Kelas</p><p className="font-semibold text-gray-900">XII-A</p></div>
                                <div><p className="text-gray-600 text-sm">Tahun Masuk</p><p className="font-semibold text-gray-900">2023</p></div>
                                <div><p className="text-gray-600 text-sm">Email</p><p className="font-semibold text-gray-900">ahmad@pesantren.id</p></div>
                                <div><p className="text-gray-600 text-sm">Telepon</p><p className="font-semibold text-gray-900">081234567890</p></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Nilai Mapel Ini</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-gray-700">UTS</span><span className="font-semibold text-lg text-blue-600">85</span></div>
                                <div className="flex justify-between"><span className="text-gray-700">UAS</span><span className="font-semibold text-lg text-blue-600">88</span></div>
                                <div className="flex justify-between"><span className="text-gray-700">Tugas</span><span className="font-semibold text-lg text-blue-600">90</span></div>
                                <div className="border-t pt-3 flex justify-between"><span className="font-semibold text-gray-900">Nilai Akhir</span><span className="font-semibold text-lg text-green-600">87</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Ringkasan</h2>
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-blue-600">87</p>
                                <p className="text-gray-600 text-sm">Rata-rata Nilai</p>
                            </div>
                            <div className="bg-green-50 rounded p-3 border border-green-200">
                                <p className="text-green-800 font-semibold text-center">✅ Tuntas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
