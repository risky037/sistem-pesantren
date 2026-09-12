import { Head, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import AdminLayout from '@/Pages/Admin/Components/Layouts/AdminLayout';
import UstadzLayout from '@/Pages/Ustadz/Components/Layouts/UstadzLayout';

export default function Edit({ status }) {
    const user = usePage().props.auth.user;
    const Layout = user?.role === 'admin' ? AdminLayout : UstadzLayout;

    return (
        <Layout>
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdateProfileInformationForm
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
