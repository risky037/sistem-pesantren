import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';

export default function JadwalCreate({ ustadzs, subjects }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        subject_id: '',
        hari: 'Senin',
        jam_mulai: '',
        jam_selesai: '',
        kelas: '',
        ruang: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Menggunakan rute jadwal.store sesuai dengan web.php
        post(route('jadwal.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Jadwal" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    {/* Menggunakan rute jadwal.index sesuai dengan web.php */}
                    <Link href={route('jadwal.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Jadwal">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Tambah Jadwal Kelas</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-5xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="user_id" value="Ustadz" />
                                <FormSelect id="user_id" value={data.user_id} onChange={e => setData('user_id', e.target.value)} className="mt-1 block w-full">
                                    <option value="">Pilih Ustadz</option>
                                    {ustadzs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </FormSelect>
                                <InputError message={errors.user_id} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <FormSelect id="subject_id" value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="mt-1 block w-full">
                                    <option value="">Pilih Mapel</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                                </FormSelect>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="hari" value="Hari" />
                                <FormSelect id="hari" value={data.hari} onChange={e => setData('hari', e.target.value)} className="mt-1 block w-full">
                                    {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                                </FormSelect>
                                <InputError message={errors.hari} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="kelas" value="Kelas" />
                                <TextInput id="kelas" type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="mt-1 block w-full" placeholder="XII-A" />
                                <InputError message={errors.kelas} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="jam_mulai" value="Jam Mulai" />
                                <TextInput id="jam_mulai" type="time" value={data.jam_mulai} onChange={e => setData('jam_mulai', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.jam_mulai} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="jam_selesai" value="Jam Selesai" />
                                <TextInput id="jam_selesai" type="time" value={data.jam_selesai} onChange={e => setData('jam_selesai', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.jam_selesai} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="ruang" value="Ruang" />
                            <TextInput id="ruang" type="text" value={data.ruang} onChange={e => setData('ruang', e.target.value)} className="mt-1 block w-full" placeholder="Ruang 1 (opsional)" />
                            <InputError message={errors.ruang} className="mt-2" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? (
                                    <><Icon name="spinner" className="w-5 h-5 mr-2" /> Menyimpan...</>
                                ) : (
                                    <><Icon name="save" className="w-5 h-5 mr-2" /> Simpan Data</>
                                )}
                            </PrimaryButton>
                            {/* Menggunakan rute jadwal.index sesuai dengan web.php */}
                            <Link href={route('jadwal.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    <Icon name="cancel" className="w-5 h-5 mr-2" />
                                    Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}