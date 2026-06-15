import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';
import FilterBar from '@/Components/FilterBar';
import { useForm, router } from '@inertiajs/react';

export default function SantriIndex({ santris, filters }) {
    const { data, setData, get, reset } = useForm({
        search: filters?.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('ustadz.santri.index'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('ustadz.santri.index'));
    };
    return (
        <UstadzLayout>
            <Head title="Data Santri" />
            
            <div className="space-y-6">
                <PageHeader title={<div className="flex items-center"><Icon name="users" className="w-7 h-7 mr-3 text-emerald-600" /> Data Santri</div>} />

                <FilterBar 
                    searchQuery={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Cari NIS, nama, kelas, program..."
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">NIS</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {santris.data.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{s.nama}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{s.nis}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">{s.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold capitalize">{s.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('ustadz.santri.detail', s.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Detail Santri ${s.nama}`}>
                                            <Icon name="profile" className="w-4 h-4 mr-1.5" /> Detail
                                        </Link>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {santris.data.length === 0 && (
                            <EmptyState 
                                title="Data Santri Kosong" 
                                description={filters?.search ? "Tidak ada santri yang cocok dengan pencarian." : "Belum ada santri."} 
                                colSpan={5} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={santris.links} />
            </div>
        </UstadzLayout>
    );
}
