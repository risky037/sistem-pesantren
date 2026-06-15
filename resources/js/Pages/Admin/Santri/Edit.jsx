import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function SantriEdit() {
    return (
        <AdminLayout>
            <Head title="Edit Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.santri.index')} className="text-green-600 hover:text-green-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Data Santri</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label><input type="text" defaultValue="Muhammad Rafiqi" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">NIM</label><input type="text" defaultValue="2024001" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label><input type="date" defaultValue="2005-05-10" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Program Studi</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>Tahfiz Qur'an</option><option>Hafalan & Tilawah</option><option>Program Reguler</option></select></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" defaultValue="rafiqi@pesantren.id" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Update</button>
                            <Link href={route('admin.santri.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
