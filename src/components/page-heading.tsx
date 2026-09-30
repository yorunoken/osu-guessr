import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeading({ children, className }: { children: ReactNode; className?: string }) {
    return <h1 className={cn("font-display text-2xl font-semibold tracking-tight sm:text-3xl", className)}>{children}</h1>;
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span className={cn("flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground", className)}>
            <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-primary" />
            {children}
        </span>
    );
}
