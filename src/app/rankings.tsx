import type { User } from "@/utils/types";

const renderRankingHeader = () => {
	return (
		<div className="flex flex-row justify-between">
			<div>
				<p className="italic w-10">#</p>
			</div>
			<div className="flex flex-row justify-between flex-grow w-1/2">
				<p className="italic">handle</p>
				<p className="italic">rating</p>
			</div>
			<div className="flex justify-end w-1/2">
				<p className="italic">change</p>
			</div>
		</div>
	);
};

const renderRatingChange = (ratingChange: number) => {
	if (ratingChange > 0) {
		return <p className="text-green-500 font-bold">{`+ ${ratingChange}`}</p>;
	}
	if (ratingChange < 0) {
		return (
			<p className="text-red-500 font-bold">{`- ${Math.abs(ratingChange)}`}</p>
		);
	}
	return <p>-</p>;
};

const renderRanking = (user: User, pos: number) => {
	let ratingStyle = "";
	if (user.rating >= 3000) ratingStyle = "legendary-grandmaster";
	else if (user.rating >= 2600) ratingStyle = "international-grandmaster";
	else if (user.rating >= 2400) ratingStyle = "grandmaster";
	else if (user.rating >= 2300) ratingStyle = "international-master";
	else if (user.rating >= 2100) ratingStyle = "master";
	else if (user.rating >= 1900) ratingStyle = "candidate-master";
	else if (user.rating >= 1600) ratingStyle = "expert";
	else if (user.rating >= 1400) ratingStyle = "specialist";
	else if (user.rating >= 1200) ratingStyle = "pupil";
	else if (user.rating > 0) ratingStyle = "newbie";

	let style = "";
	if (ratingStyle) {
		style += `font-bold text-${ratingStyle}`;
	}

	return (
		<div className="flex flex-row justify-between">
			<div className="w-10">
				<p>{pos}</p>
			</div>
			<div className="flex flex-row justify-between flex-grow w-1/2">
				<a href={`https://codeforces.com/profile/${user.handle}`}>
					<p className={style}>{user.handle}</p>
				</a>
				<p>{user.rating ?? 0}</p>
			</div>
			<div className="flex justify-end w-1/2">
				{user.ratingChange === undefined ? (
					<p>loading</p>
				) : (
					renderRatingChange(user.ratingChange)
				)}
			</div>
		</div>
	);
};

const renderRankings = (users: User[]) => {
	const nw = users
		.sort((a, b) => (a.ratingChange! > b.ratingChange! ? -1 : 1))
		.filter((u) => u.ratingChange !== 0);

	const ranks: number[] = [];
	let last = nw[0].ratingChange!;
	let lastRank = 1;
	for (let i = 0; i < nw.length; i++) {
		if (nw[i].ratingChange! < last) lastRank = i + 1;

		ranks.push(lastRank);
		last = nw[i].ratingChange!;
	}
	return nw
		.filter((_, idx) => ranks[idx] <= 10)
		.map((user, idx) => {
			return <div key={user.handle}>{renderRanking(user, ranks[idx])}</div>;
		});
};

export default function Rankings({ users }: { users: User[] }) {
	return (
		<div className="w-full max-w-xl">
			<h2 className="font-bold text-center text-2xl">Ranking</h2>
			{renderRankingHeader()}
			{renderRankings(users)}
		</div>
	);
}
