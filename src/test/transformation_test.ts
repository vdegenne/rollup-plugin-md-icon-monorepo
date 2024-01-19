import {expect} from 'chai';
import {CodePoint, Variant} from 'mwc3-back-helpers';
import {cacheCodePoints, cacheVariant} from '../cache.js';
import {
	SYMBOLS_LINK_REGEX,
	minifySymbolsLink,
	removeSymbolsLink,
} from '../html-transformation.js';
import {resetCache} from './utils.js';

describe('Html Transformation', () => {
	beforeEach(resetCache);

	describe('link regex', () => {
		it('matches accordingly', async () => {
			expect(SYMBOLS_LINK_REGEX.test('nope')).to.be.false;
			expect(SYMBOLS_LINK_REGEX.test('<link id="symbols">')).to.be.true;
			expect(SYMBOLS_LINK_REGEX.test('      <link id="symbols">     ')).to.be
				.true;
			expect(
				SYMBOLS_LINK_REGEX.test(
					'      <link rel="stylesheet" id="symbols" href="....">     ',
				),
			).to.be.true;

			expect(
				SYMBOLS_LINK_REGEX.test(
					'   <link rel="stylesheet" id=symbols href="...." />',
				),
			).to.be.true;
		});

		it('can be used to replace links', async () => {
			const input = `
<head>
  <link id="symbols" rel="stylesheet" href="...">
</head>
`;
			expect(input.replace(SYMBOLS_LINK_REGEX, 'test')).to.equal(`
<head>
  test
</head>
`);
		});
	});

	it("throws if link can't be found", async () => {
		let err: Error | undefined;
		try {
			minifySymbolsLink('will throw');
		} catch (error: any) {
			err = error;
		}
		expect(err).to.be.an('error');
		expect(err!.message).to.contain(
			"Material Symbols stylesheet link couldn't be found",
		);
	});

	it('transforms symbols link in html according to cache values', async () => {
		const codepoints: CodePoint[] = ['e951', 'f88e', 'e64e'];
		await cacheCodePoints(codepoints);
		await cacheVariant(Variant.SHARP);

		const out = minifySymbolsLink(`
<head>
  <link rel="stylesheet" href="..." id="symbols" />
</head>
`);
		expect(out).to.equal(`
<head>
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Sharp&text=%EE%99%8E%EE%A5%91%EF%A2%8E" rel="stylesheet" />
</head>
`);
	});

	it('can remove link from html', async () => {
		const out = removeSymbolsLink(`
<head>
  <link rel="stylesheet" href="..." id="symbols" />
</head>
`);
		expect(out).to.equal(`
<head>
  
</head>
`);
	});
});
