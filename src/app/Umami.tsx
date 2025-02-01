"use client";

import { useEffect } from "react";

export function UmamiAnalytics() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cloud.umami.is/script.js";
        script.async = true;
        script.defer = true;
        script.setAttribute("data-website-id", "849dac77-219d-4a0e-ba65-910f76c78e6f");

        script.onerror = () => {
            console.error("Umami script failed to load");
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return null;
}
