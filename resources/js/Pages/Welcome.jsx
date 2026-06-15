import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';

export default function Welcome({ auth }) {
    const user = auth?.user;

    return (
        <>
            <Head title="Selamat Datang" />
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                {/* Navbar */}
                <nav className="bg-white border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-3">
                                <img src="/logo.webp" alt="Logo Pesantren" className="h-10 w-auto" />
                                <span className="font-bold text-xl text-emerald-800 tracking-tight">Sistem Pesantren</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {user ? (
                                    <Link
                                        href={route(user.role === 'admin' ? 'admin.dashboard' : 'ustadz.dashboard')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-600 hover:text-emerald-700 font-medium px-4 py-2 transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        {/* Register is hidden by default in production, uncomment if needed */}
                                        {/* <Link href={route('register')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm">Daftar</Link> */}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-emerald-50/50 to-gray-50">
                    <div className="max-w-3xl space-y-8">
                        <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                            <img src="/logo.webp" alt="Icon" className="h-16 w-16 object-contain" />
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Manajemen Akademik <span className="text-emerald-600">Pesantren</span> Modern
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                            Platform digital terintegrasi untuk mengelola data santri, ustadz, mata pelajaran, jadwal, dan nilai secara cepat, aman, dan efisien.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            {user ? (
                                <Link
                                    href={route(user.role === 'admin' ? 'admin.dashboard' : 'ustadz.dashboard')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Masuk ke Dashboard →
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Mulai Sekarang
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-left">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="users" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Data Terpusat</h3>
                            <p className="text-gray-600">Kelola data santri dan ustadz dalam satu database yang aman dan mudah diakses kapan saja.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="calendar" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Penjadwalan Mudah</h3>
                            <p className="text-gray-600">Sistem jadwal mengajar yang dinamis untuk menghindari bentrok dan mengoptimalkan waktu.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <Icon name="dashboard" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Penilaian Digital</h3>
                            <p className="text-gray-600">Proses input nilai secara langsung oleh ustadz pengampu dengan perhitungan otomatis.</p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8">
                    <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Sistem Informasi Akademik Pesantren. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
