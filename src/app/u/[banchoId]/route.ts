import { redirect } from "next/navigation";

export async function GET(request: Request, { params }: { params: Promise<{ banchoId: string }> }) {
    return redirect(`/user/${(await params).banchoId}`);
}
