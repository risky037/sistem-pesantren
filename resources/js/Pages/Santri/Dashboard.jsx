import { Head } from '@inertiajs/react';
import SantriLayout from './Components/Layouts/SantriLayout';
import Icon from '@/Components/Icon';

export default function Dashboard({ santri, auth }) {
    return (
        <SantriLayout>
            <Head title="Dashboard Santri" />

            <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-8 text-white shadow-sm border border-emerald-900/10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Ahlan wa Sahlan, {auth.user.name}</h1>
                    <p className="text-emerald-50 text-lg">Portal Santri Sistem Informasi Akademik Pesantren</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="profile" className="w-6 h-6 text-slate-500" /> Profil Santri
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Nomor Induk Santri (NIS)</p>
                                <p className="text-lg font-semibold text-slate-900">{santri?.nis}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Kelas Saat Ini</p>
                                <p className="text-lg font-semibold text-slate-900">{santri?.kelas}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Program / Jurusan</p>
                                <p className="text-lg font-semibold text-slate-900">{santri?.program}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Status</p>
                                <p className="text-lg font-semibold text-slate-900">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {santri?.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SantriLayout>
    );
}
