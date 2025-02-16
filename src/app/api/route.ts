import { getLastUpdated, getUsers } from "../data";

export async function GET(request: Request) {
    const users = getUsers();
    const lastUpdated = getLastUpdated();

    return Response.json({ users, lastUpdated });
}
