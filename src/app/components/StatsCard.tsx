interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
    return (
        <div className="interactive-surface group rounded-lg border border-border/60 bg-card p-4 hover:border-primary/25 hover:bg-card/80 sm:p-5">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary ring-1 ring-primary/15 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] group-hover:scale-[1.03] group-hover:bg-primary/15 group-hover:shadow-[0_0_0_4px_hsl(var(--primary)/0.06)]">{icon}</div>
                <div className="min-w-0">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-2xl font-bold leading-tight text-primary">{value}</p>
                    <p className="text-sm text-foreground/70 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}
