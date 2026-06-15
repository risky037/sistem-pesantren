import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';

export default function JadwalEdit({ jadwal, ustadzs, subjects }) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: jadwal.user_id || '',
        subject_id: jadwal.subject_id || '',
        hari: jadwal.hari || 'Senin',
        jam_mulai: jadwal.jam_mulai ? jadwal.jam_mulai.substring(0, 5) : '',
        jam_selesai: jadwal.jam_selesai ? jadwal.jam_selesai.substring(0, 5) : '',
        kelas: jadwal.kelas || '',
        ruang: jadwal.ruang || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.jadwal.update', jadwal.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Jadwal" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.jadwal.index')} className="text-orange-600 hover:text-orange-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Jadwal Kelas</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ustadz</label>
                                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="">Pilih Ustadz</option>
                                    {ustadzs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <InputError message={errors.user_id} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                                <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="">Pilih Mapel</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                                </select>
                                <InputError message={errors.subject_id} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hari</label>
                                <select value={data.hari} onChange={e => setData('hari', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <InputError message={errors.hari} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                                <input type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.kelas} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mulai</label>
                                <input type="time" value={data.jam_mulai} onChange={e => setData('jam_mulai', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.jam_mulai} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Selesai</label>
                                <input type="time" value={data.jam_selesai} onChange={e => setData('jam_selesai', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.jam_selesai} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ruang</label>
                            <input type="text" value={data.ruang} onChange={e => setData('ruang', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            <InputError message={errors.ruang} className="mt-1" />
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Update'}
                            </button>
                            <Link href={route('admin.jadwal.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
