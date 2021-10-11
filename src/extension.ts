import * as vscode from 'vscode';
// @ts-ignore 6059
import { version } from '../package.json';

export function activate(context: vscode.ExtensionContext) {

	console.log(`Running pikesies ${version}`);

	let disposable = vscode.commands.registerCommand('pikesies.validate', () => {
		vscode.window.showInformationMessage('Hello World from VSC!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
