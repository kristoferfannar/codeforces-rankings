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

const names = [
	"ArieArya",
	"Bill_IRL",
	"C_big_hand",
	"Dani22reich",
	"FeudalCheese",
	"JunyiLou2",
	"KenD2002",
	"Kryogenesis",
	"LiuH",
	"LixiaCW2",
	"Michael_Mint",
	"MillionDev",
	"PicNick",
	"RobinHCL",
	"Splaver",
	"Splaver2",
	"Ulanov_Victor",
	"ZakT",
	"aelee706",
	"arth17singh",
	"caseschemmer",
	"chrispower43",
	"codingcat420222",
	"colleenqgl",
	"ctg2140",
	"flappyBird123",
	"greekFreak224",
	"guhasada",
	"humza_choudry",
	"ikaurov",
	"jeewon",
	"jeffreyhuang1009",
	"jessicard",
	"joonrhee",
	"josh2775",
	"jz514",
	"kalcy",
	"kechenliu",
	"khaliung",
	"kingsley.u",
	"kirby5098",
	"kristoferfannar",
	"laraj723",
	"ljs2225",
	"lsig",
	"mastranj",
	"mektronus",
	"michael-mih",
	"mjstraus2304",
	"nataliecclaire",
	"ns3886",
	"ogbangjo",
	"philluple",
	"porkbarrel",
	"ppusarla",
	"rahulram04",
	"ruby931109",
	"samdobson28",
	"schlange03",
	"shriyamahakala",
	"sr3992",
	"ss7172",
	"sy3245",
	"t_0ra",
	"tomg1448",
	"tora20",
	"twy123",
	"vxl3n",
	"yitongta",
	"zacharyzusin",
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
