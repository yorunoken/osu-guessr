import { redirect } from "next/navigation";

export async function GET() {
    return redirect("https://github.com/yorunoken/osu-guessr/blob/main/docs/API.md");
}
