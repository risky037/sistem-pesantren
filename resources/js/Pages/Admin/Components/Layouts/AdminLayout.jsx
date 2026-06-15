import { usePage } from '@inertiajs/react';
// Import Sidebar khusus Admin dari folder terdekat
import Sidebar from '../Sidebar'; 

export default function AdminLayout({ children }) {
    const page = usePage();
    const user = page?.props?.auth?.user;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Panggil Sidebar Admin */}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/* Header Sederhana */}
                <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800">Sistem Pesantren</h2>
                    <div className="text-sm text-gray-600">
                        Login sebagai: <span className="font-bold">{user?.name || 'User'}</span>
                    </div>
                </header>

                {/* Konten Halaman */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}