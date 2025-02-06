interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
    return (
        <details className="bg-card rounded-lg border border-border" open={defaultOpen}>
            <summary className="text-xl font-semibold p-6 cursor-pointer hover:bg-secondary/10 transition-colors">{title}</summary>
            <div className="p-6 pt-0 space-y-4">{children}</div>
        </details>
    );
}
