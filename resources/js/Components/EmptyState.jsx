export default function EmptyState({ title = 'Tidak Ada Data', description = 'Belum ada data yang tersedia.', colSpan = 100 }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <span className="text-2xl opacity-50">📂</span>
                    </div>
                    <div>
                        <p className="text-gray-900 font-medium">{title}</p>
                        <p className="text-gray-500 text-sm mt-1">{description}</p>
                    </div>
                </div>
            </td>
        </tr>
    );
}
