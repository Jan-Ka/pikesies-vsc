import * as readline from 'readline';
import * as fs from 'fs';
import {
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationParams,
    DidChangeWatchedFilesParams,
    ExecuteCommandParams,
    InitializeParams,
    InitializeResult,
    Position,
    ProposedFeatures,
    URI,
} from "vscode-languageserver/node";
import { URI as Uri } from 'vscode-uri';

import { applicable, getCodeCategoryFromCode } from './rules/rules';
import { Codes } from './rules/codes';
import { config } from './config';
import { isResult, Result } from './rules/result';
import { Match } from './rules/types';
import { SERVER_COMMANDS, SERVER_METHODS, SERVER_NAME } from './globals';

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
                    SERVER_COMMANDS.validate
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

    connection.console.log(`Initialized ${SERVER_NAME}`);

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
    if (params.command !== SERVER_COMMANDS.validate || !params.arguments) {
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
    let anyDiagnostics = false;

    readInterface.on('line', (line: string) => {

        for (const rule of applicable) {
            const result = rule.validation(line, curLine);

            if (!isResult(result)) {
                continue;
            }

            anyDiagnostics = true;

            const diagnostic = validationResultToDiagnostic(result);

            diagnostics.push(diagnostic);
        }

        curLine++;
    });

    return new Promise((resolve) => {
        readInterface.on('close', () => {
            if (anyDiagnostics) {
                connection.sendDiagnostics({ uri, diagnostics });
            } else {
                connection.sendNotification(SERVER_METHODS.noProblemsFound);
            }


            resolve();
        });
    });
}

function ruleCodeToSeverity(ruleCode: Codes): DiagnosticSeverity {
    switch (ruleCode) {
        case Codes.error:
            return DiagnosticSeverity.Error;
        case Codes.warning:
            return DiagnosticSeverity.Warning;
        case Codes.information:
            return DiagnosticSeverity.Information;
        case Codes.hint:
            return DiagnosticSeverity.Hint;
        default:
            log(`Unhandled ruleCode: ${ruleCode}`);
            return DiagnosticSeverity.Information;
    }
}

function validationResultToDiagnostic(validationResult: Result): Diagnostic {
    const firstMatch: Match = validationResult.matches[0];

    const codeCategory = getCodeCategoryFromCode(validationResult.code);
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