interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
    return (
        <details className="bg-card rounded-lg border border-border/60" open={defaultOpen}>
            <summary className="text-lg sm:text-xl font-semibold p-5 sm:p-6 cursor-pointer hover:bg-secondary/10 transition-colors">{title}</summary>
            <div className="p-5 sm:p-6 pt-0 space-y-4">{children}</div>
        </details>
    );
}
