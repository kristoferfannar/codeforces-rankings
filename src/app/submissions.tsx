import type { User } from "@/utils/types";

const renderSubmissionHeader = () => {
	return (
		<div className="flex flex-row justify-between">
			<div className="flex flex-row justify-between flex-grow w-1/2">
				<p className="italic">handle</p>
				<p className="italic">submissions</p>
			</div>
			<div className="flex justify-end w-1/2">
				<p className="italic">change</p>
			</div>
		</div>
	);
};

const renderRecentSubmissions = (recentSubmissions: number) => {
	if (recentSubmissions > 0) {
		return (
			<p className="text-green-500 font-bold">{`+ ${recentSubmissions}`}</p>
		);
	}

	return <p>0</p>;
};

const renderSubmission = (user: User) => {
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
				<p>{user.totalSubmissions}</p>
			</div>
			<div className="flex justify-end w-1/2">
				{user.ratingChange === undefined ? (
					<p>loading</p>
				) : (
					renderRecentSubmissions(user.recentSubmissions ?? 0)
				)}
			</div>
		</div>
	);
};

const renderSubmissions = (users: User[]) => {
	return users
		.sort((a, b) => (a.recentSubmissions! > b.recentSubmissions! ? -1 : 1))
		.map((user) => {
			return <div key={user.handle}>{renderSubmission(user)}</div>;
		});
};

export default function Submissions({ users }: { users: User[] }) {
	return (
		<div className="w-full max-w-96">
			<h2 className="font-bold text-center text-2xl">Submissions</h2>
			{renderSubmissionHeader()}
			{renderSubmissions(users)}
		</div>
	);
}
