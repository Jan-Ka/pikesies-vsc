# pikesies-vsc

Visual Studio Code Extension to Manage World Anvil Presentation CSS

## Features

- Validates your `*.css` files against World Anvil Presentation CSS.
- Loads automatically on all `*.css` files
- Can be triggered manually by invoking `Validate PCSS`
  - through the Action Palette or
  - through the Context Menu on `*.css` files

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `pikesies.maxNumberOfProblems`: how many problems should be reported (*currently defunct*)
* `pikesies.trace.server`: allows to configure trace level of LSP (*currently defunct*)

## Known Issues

- None

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of `pikesies-vsc`

- Client-side only (we are waiting for World Anvil API changes)