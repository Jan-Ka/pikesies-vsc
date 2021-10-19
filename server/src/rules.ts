// @ts-ignore 6059
import { name as extName } from '../../package.json';

export namespace Rules {

    export enum Codes {
        /**
         * Temporary or Outdated Codes
         */
        unassigned = 0,
        /**
         * Generic Error
         */
        error = 1000,

        noSingleQuoteOccurance = 1010,
        noDoubleQuoteOccurance = 1020,
        noLesserThanHTMLSpecialCharOccurance = 1110,
        noGreaterThanHTMLSpecialCharOccurance = 1210,
        noLesserThanLiteral = 1120,
        noGreaterThanLiteral = 1220,
        noVerbatimBodyOccurance = 1310,
        noVerbatimContainerOccurance = 1320,
        noVerbatimScriptOccurance = 1330,
        noVerbatimFooterOccurance = 1340,
        noVerbatimStyleOccurance = 1350,
        noClassBeginningWithSh = 1410,
        noClassBeginningWithCss = 1420,
        noClassContainingCss = 1430,

        /**
         * Generic Warning
         */
        warning = 2000,

        /**
         * Generic Information
         */
        information = 3000,

        /**
         * Generic Severity
         */
        hint = 4000
    }

    export type Position = {
        line: number
        character: number
    };

    export type Match = {
        start: Position,
        end: Position
    };

    export type Result = {
        /**
         * Specifc Code
         */
        code: Codes
        matches: Match[]
        message: string
        source: string
    };

    export type Rule = {
        /**
         * Generic Code
         */
        code: Codes
        name: string
        validation: (line: string, lineNumber: number) => Result | undefined
    };

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

    function codeCategoryFromCode(code: Codes): Codes {
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

    const verbatimOccuranceMatcher = (needle: string, resultCode: Codes): Rule => {
        return {
            name: `no-${needle}-selector`,
            code: codeCategoryFromCode(resultCode),
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
                    message: `"${needle}" is forbidden to occure `,
                    source: extName
                };

                return result;
            }
        };
    };

    const regexMatcher = (ruleName: string, resultCode: Codes, humanNeedleName: string, regex: RegExp): Rule => {
        return {
            name: ruleName,
            code: codeCategoryFromCode(resultCode),
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
                    message: `${humanNeedleName} is forbidden to occure`,
                    source: extName
                };

                return result;

                // let diagnostic: Diagnostic = {
                //     severity: DiagnosticSeverity.Error,
                //     range: {
                //         start: Position.create(lineNumber, firstMatchIdx),
                //         end: Position.create(lineNumber, lastMatchIdx),
                //     },
                //     message: `${humanNeedleName} is forbidden`,
                //     source: extName,
                // };

                // TODO: get uri?
                // if (config.hasDiagnosticRelatedInformationCapability && matches.length > 2) {
                //     const additionalMatches = matches.slice(1, -1);

                //     const relatedInformation: DiagnosticRelatedInformation[] = [];

                //     for (const match of additionalMatches) {
                //         const matchIdx = match.index as number;

                //         relatedInformation.push({
                //             location: {
                //                 uri: "",
                //                 range: {
                //                     start: Position.create(lineNumber, matchIdx),
                //                     end: Position.create(lineNumber, matchIdx + match[0].length)
                //                 }
                //             },
                //             message: ""
                //         });
                //     }

                //     diagnostic.relatedInformation = relatedInformation;
                // }
            }
        };
    };

    export const noSingleQuote: Rule = regexMatcher("no-single-quote", Codes.noSingleQuoteOccurance, "single-quote ( ' )", /'/g);

    export const noDoubleQuote: Rule = regexMatcher("no-double-quote", Codes.noDoubleQuoteOccurance, "double-quote ( \" )", /"/g);

    export const noLesserThanHTMLSpecialCharOccurance: Rule = regexMatcher("no-lesser-than-html-special-char", Codes.noLesserThanHTMLSpecialCharOccurance, "&lt;", /&lt;/gi);

    export const noGreaterThanHTMLSpecialCharOccurance: Rule = regexMatcher("no-greater-than-html-special-char", Codes.noLesserThanHTMLSpecialCharOccurance, "&gt;", /&gt;/gi);

    export const noLesserThanLiteral: Rule = regexMatcher("no-lesser-than-literal", Codes.noLesserThanLiteral, "<", /</g);

    export const noGreaterThanLiteral: Rule = regexMatcher("no-greater-than-literal", Codes.noGreaterThanLiteral, ">", />/g);

    export const verbatimBody: Rule = verbatimOccuranceMatcher("body", Codes.noVerbatimBodyOccurance);

    export const verbatimContainer: Rule = verbatimOccuranceMatcher("container", Codes.noVerbatimContainerOccurance);

    export const verbatimScript: Rule = verbatimOccuranceMatcher("script", Codes.noVerbatimScriptOccurance);

    export const verbatimFooter: Rule = verbatimOccuranceMatcher("footer", Codes.noVerbatimFooterOccurance);

    export const verbatimStyle: Rule = verbatimOccuranceMatcher("style", Codes.noVerbatimStyleOccurance);

    export const noClassBeginningWithSh: Rule = regexMatcher("no-classes-starting-with-sh", Codes.noClassBeginningWithSh, ".sh*", /\.sh/gi);

    export const noClassBeginningWithCss: Rule = regexMatcher("no-classes-starting-with-css", Codes.noClassBeginningWithCss, ".css*", /\.css/gi);

    export const noClassContainingCss: Rule = regexMatcher("no-classes-containing-css", Codes.noClassContainingCss, ".css*", /(?<!\.user-)css/gi);

    /**
     * as per {@link World Anvil Codex on CSS https://www.worldanvil.com/w/WorldAnvilCodex/a/css}
     */
    export const all: Rule[] = [
        noSingleQuote,
        noDoubleQuote,
        noLesserThanHTMLSpecialCharOccurance,
        noGreaterThanHTMLSpecialCharOccurance,
        noLesserThanLiteral,
        noGreaterThanLiteral,
        verbatimBody,
        verbatimContainer,
        verbatimScript,
        verbatimFooter,
        // TODO: what does 'can't be used in blocks' mean?
        verbatimStyle,
        // TODO: does this include id's ?
        noClassBeginningWithSh,
        noClassBeginningWithCss,
        noClassContainingCss
    ];
}
