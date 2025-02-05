"use client";
import {
    Verdict,
    type RatingChangeDTO,
    type SubmissionDTO,
    type User,
    type UserDTO,
} from "@/utils/types";
import { useEffect, useState } from "react";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const renderRecentSubmissions = (recentSubmissions: number) => {
    if (recentSubmissions > 0) {
        return (
            <p className="text-green-500 font-bold">{`+ ${recentSubmissions}`}</p>
        );
    }

    return <p>0</p>;
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

export default function Home() {
    const names = [
        "kristoferfannar",
        "lsig",
        "ikaurov",
        "josh2775",
        "guhasada",
        "porkbarrel",
        "ArieArya",
        "kalcy",
        "Kryogenesis",
        "khaliung",
        "LiuH",
        "colleenqgl",
        "jeewon",
        "KenD2002",
        "sy3245",
        "yitongta",
        "MillionDev",
        "jessicard",
        "mastranj",
        "mektronus",
        "joonrhee",
        "RobinHCL",
        "rahulram04",
        "mjstraus2304",
        "ruby931109",
        "jeffreyhuang1009",
        "ZakT",
        "kingsley.u",
        "Dani22reich",
        "laraj723",
        "zacharyzusin",
        "ppusarla",
    ];

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getInfo(names);
    }, []);

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

    const getInfo = async (handles: string[]) => {
        try {
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

            setUsers(fetched);

            setLoading(false);

            for (const user of fetched) {
                await delay(20);
                const oldRating = await fetchOldRating(user);
                await delay(20);
                const { totalSubmissions, recentSubmissions } =
                    await fetchSubmissions(user);

                setUsers((prevUsers) =>
                    prevUsers.map((u) => {
                        return u.handle === user.handle
                            ? {
                                ...u,
                                ratingChange: user.rating - oldRating,
                                totalSubmissions: totalSubmissions,
                                recentSubmissions: recentSubmissions,
                            }
                            : u;
                    }),
                );
            }
        } catch (error) {
            setError("error");
        }
    };

    const renderRankings = () => {
        return users
            .sort((a, b) => (a.ratingChange! > b.ratingChange! ? -1 : 1))
            .map((user) => {
                return <div key={user.handle}>{renderRanking(user)}</div>;
            });
    };

    const renderSubmissions = () => {
        return users
            .sort((a, b) => (a.recentSubmissions! > b.recentSubmissions! ? -1 : 1))
            .map((user) => {
                return <div key={user.handle}>{renderSubmission(user)}</div>;
            });
    };

    return (
        <div className="m-8 border-black ">
            {loading ? (
                <p>loading</p>
            ) : error ? (
                <p>error</p>
            ) : (
                <div className="flex justify-center gap-32">
                    <div className="w-full max-w-96">
                        <h2 className="font-bold text-center text-2xl">Ranking</h2>
                        {renderRankingHeader()}
                        {renderRankings()}
                    </div>
                    <div className="w-full max-w-96">
                        <h2 className="font-bold text-center text-2xl">Submissions</h2>
                        {renderSubmissionHeader()}
                        {renderSubmissions()}
                    </div>
                </div>
            )}
        </div>
    );
}
