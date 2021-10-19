import * as assert from 'assert';
import exp = require('constants');
import { Codes } from '../../rules/codes';
import { isResult } from '../../rules/result';
import { applicable, getRule } from '../../rules/rules';

suite('Units', () => {
	suite('applicable', () => {
		test('returns an array', () => {
			const actual = Array.isArray(applicable);
			const expected = true;

			assert.strictEqual(actual, expected);
		});

		test('returns rules', () => {
			const actual = applicable.length;
			const expected = true;

			assert.strictEqual(actual > 0, expected, `applicable returned only ${actual} rules`);
		});
	});
});

suite('Validation', () => {

	/**
	 * Tests cases documented on {@link World Anvil Codex on CSS https://www.worldanvil.com/w/WorldAnvilCodex/a/css}
	 */
	suite('Documented', () => {

		suite(Codes[Codes.noSingleQuoteOccurance], () => {
			test('no result on text without single quote', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = getRule(Codes.noSingleQuoteOccurance).validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on text with single quote', () => {
				const testLine = "    font-family: 'Courier New', Courier, monospace;";
				const result = getRule(Codes.noSingleQuoteOccurance).validation(testLine, 1);
				const actual = isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});
		});

		suite(Codes[Codes.noClassBeginningWithSh], () => {
			test('no result on line that does not contain \'sh\'', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = getRule(Codes.noClassBeginningWithSh).validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on line that does contain \'sh\'', () => {
				const testLine = ".shadow {";
				const result = getRule(Codes.noClassBeginningWithSh).validation(testLine, 1);
				const actual = isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});
		});

		suite(Codes[Codes.noClassBeginningWithCss], () => {
			test('no result on line that does not contain verbatim css', () => {
				const testLine = "The quick brown fox jumps over the lazy dog";
				const actual = getRule(Codes.noClassBeginningWithCss).validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});

			test('result on line that does contain \'css\'', () => {
				const testLine = ".css,";
				const result = getRule(Codes.noClassBeginningWithCss).validation(testLine, 1);
				const actual = isResult(result);
				const expected = true;

				assert.strictEqual(actual, expected);
			});

			test('no result on \'.user-css\'', () => {
				const testLine = ".user-css .bla {";
				const actual = getRule(Codes.noClassBeginningWithCss).validation(testLine, 1);
				const expected = "undefined";

				assert.strictEqual(typeof (actual), expected);
			});
		});

		suite(Codes[Codes.noVerbatimStyleOccurance], () => {

		});
	});

	suite('Discovered', () => {

		suite('\"css\" is not allowed in any custom class', () => {
			suite(Codes[Codes.noClassContainingCss], () => {
				test('no result on \'.user-css\' with class without further verbatim \'css\'', () => {
					const testLine = ".user-css .someotherclass";
					const actual = getRule(Codes.noClassContainingCss).validation(testLine, 1);
					const expected = "undefined";

					assert.strictEqual(typeof (actual), expected);
				});

				test('result on \'.user-css\' with class with further verbatim \'css\'', () => {
					const testLine = ".user-css .ericsson";
					const result = getRule(Codes.noClassContainingCss).validation(testLine, 1);
					const actual = isResult(result);
					const expected = true;

					assert.strictEqual(actual, expected);
				});
			});

			suite('class contains \"css\" verbatim', () => {
				test(`No result on ${Codes[Codes.noClassBeginningWithCss]}`, () => {
					const testLine = ".somecssblablub";
					const actual = getRule(Codes.noClassBeginningWithCss).validation(testLine, 1);
					const expected = "undefined";

					assert.strictEqual(typeof (actual), expected);
				});

				test(`result on ${Codes[Codes.noClassContainingCss]}`, () => {
					const testLine = ".somecssblablub";
					const result = getRule(Codes.noClassContainingCss).validation(testLine, 1);
					const actual = isResult(result);
					const expected = true;

					assert.strictEqual(actual, expected);
				});
			});
		});

	});
});
