import type { User } from "@/utils/types";

let users: User[] = [];
let lastUpdated = new Date();

export const getUsers = () => {
    return users;
};

export const setUsers = (u: User[]) => {
    users = u;
};

export const getLastUpdated = () => {
    return lastUpdated;
};

export const setLastUpdated = (lu: Date) => {
    lastUpdated = lu;
};
