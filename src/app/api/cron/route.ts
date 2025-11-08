import type {
	RatingChangeDTO,
	SubmissionDTO,
	User,
	UserDTO,
	UserEdge,
} from "@/utils/types";
import { Verdict } from "@/utils/types";

export const maxDuration = 60; // this endpoint can run for up to 60 seconds (max for hobby)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchOldRating = async (user: User) => {
	let oldRating = user.rating;
	try {
		const response = await fetch(
			`https://codeforces.com/api/user.rating?handle=${user.handle}`,
		);

		const data: { status: string; result: RatingChangeDTO[] } =
			await response.json();

		if (!response.ok || data.status !== "OK") {
			throw new Error("failed");
		}

		const aWeekAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);

		for (
			let i = data.result.length - 1;
			i >= 0 && data.result[i].ratingUpdateTimeSeconds >= aWeekAgo;
			i--
		) {
			oldRating = data.result[i].oldRating;
		}

		return oldRating;
	} catch (error) {
		return oldRating;
	}
};

const fetchSubmissions = async (
	user: User,
): Promise<{ totalSubmissions: number; recentSubmissions: number }> => {
	try {
		const response = await fetch(
			`https://codeforces.com/api/user.status?handle=${user.handle}`,
		);

		const data: { status: string; result: SubmissionDTO[] } =
			await response.json();

		if (!response.ok || data.status !== "OK") {
			throw new Error("failed");
		}

		const aWeekAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);

		let totalSub = 0;
		let recentSub = 0;

		for (const sub of data.result) {
			if (sub.verdict === Verdict.OK) {
				totalSub++;
				if (sub.creationTimeSeconds > aWeekAgo) recentSub++;
			}
		}

		return { totalSubmissions: totalSub, recentSubmissions: recentSub };
	} catch (error) {
		return { totalSubmissions: -1, recentSubmissions: -1 };
	}
};

const getInfo = async (handles: string[]): Promise<UserEdge[]> => {
	const response = await fetch(
		`https://codeforces.com/api/user.info?handles=${handles.join(";")}`,
	);

	const data: { status: string; result: UserDTO[] } = await response.json();
	if (!response.ok || data.status !== "OK") {
		throw new Error("failed");
	}

	const fetched = data.result.map((out): User => {
		return {
			handle: out.handle,
			rating: out.rating ?? 0,
			maxRating: out.maxRating ?? 0,
		};
	});

	fetched.sort((a, b) => {
		return a.rating >= b.rating ? -1 : 1;
	});

	const users: UserEdge[] = [];

	for (const user of fetched) {
		console.log(`processing "${user.handle}"`);
		if (user.rating === 0) {
			users.push({
				handle: user.handle,
				ratingChange: 0,
				rating: user.rating,
				totalSubmissions: 0,
				recentSubmissions: 0,
			});

			continue;
		}
		await delay(25);
		const oldRating = await fetchOldRating(user);
		await delay(25);
		const { totalSubmissions, recentSubmissions } =
			await fetchSubmissions(user);

		if (totalSubmissions === -1 || recentSubmissions === -1)
			console.warn(`failed to fetch submissions for "${user.handle}"`);

		users.push({
			handle: user.handle,
			rating: user.rating,
			ratingChange: user.rating - oldRating,
			totalSubmissions: totalSubmissions,
			recentSubmissions: recentSubmissions,
		});
	}

	return users;
};

// list from https://docs.google.com/spreadsheets/d/1mp-1M5w3vGE6MbT0p-3QdIy9yb-Jr6mcXdIQMCzjWS8/edit?gid=1279990039#gid=1279990039
const names = [
	"serichaoo",
	"ikaurov",
	"Emma194",
	"Caelith",
	"complexorigin",
	"Josh2775",
	"rt103",
	"zero7",
	"negativelyhydroxide",
	"6ana6",
	"a600",
	"shreyesk",
	"zevmm",
	"MkcAllen",
	"andyaramchung",
	"AntonioLi",
	"kwang3704",
	"kristoferfannar",
	"jiangxian",
	"KevinWu06",
	"trisham",
	"yzzlqyxc",
	"LuckboxAA",
	"Paulk",
	"syliu5678",
	"carlus-magsen",
	"austinsennaw",
	"rl3424",
	"ryansherby",
	"MikeYuanP",
	"caseschemmer",
	"Viccc0",
	"friken",
	"amyyu116",
	"jl12345",
	"royrocks12",
	"chadol5096",
	"sebashorta",
	"andyzhou443",
	"eja2165",
	"nikashroydas",
	"graceannmad",
	"lyr_615",
	"CatYu",
	"enikfar",
	"liz4662",
	"silverthief",
	"gabigabi",
	"PicNick",
	"MarselNagimov",
	"snath",
	"wentao2",
];

export async function GET(request: Request) {
	const users = await getInfo(names);
	const lastUpdated = new Date();

	const res = await fetch(
		`https://api.vercel.com/v1/edge-config/${process.env.EDGE_ID}/items`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				items: [
					{ operation: "update", key: "users", value: users },
					{
						operation: "update",
						key: "lastUpdated",
						value: lastUpdated.toISOString(),
					},
				],
			}),
		},
	);

	console.log(`res: ${res.ok}`);
	const out = await res.text();

	console.log(`out: ${out}`);
	return Response.json({ success: res.ok });
}
