import type { User } from "@/utils/types";

const renderRankingHeader = () => {
	return (
		<div className="flex flex-row justify-between">
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

const renderRanking = (user: User) => {
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
	return users
		.sort((a, b) => (a.ratingChange! > b.ratingChange! ? -1 : 1))
		.map((user) => {
			return <div key={user.handle}>{renderRanking(user)}</div>;
		});
};

export default function Rankings({ users }: { users: User[] }) {
	return (
		<div className="w-full max-w-96">
			<h2 className="font-bold text-center text-2xl">Ranking</h2>
			{renderRankingHeader()}
			{renderRankings(users)}
		</div>
	);
}
