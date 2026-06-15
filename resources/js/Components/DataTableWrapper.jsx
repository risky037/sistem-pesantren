export default function DataTableWrapper({ children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    {children}
                </table>
            </div>
        </div>
    );
}
