import { Diagnostic, DiagnosticSeverity, Position, DiagnosticRelatedInformation } from "vscode-languageserver/node";
// @ts-ignore 6059
import { name as extName } from '../../package.json';

type Rule = {
    name: string
    validation: (line: string, lineNumber: number) => Diagnostic | undefined
};

const verbatimSelectorValidation = (needle: string): Rule => {
    return {
        name: `no-${needle}-selector`,
        validation: (line: string, lineNumber: number) => {
            const idx = line.indexOf(needle);

            if (idx === -1) {
                return undefined;
            }

            let diagnostic: Diagnostic = {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: Position.create(lineNumber, idx),
                    end: Position.create(lineNumber, idx + needle.length),
                },
                message: `"${needle}" is forbidden`,
                source: extName,
            };

            return diagnostic;
        }
    };
};

const regexValidation = (ruleName: string, humanNeedleName: string, regex: RegExp): Rule => {
    return {
        name: ruleName,
        validation: (line: string, lineNumber: number): Diagnostic | undefined => {
            const matches = [...line.matchAll(regex)];

            if (matches.length === 0) {
                return undefined;
            }

            const firstMatchIdx = matches[0].index as number;
            const lastMatchArray = matches.slice(-1);
            const lastMatch = lastMatchArray[0];
            const lastMatchIdx = lastMatch.index as number + lastMatch[0].length;

            let diagnostic: Diagnostic = {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: Position.create(lineNumber, firstMatchIdx),
                    end: Position.create(lineNumber, lastMatchIdx),
                },
                message: `${humanNeedleName} is forbidden`,
                source: extName,
            };

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

            return diagnostic;
        }
    };
};

/**
 * as per {@link World Anvil Codex on CSS https://www.worldanvil.com/w/WorldAnvilCodex/a/css}
 */
export const rules: Rule[] = [
    regexValidation("no-single-quote", "single-quote ( ' )", /'/g),
    regexValidation("no-double-quote", "double-quote ( \" )", /"/g),
    regexValidation("no-lesser-than-quote", "< and &lt;", /<|&lt;/g),
    regexValidation("no-greater-than-quote", "> and &gt;", />|&gt;/g),
    verbatimSelectorValidation("body"),
    verbatimSelectorValidation("container"),
    verbatimSelectorValidation("script"),
    verbatimSelectorValidation("footer"),
    // TODO: what does 'can't be used in blocks' mean?
    verbatimSelectorValidation("style"),
    // TODO: does this include id's ?
    regexValidation("no-classes-starting-with-sh", ".sh*", /\.sh/gi),
    regexValidation("no-classes-starting-with-css", ".css*", /\.css/gi),
];