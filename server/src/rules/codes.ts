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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CategoryCodes = [
    Codes.error,
    Codes.hint,
    Codes.information,
    Codes.unassigned,
    Codes.warning
];