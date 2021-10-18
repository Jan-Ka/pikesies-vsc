import {
    createConnection,
    ProposedFeatures,
    InitializeParams,
    InitializeResult,
    DidChangeConfigurationParams,
    DidChangeWatchedFilesParams,
    DiagnosticSeverity,
    Diagnostic,
    Position
} from "vscode-languageserver/node";

// @ts-ignore 6059
import { name as clientName } from '../../package.json';

const connection = createConnection(ProposedFeatures.all);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {}
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});

interface LspSettings {
    maxNumberOfProblems: number;
}

const defaultSettings: LspSettings = { maxNumberOfProblems: 1000 };
let globalSettings: LspSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<LspSettings>> = new Map();

connection.onDidChangeConfiguration((params: DidChangeConfigurationParams): void => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <LspSettings>((params.settings.pikesies || defaultSettings));
    }
});

connection.onDidChangeWatchedFiles((params: DidChangeWatchedFilesParams): void => {
    connection.console.log('We received a file change event');

    let diagnostics: Diagnostic[] = [];

    let diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Warning,
        range: {
            start: Position.create(0, 0),
            end: Position.create(0, 1),
        },
        message: 'yodel',
        source: clientName
    };

    // if (hasDiagnosticRelatedInformationCapability) {
    //     diagnostic.relatedInformation = [
    //         {
    //             location: {
    //                 uri: textDocument.uri,
    //                 range: Object.assign({}, diagnostic.range)
    //             },
    //             message: 'Spelling matters'
    //         },
    //         {
    //             location: {
    //                 uri: textDocument.uri,
    //                 range: Object.assign({}, diagnostic.range)
    //             },
    //             message: 'Particularly for names'
    //         }
    //     ];
    // }
    diagnostics.push(diagnostic);

    connection.sendDiagnostics({ uri: params.changes[0].uri, diagnostics });
});

connection.listen();