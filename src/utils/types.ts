export type UserDTO = {
    handle: string;
    rating?: number;
    maxRating?: number;
};

export type User = {
    handle: string;
    rating: number;
    maxRating: number;
    ratingChange?: number;
};

export type RatingChangeDTO = {
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
};
