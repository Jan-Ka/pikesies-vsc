// @ts-ignore 6059
import { name as extName } from '../../../package.json';

import { CategoryCodes, Codes } from './codes';
import { Result } from './result';
import { Rule } from './types';

export function getCodeCategoryFromCode(code: Codes): Codes {
    switch (true) {
        case code >= Codes.error && code < Codes.warning:
            return Codes.error;
        case code >= Codes.warning && code < Codes.information:
            return Codes.warning;
        case code >= Codes.information && code < Codes.hint:
            return Codes.hint;
        default:
            return Codes.unassigned;
    }
}


export function getRule(code: Codes): Rule {
    return all[code];
}

export const all: { [key in Codes]: Rule } = {
    [Codes.noSingleQuoteOccurance]: regexMatcher(Codes.noSingleQuoteOccurance, "single-quote ( ' )", /'/g),
    [Codes.noDoubleQuoteOccurance]: regexMatcher(Codes.noDoubleQuoteOccurance, "double-quote ( \" )", /"/g),
    [Codes.noLesserThanHTMLSpecialCharOccurance]: regexMatcher(Codes.noLesserThanHTMLSpecialCharOccurance, "&lt;", /&lt;/gi),
    [Codes.noGreaterThanHTMLSpecialCharOccurance]: regexMatcher(Codes.noLesserThanHTMLSpecialCharOccurance, "&gt;", /&gt;/gi),
    [Codes.noLesserThanLiteral]: regexMatcher(Codes.noLesserThanLiteral, "<", /</g),
    [Codes.noGreaterThanLiteral]: regexMatcher(Codes.noGreaterThanLiteral, ">", />/g),
    [Codes.noVerbatimBodyOccurance]: verbatimOccuranceMatcher(Codes.noVerbatimBodyOccurance, "body"),
    [Codes.noVerbatimContainerOccurance]: verbatimOccuranceMatcher(Codes.noVerbatimContainerOccurance, "container"),
    [Codes.noVerbatimScriptOccurance]: verbatimOccuranceMatcher(Codes.noVerbatimScriptOccurance, "script"),
    [Codes.noVerbatimFooterOccurance]: verbatimOccuranceMatcher(Codes.noVerbatimFooterOccurance, "footer"),
    [Codes.noVerbatimStyleOccurance]: verbatimOccuranceMatcher(Codes.noVerbatimStyleOccurance, "style"),
    [Codes.noClassBeginningWithSh]: regexMatcher(Codes.noClassBeginningWithSh, "sh", /\.sh/gi),
    [Codes.noClassBeginningWithCss]: regexMatcher(Codes.noClassBeginningWithCss, "css", /\.css/gi),
    [Codes.noClassContainingCss]: regexMatcher(Codes.noClassContainingCss, "css", /(?<!\.user-)css/gi),

    [Codes.error]: noopMatcher(Codes.error),
    [Codes.hint]: noopMatcher(Codes.hint),
    [Codes.information]: noopMatcher(Codes.information),
    [Codes.unassigned]: noopMatcher(Codes.unassigned),
    [Codes.warning]: noopMatcher(Codes.warning)
};

export const applicable = withoutCategoryCodeRules();

function withoutCategoryCodeRules() {
    return Object.keys(all)
        .map((strKey) => parseInt(strKey))
        .filter((key) => !Object.values(CategoryCodes).includes(key))
        .reduce((prev, key) => {
            const codes = key as Codes;
            const rule = all[codes];

            prev.push(rule);

            return prev;
        }, [] as Rule[]);
}

function verbatimOccuranceMatcher(resultCode: Codes, needle: string): Rule {
    return {
        name: Codes[resultCode],
        code: getCodeCategoryFromCode(resultCode),
        validation: (line: string, lineNumber: number) => {
            const idx = line.toLocaleLowerCase().indexOf(needle);

            if (idx === -1) {
                return undefined;
            }

            let result: Result = {
                code: resultCode,
                matches: [
                    {
                        start: {
                            line: lineNumber,
                            character: idx
                        },
                        end: {
                            line: lineNumber,
                            character: idx + needle.length
                        }
                    }
                ],
                message: `avoid "${needle}"`,
                source: extName
            };

            return result;
        }
    };
}

function regexMatcher(resultCode: Codes, humanNeedleName: string, regex: RegExp): Rule {
    return {
        name: Codes[resultCode],
        code: getCodeCategoryFromCode(resultCode),
        validation: (line: string, lineNumber: number): Result | undefined => {
            const matches = [...line.matchAll(regex)];

            if (matches.length === 0) {
                return undefined;
            }

            const firstMatchIdx = matches[0].index as number;
            const lastMatchArray = matches.slice(-1);
            const lastMatch = lastMatchArray[0];
            const lastMatchIdx = lastMatch.index as number + lastMatch[0].length;

            const result: Result = {
                code: resultCode,
                matches: [
                    {
                        start: {
                            line: lineNumber,
                            character: firstMatchIdx
                        },
                        end: {
                            line: lineNumber,
                            character: lastMatchIdx
                        }
                    }
                ],
                message: `avoid "${humanNeedleName}"`,
                source: extName
            };

            return result;
        }
    };
}

function noopMatcher(resultCode: Codes): Rule {
    return {
        code: resultCode,
        name: Codes[resultCode],
        validation: () => { return undefined; }
    };
}