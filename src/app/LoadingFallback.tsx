export default function LoadingFallback() {
    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
}
