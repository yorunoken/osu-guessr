import { expect, test, describe } from "bun:test";
import { cn } from "./utils";

describe("Utils", () => {
    describe("cn", () => {
        test("merges tailwind classes", () => {
            expect(cn("p-4 text-center", "text-red-500")).toBe("p-4 text-center text-red-500");
        });

        test("resolves tailwind conflicts", () => {
            // p-4 and p-8 conflict, p-8 should win
            expect(cn("p-4", "p-8")).toBe("p-8");
            expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
        });

        test("handles conditional classes", () => {
            expect(cn("p-4", false && "text-red-500", true && "text-blue-500")).toBe("p-4 text-blue-500");
        });
    });
});
