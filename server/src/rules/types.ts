import { Codes } from "./codes";
import { Result } from "./result";

export type Position = {
    line: number
    character: number
};

export type Match = {
    start: Position,
    end: Position
};

export type Rule = {
    /**
     * Generic Code
     */
    code: Codes
    name: string
    validation: (line: string, lineNumber: number) => Result | undefined
};