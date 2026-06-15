import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function JadwalEdit() {
    return (
        <AdminLayout>
            <Head title="Edit Jadwal" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.jadwal.index')} className="text-orange-600 hover:text-orange-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Jadwal Kelas</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Hari</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>Senin</option><option>Selasa</option><option>Rabu</option><option>Kamis</option><option>Jumat</option></select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>XII-A</option><option>XII-B</option><option>XI-A</option></select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mulai</label><input type="time" defaultValue="08:00" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Jam Selesai</label><input type="time" defaultValue="09:30" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Mapel</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>Fiqih</option><option>Al-Qur'an</option></select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Dosen</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>Ahmad Hidayat</option><option>Siti Nurhaliza</option></select></div>
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Update</button>
                            <Link href={route('admin.jadwal.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
