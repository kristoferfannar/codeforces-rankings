import { get } from "@vercel/edge-config";

export async function GET(request: Request) {
	const users = await get("users");
	const lastUpdated = await get("lastUpdated");

	return Response.json({ users, lastUpdated });
}
