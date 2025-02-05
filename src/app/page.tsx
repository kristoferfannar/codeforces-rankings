"use client";
import type { RatingChangeDTO, User, UserDTO } from "@/utils/types";
import { useEffect, useState } from "react";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const renderHeader = () => {
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

const renderName = (user: User) => {
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
                <p className={style}>{user.handle}</p>
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

export default function Home() {
    const names = [
        "kristoferfannar",
        "lsig",
        "ikaurov",
        "josh2775",
        "guhasada",
        "porkbarrel",
        "BenjaR",
        "billionaire",
        "ArieArya",
        "kalcy",
        "Kryogenesis",
    ];
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getInfo(names);
    }, []);

    const fetchRatingChange = async (user: User) => {
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
            let oldRating = user.rating;
            for (
                let i = data.result.length - 1;
                i >= 0 && data.result[i].ratingUpdateTimeSeconds >= aWeekAgo;
                i--
            ) {
                oldRating = data.result[i].oldRating;
            }

            setUsers((prevUsers) =>
                prevUsers
                    .map((u) => {
                        return u.handle === user.handle
                            ? { ...u, ratingChange: user.rating - oldRating }
                            : u;
                    })
                    .sort((a, b) => (a.ratingChange! > b.ratingChange! ? -1 : 1)),
            );
        } catch (error) {
            setError("error");
        } finally {
            setLoading(false);
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

            console.log(`got ${fetched.length} users`);

            fetched.sort((a, b) => {
                return a.rating >= b.rating ? -1 : 1;
            });

            setUsers(fetched);

            for (const u of fetched) {
                await delay(20);
                await fetchRatingChange(u);
            }
        } catch (error) {
            setError("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(`there are ${users.length} users`);
    }, [users]);

    const renderNames = () => {
        return users.map((user) => {
            return <div key={user.handle}>{renderName(user)}</div>;
        });
    };

    return (
        <div className="m-8 border-black ">
            {loading ? (
                <p>loading</p>
            ) : error ? (
                <p>error</p>
            ) : (
                <div className="flex items-center flex-col">
                    <div className="w-full max-w-96">
                        {renderHeader()}
                        {renderNames()}
                    </div>
                </div>
            )}
        </div>
    );
}
