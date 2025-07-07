type StatCardProps = {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
};

export default function StatCard({ title, value, icon, className = '', variant = 'primary' }: StatCardProps) {
    const variantClasses = {
        primary: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        secondary: 'bg-gray-50 border-gray-100 text-gray-600',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        warning: 'bg-amber-50 border-amber-100 text-amber-600',
        danger: 'bg-red-50 border-red-100 text-red-600',
    };

    const iconClasses = {
        primary: 'text-indigo-400',
        secondary: 'text-gray-400',
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        danger: 'text-red-400',
    };

    return (
        <div className={`rounded-lg border shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md ${variantClasses[variant]} ${className}`}>
            <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</p>
                <h3 className="text-2xl font-bold mt-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-white ${iconClasses[variant]}`}>
                {icon}
            </div>
        </div>
    );
}