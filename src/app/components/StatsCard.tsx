interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
    return (
        <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm text-foreground/70 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}
