import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function MateriEdit() {
    return (
        <UstadzLayout>
            <Head title="Edit Materi" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.materi.index')} className="text-emerald-600 hover:text-emerald-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Materi Ajar</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form className="space-y-6">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Judul Materi</label><input type="text" defaultValue="Rukun Islam" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2"><option selected>XII-A</option><option>XII-B</option></select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label><input type="date" defaultValue="2024-01-15" className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Materi</label><textarea className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="4" defaultValue="Materi tentang rukun islam..."></textarea></div>
                        <div className="flex gap-4 pt-6">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Update</button>
                            <Link href={route('ustadz.materi.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
