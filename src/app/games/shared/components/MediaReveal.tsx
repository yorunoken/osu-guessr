import type { ReactNode } from "react";

export default function MediaReveal({ children }: { children: ReactNode }) {
    return <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 p-4 text-center backdrop-blur-sm">{children}</div>;
}
