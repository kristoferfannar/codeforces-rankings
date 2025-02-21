"use client";
import type { User } from "@/utils/types";
import Rankings from "./rankings";
import Submissions from "./submissions";
import { useEffect, useState } from "react";

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

export default function Page() {
	const [users, setUsers] = useState<User[]>([]);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date(0));
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		fetch("/api").then((res) => {
			res.json().then((data) => {
				setUsers(data.users);
				setLastUpdated(new Date(data.lastUpdated));
				setLoading(false);
			});
		});
	}, []);

	if (loading) return <div>loading...</div>;

	return (
		<div className="m-8 border-black flex justify-between flex-col grow">
			<div>
				<div className="flex justify-center gap-32">
					<Rankings users={users} />
					<Submissions users={users} />
				</div>
			</div>
			<div className="flex justify-evenly">
				<p>{`updated at ${formatDate(lastUpdated)}`}</p>
				<p>
					open source at{" "}
					<a
						className="italic"
						href="https://github.com/kristoferfannar/codeforces-rankings"
					>
						github.com/kristoferfannar/codeforces-rankings
					</a>
				</p>
			</div>
		</div>
	);
}
