import {expect} from 'chai';
import {existsSync} from 'fs';
import {rm} from 'fs/promises';
import {Variant} from 'mwc3-back-helpers';
import {
	CACHED_FILEPATH,
	cacheCodePoints,
	downloadFiles,
	getCachedCodePoints,
	codePointsDifferentFromCache,
	getStyleSheetCachedDestination,
	getFontCachedDestination,
	cacheFontDestination,
	cacheStyleSheetDestination,
} from '../cache.js';
import {resetCache} from './utils.js';

describe('Cache', () => {
	beforeEach(resetCache);
	after(resetCache);

	it('caches various information', async () => {
		// Stylesheet
		expect(getStyleSheetCachedDestination()).to.be.undefined;
		await cacheStyleSheetDestination('a/new/path/to/stylesheet.css');
		expect(getStyleSheetCachedDestination()).to.equal(
			'a/new/path/to/stylesheet.css',
		);

		// Font
		expect(getFontCachedDestination()).to.be.undefined;
		await cacheFontDestination('a/new/path/to/font.woff2');
		expect(getFontCachedDestination()).to.equal('a/new/path/to/font.woff2');
	});

	describe('Codepoints', () => {
		it('should be empty by default', async () => {
			expect(getCachedCodePoints()).to.be.empty;
		});

		it('should return a clone', async () => {
			const cp = getCachedCodePoints();
			cp.push('f866');
			expect(getCachedCodePoints()).to.be.empty;
		});

		it('should save', async () => {
			expect(existsSync(CACHED_FILEPATH)).to.be.false;
			await cacheCodePoints(['e952']);
			expect(existsSync(CACHED_FILEPATH)).to.be.true;
		});

		it('should sort', async () => {
			await cacheCodePoints(['f866', 'efd9', 'f8fd', 'e951']);
			expect(getCachedCodePoints()).to.deep.equal([
				'e951',
				'efd9',
				'f866',
				'f8fd',
			]);
		});

		it('deep equal checks difference', async () => {
			await cacheCodePoints(['f866', 'efd9', 'f8fd', 'e951']);
			expect(codePointsDifferentFromCache(['efd9', 'f866', 'e951', 'f8fd'])).to
				.be.false;
			expect(codePointsDifferentFromCache(['efd9', 'e951', 'f8fd'])).to.be.true;
		});
	});

	describe.skip('Downloads', () => {
		it('downloads required files', async () => {
			let retCode = await downloadFiles(Variant.OUTLINED, [
				'f866',
				'eb8d',
				'e958',
			]);
			expect(existsSync('.mdicon/material-symbols-outlined.css')).to.be.true;
			expect(existsSync('.mdicon/material-symbols.woff2')).to.be.true;
			expect(retCode).to.equal(1);

			retCode = await downloadFiles(Variant.OUTLINED, ['f866', 'eb8d', 'e958']);
			expect(existsSync('.mdicon/material-symbols-outlined.css')).to.be.true;
			expect(existsSync('.mdicon/material-symbols.woff2')).to.be.true;
			expect(retCode).to.equal(0);

			retCode = await downloadFiles(Variant.SHARP, ['f866', 'eb8d', 'e958']);
			expect(existsSync('.mdicon/material-symbols-outlined.css')).to.be.false;
			expect(existsSync('.mdicon/material-symbols-sharp.css')).to.be.true;
			expect(existsSync('.mdicon/material-symbols.woff2')).to.be.true;
			expect(retCode).to.equal(1);

			retCode = await downloadFiles(Variant.SHARP, [
				'f866',
				'eb8d',
				'e958',
				'e952',
			]);
			expect(existsSync('.mdicon/material-symbols-sharp.css')).to.be.true;
			expect(existsSync('.mdicon/material-symbols.woff2')).to.be.true;
			expect(retCode).to.equal(1);
		});
	});
});
