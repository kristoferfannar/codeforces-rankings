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
	totalSubmissions?: number;
	recentSubmissions?: number;
};

export type RatingChangeDTO = {
	ratingUpdateTimeSeconds: number;
	oldRating: number;
	newRating: number;
};

export enum Verdict {
	OK = "OK",
	// FAILED, OK, PARTIAL, COMPILATION_ERROR, RUNTIME_ERROR, WRONG_ANSWER, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, IDLENESS_LIMIT_EXCEEDED, SECURITY_VIOLATED, CRASHED, INPUT_PREPARATION_CRASHED, CHALLENGED, SKIPPED, TESTING, REJECTED
}

export type SubmissionDTO = {
	verdict?: Verdict;
	creationTimeSeconds: number;
};
