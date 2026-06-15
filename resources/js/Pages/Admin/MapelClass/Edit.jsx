import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function MapelEdit() {
    return (
        <AdminLayout>
            <Head title="Edit Mapel" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.mapel.index')} className="text-purple-600 hover:text-purple-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Mata Pelajaran</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kode Mapel</label><input type="text" defaultValue="FIQ001" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mapel</label><input type="text" defaultValue="Fiqih" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">SKS</label><input type="number" defaultValue="3" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Dosen</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>Ahmad Hidayat</option><option>Siti Nurhaliza</option></select></div>
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Update</button>
                            <Link href={route('admin.mapel.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
