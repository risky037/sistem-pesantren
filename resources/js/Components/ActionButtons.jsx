export default function ActionButtons({ children }) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {children}
        </div>
    );
}
