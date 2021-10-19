import * as readline from 'readline';
import * as fs from 'fs';
import {
    createConnection,
    ProposedFeatures,
    InitializeParams,
    InitializeResult,
    DidChangeConfigurationParams,
    DidChangeWatchedFilesParams,
    Diagnostic,
    Position,
    ExecuteCommandParams,
    URI,
    DiagnosticSeverity
} from "vscode-languageserver/node";
import { URI as Uri } from 'vscode-uri';

// @ts-ignore 6059
import { name as serverName } from '../package.json';
import { config } from './config';
import { Rules } from './rules';

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    config.hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );

    config.hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    config.hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            executeCommandProvider: {
                commands: [
                    "pikesies-lsp.validate"
                ]
            }
        }
    };

    if (config.hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }

    connection.console.log(`Initialized ${serverName}`);

    return result;
});

interface LspSettings {
    maxNumberOfProblems: number;
}

const defaultSettings: LspSettings = { maxNumberOfProblems: 1000 };
let globalSettings: LspSettings = defaultSettings;


connection.onDidChangeConfiguration((params: DidChangeConfigurationParams): void => {
    globalSettings = <LspSettings>((params.settings.pikesies || defaultSettings));
});

connection.onDidChangeWatchedFiles((params: DidChangeWatchedFilesParams): void => {
    connection.console.log('We received a file change event');

    const fileUri = params.changes[0].uri;
    const uri = Uri.parse(fileUri, true);

    validateCssFile(uri.fsPath);
});

connection.onExecuteCommand((params: ExecuteCommandParams): void => {
    connection.console.log(`received ${params.command}`);
    if (params.command !== "pikesies-lsp.validate" || !params.arguments) {
        return;
    }

    const activeFile = params.arguments[0];

    validateCssFile(activeFile);
});

connection.listen();


function validateCssFile(uri: URI): Promise<void> {
    const readInterface = readline.createInterface({
        input: fs.createReadStream(uri),
        terminal: false
    });

    let diagnostics: Diagnostic[] = [];

    let curLine = 0;

    readInterface.on('line', (line: string) => {
        for (const rule of Rules.all) {
            const result = rule.validation(line, curLine);

            if (!Rules.isResult(result)) {
                continue;
            }

            const diagnostic = validationResultToDiagnostic(result);

            diagnostics.push(diagnostic);
        }

        curLine++;
    });

    return new Promise((resolve) => {
        readInterface.on('close', () => {
            connection.sendDiagnostics({ uri, diagnostics });

            resolve();
        });
    });
}

function ruleCodeToSeverity(ruleCode: Rules.Codes): DiagnosticSeverity {
    switch (ruleCode) {
        case Rules.Codes.error:
            return DiagnosticSeverity.Error;
        case Rules.Codes.warning:
            return DiagnosticSeverity.Warning;
        case Rules.Codes.information:
            return DiagnosticSeverity.Information;
        case Rules.Codes.hint:
            return DiagnosticSeverity.Hint;
        default:
            log(`Unhandled ruleCode: ${ruleCode}`);
            return DiagnosticSeverity.Information;
    }
}

function validationResultToDiagnostic(validationResult: Rules.Result): Diagnostic {
    const firstMatch: Rules.Match = validationResult.matches[0];

    const codeCategory = Rules.getCodeCategoryFromCode(validationResult.code);
    const severity = ruleCodeToSeverity(codeCategory);

    const diagnostic: Diagnostic = {
        code: validationResult.code,
        severity,
        range: {
            start: Position.create(firstMatch.start.line, firstMatch.start.character),
            end: Position.create(firstMatch.end.line, firstMatch.end.character),
        },
        message: validationResult.message,
        source: validationResult.source,
    };

    return diagnostic;
}

function log(message: string) {
    console.log(message);
    connection.console.log.call(null, message);
}