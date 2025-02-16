import type { User } from "@/utils/types";
import Rankings from "./rankings";
import Submissions from "./submissions";

// render for every request
export const dynamic = "force-dynamic";

const formatDate = (currentDate: Date): string => {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: undefined,
		hour12: true,
	}).format(currentDate);
};

export default async function Page() {
	const res = await fetch(`${process.env.URL}/api`);
	let lastUpdated = new Date();
	const data: { lastUpdated: Date; users: User[] } = await res.json();

	lastUpdated = new Date(data.lastUpdated);
	const users = data.users;

	console.log(`got ${users.length} users, lastUpdated: ${lastUpdated}`);

	return (
		<div className="m-8 border-black ">
			<div className="flex justify-center gap-32">
				<Rankings users={users} />
				<Submissions users={users} />
			</div>
			<p>{`last updated at ${formatDate(lastUpdated)}`}</p>
		</div>
	);
}
