import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function MateriCreate() {
    return (
        <UstadzLayout>
            <Head title="Tambah Materi" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.materi.index')} className="text-emerald-600 hover:text-emerald-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Materi Ajar</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Judul Materi</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Judul materi pembelajaran" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option>XII-A</option><option>XII-B</option><option>XI-A</option></select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label><input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Materi</label><textarea className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="4" placeholder="Deskripsi materi pembelajaran"></textarea></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label><input type="file" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Simpan</button>
                            <Link href={route('ustadz.materi.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
