import * as assert from 'assert';
import { Rules } from '../../rules';

suite('Rules', () => {

	/**
	 * Tests cases documented on {@link World Anvil Codex on CSS https://www.worldanvil.com/w/WorldAnvilCodex/a/css}
	 */
	suite('Documented', () => {

		suite(Rules.Codes[Rules.Codes.noSingleQuoteOccurance], () => {
			test('no result on text without single quote', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = Rules.noSingleQuote.validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on text with single quote', () => {
				const testLine = "    font-family: 'Courier New', Courier, monospace;";
				const result = Rules.noSingleQuote.validation(testLine, 1);
				const actual = Rules.isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});
		});

		suite(Rules.Codes[Rules.Codes.noClassBeginningWithSh], () => {
			test('no result on line that does not contain \'sh\'', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = Rules.noClassBeginningWithSh.validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on line that does contain \'sh\'', () => {
				const testLine = ".shadow {";
				const result = Rules.noClassBeginningWithSh.validation(testLine, 1);
				const actual = Rules.isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});
		});

		suite(Rules.Codes[Rules.Codes.noClassBeginningWithCss], () => {
			test('no result on line that does not contain verbatim css', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = Rules.noClassBeginningWithCss.validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on line that does contain \'css\'', () => {
				const testLine = ".css,";
				const result = Rules.noClassBeginningWithCss.validation(testLine, 1);
				const actual = Rules.isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});

			test('no result on \'.user-css\'', () => {
				const testLine = ".user-css .bla {";
				const actual = Rules.noClassBeginningWithCss.validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});
		});

		suite(Rules.Codes[Rules.Codes.noVerbatimStyleOccurance], () => {

		});
	});

	suite('Discovered', () => {

		suite('\"css\" is not allowed in any custom class', () => {
			suite(Rules.Codes[Rules.Codes.noClassContainingCss], () => {
				test('no result on \'.user-css\' with class without further verbatim \'css\'', () => {
					const testLine = ".user-css .someotherclass";
					const actual = Rules.noClassContainingCss.validation(testLine, 1);
					const expected = "undefined";

					assert.strictEqual(typeof (actual), expected);
				});

				test('result on \'.user-css\' with class with further verbatim \'css\'', () => {
					const testLine = ".user-css .ericsson";
					const result = Rules.noClassContainingCss.validation(testLine, 1);
					const actual = Rules.isResult(result);
					const expected = true;

					assert.strictEqual(actual, expected);
				});
			});

			suite('class contains \"css\" verbatim', () => {
				test(`No result on ${Rules.Codes[Rules.Codes.noClassBeginningWithCss]}`, () => {
					const testLine = ".somecssblablub";
					const actual = Rules.noClassBeginningWithCss.validation(testLine, 1);
					const expected = "undefined";

					assert.strictEqual(typeof (actual), expected);
				});

				test(`result on ${Rules.Codes[Rules.Codes.noClassContainingCss]}`, () => {
					const testLine = ".somecssblablub";
					const result = Rules.noClassContainingCss.validation(testLine, 1);
					const actual = Rules.isResult(result);
					const expected = true;

					assert.strictEqual(actual, expected);
				});
			});
		});

	});
});
