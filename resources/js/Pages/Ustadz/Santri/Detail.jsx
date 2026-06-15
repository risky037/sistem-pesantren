import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Icon from '@/Components/Icon';

export default function SantriDetail({ santri, penilaians }) {
    return (
        <UstadzLayout>
            <Head title="Detail Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.santri.index')} className="text-cyan-600 hover:text-cyan-800 flex items-center">
                        <Icon name="back" className="w-4 h-4 mr-1" /> Kembali
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Detail Santri</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Icon name="profile" className="w-6 h-6 mr-2 text-gray-500" /> Informasi Pribadi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><p className="text-gray-600 text-sm">Nama</p><p className="font-semibold text-gray-900">{santri.nama}</p></div>
                                <div><p className="text-gray-600 text-sm">NIS</p><p className="font-semibold text-gray-900">{santri.nis}</p></div>
                                <div><p className="text-gray-600 text-sm">Kelas</p><p className="font-semibold text-gray-900">{santri.kelas}</p></div>
                                <div><p className="text-gray-600 text-sm">Jenis Kelamin</p><p className="font-semibold text-gray-900">{santri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
                                <div><p className="text-gray-600 text-sm">Program</p><p className="font-semibold text-gray-900">{santri.program || '-'}</p></div>
                                <div><p className="text-gray-600 text-sm">Status</p><p className="font-semibold text-gray-900 capitalize">{santri.status}</p></div>
                                {santri.email && <div><p className="text-gray-600 text-sm">Email</p><p className="font-semibold text-gray-900">{santri.email}</p></div>}
                                {santri.telepon && <div><p className="text-gray-600 text-sm">Telepon</p><p className="font-semibold text-gray-900">{santri.telepon}</p></div>}
                            </div>
                        </div>

                        {penilaians && penilaians.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <Icon name="check" className="w-6 h-6 mr-2 text-gray-500" /> Nilai
                                </h2>
                                <div className="space-y-3">
                                    {penilaians.map((p) => (
                                        <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-gray-900">{p.subject?.nama_mapel}</span>
                                                <span className="text-lg font-bold text-blue-600">{p.nilai_akhir ?? '-'}</span>
                                            </div>
                                            <div className="flex gap-6 text-sm text-gray-600">
                                                <span>Tugas: <strong>{p.tugas ?? '-'}</strong></span>
                                                <span>UTS: <strong>{p.uts ?? '-'}</strong></span>
                                                <span>UAS: <strong>{p.uas ?? '-'}</strong></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Icon name="dashboard" className="w-6 h-6 mr-2 text-gray-500" /> Ringkasan
                        </h2>
                        <div className="space-y-4">
                            <div className="text-center">
                                {penilaians && penilaians.length > 0 ? (
                                    <>
                                        <p className="text-4xl font-bold text-blue-600">
                                            {(penilaians.reduce((sum, p) => sum + (parseFloat(p.nilai_akhir) || 0), 0) / penilaians.length).toFixed(1)}
                                        </p>
                                        <p className="text-gray-600 text-sm">Rata-rata Nilai</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Belum ada data nilai</p>
                                )}
                            </div>
                            <div className={`rounded p-3 border ${penilaians && penilaians.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <p className={`font-semibold text-center flex items-center justify-center ${penilaians && penilaians.length > 0 ? 'text-green-800' : 'text-gray-500'}`}>
                                    {penilaians && penilaians.length > 0 ? <><Icon name="check" className="w-4 h-4 mr-1.5" /> Data Tersedia</> : <><Icon name="edit" className="w-4 h-4 mr-1.5" /> Belum Dinilai</>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
