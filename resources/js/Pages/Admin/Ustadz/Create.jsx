import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function UstadzCreate() {
    return (
        <AdminLayout>
            <Head title="Tambah Ustadz" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.ustadz.index')} className="text-blue-600 hover:text-blue-800">
                        ← Kembali
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Ustadz Baru</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Masukkan nama ustadz" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">NIP</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Nomor Induk Pegawai" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Email ustadz" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                                    <option>Pilih Mata Pelajaran</option>
                                    <option>Fiqih</option>
                                    <option>Al-Qur'an</option>
                                    <option>Hadis</option>
                                    <option>Akidah</option>
                                    <option>Bahasa Arab</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                                    <option>Aktif</option>
                                    <option>Cuti</option>
                                    <option>Tidak Aktif</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                            <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Nomor telepon ustadz" />
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition">
                                💾 Simpan
                            </button>
                            <Link href={route('admin.ustadz.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">
                                ❌ Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
