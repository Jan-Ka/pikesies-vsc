import * as path from 'path';
import { commands, ExtensionContext, Uri, window, workspace } from 'vscode';
import { ServerOptions, TransportKind, LanguageClientOptions, LanguageClient } from 'vscode-languageclient/node';
// @ts-ignore 6059
import { name as lspName } from '../../server/package.json';

// @ts-ignore 6059
import { name as clientName } from '../package.json';

let client: LanguageClient;

export function activate(context: ExtensionContext): void {

	console.log(`Activating ${clientName}`);

	// THIS IS NOT A LANGUAGE SERVER
	// THIS IS JUST A TRIBUTE

	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for css documents
		documentSelector: [
			{
				scheme: 'file',
				language: 'css'
			}],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/*.css')
		},
	};

	client = new LanguageClient(
		lspName,
		lspName,
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	const disposable = commands.registerCommand('pikesies.validate', (uri?: Uri) => {
		// if we don't get a file through the context, check if we got a file open
		if (typeof (uri) === 'undefined') {
			if (typeof (window.activeTextEditor) === 'undefined') {
				window.showInformationMessage('Please open a file to validate');
				return;
			} else {
				uri = window.activeTextEditor.document.uri;
			}
		}

		if (uri.scheme !== 'file') {
			window.showInformationMessage(`Can't treat as file: ${uri.path}`);
			return;
		}

		if (path.extname(uri.fsPath) !== ".css") {
			window.showInformationMessage(`Not a css file: ${uri.path}`);
			return;
		}

		console.log(`Triggered validate for ${uri.fsPath}`);

		commands.executeCommand("pikesies-lsp.validate", uri.fsPath);
	});

	context.subscriptions.push(disposable);
}

export function deactivate(): Promise<void> | undefined {
	console.log(`Deactivating ${clientName}`);

	if (!client) {
		return undefined;
	}

	return client.stop();
}
