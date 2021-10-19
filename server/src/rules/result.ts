import { Codes } from "./codes";
import { Match } from "./types";

export type Result = {
    /**
     * Specifc Code
     */
    code: Codes
    matches: Match[]
    message: string
    source: string
};

/**
 * Result Typeguard
 * @param x any value
 * @returns true if x is Result
 */
export function isResult(x: any): x is Result {
    if (typeof (x) !== "object") {
        return false;
    }

    for (const key of ["code", "matches", "message", "source"]) {
        if (!(x as Object).hasOwnProperty(key)) {
            return false;
        }
    }

    if (!Array.isArray(x.matches)) {
        return false;
    }

    return true;
}