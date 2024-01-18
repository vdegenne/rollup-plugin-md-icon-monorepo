import {createFilter} from '@rollup/pluginutils';
import fastGlob from 'fast-glob';
import {existsSync} from 'fs';
import {cp, mkdir, writeFile} from 'fs/promises';
import {
	CodePoint,
	OutlinedCodePointsMap,
	RoundedCodePointsMap,
	SharpCodePointsMap,
} from 'mwc3-back-helpers/codepoints-maps.js';
import {replaceSymbolsFontUrlInStyleSheet} from 'mwc3-back-helpers/fonts.js';
import {
	Variant,
	convertIconNamesToCodePoints,
	findIconNamesFromFiles,
	replaceIconNamesWithCodePoints,
} from 'mwc3-back-helpers/md-icons.js';
import {basename, dirname, join} from 'path';
import {type Plugin} from 'rollup';
import {
	cacheCodePoints,
	cacheFontBase,
	cacheFontDestination,
	cacheStyleSheetDestination,
	cacheVariant,
	downloadFiles,
	getFontBase,
	getFontCachedDestination,
	getStyleSheet,
	getStyleSheetCachedDestination,
} from '../cache.js';
import {type MdIconPluginOptions} from './types.js';

function mdIcon(options: Partial<MdIconPluginOptions> = {}): Plugin {
	options.include ??= 'src/**/*.{js,ts,jsx,tsx}';
	options.includeComments ??= false;
	options.variant ??= Variant.OUTLINED;

	const filter = createFilter(options.include, options.exclude);

	return {
		name: 'md-icon',

		async buildStart() {
			const variant = options.variant as Variant;

			// Needa find all the icons in the source code to get the codepoints list
			const lookupFiles = await fastGlob(options.include!);
			const iconNames = await findIconNamesFromFiles(
				lookupFiles,
				options.includeComments,
			);

			await cacheVariant(variant);

			let codepoints: CodePoint[] = [];
			if (iconNames.length > 0) {
				codepoints = convertIconNamesToCodePoints(iconNames);
			}

			// Should we scan the code to find md-icon's ?
			if (options.symbols) {
				options.symbols.stylesheetPath ??= 'dist/material-symbols.css';
				options.symbols.fontPath ??= 'dist/material-symbols.woff2';
				options.symbols.base ??= '/';

				if (codepoints.length > 0) {
					const retCode = await downloadFiles(variant, codepoints);

					// Should we reflect changes?
					if (
						// New downloaded files?
						retCode == 1 ||
						// User changed stylesheet destination path?
						getStyleSheetCachedDestination() !==
							options.symbols.stylesheetPath ||
						// User changed font destination path?
						getFontCachedDestination() !== options.symbols.fontPath ||
						// User changed font base path?
						getFontBase() !== options.symbols.base ||
						// Stylesheet was deleted?
						!existsSync(options.symbols.stylesheetPath) ||
						// Font file was deleted?
						!existsSync(options.symbols.fontPath)
					) {
						// console.log('Yes should do something about it');

						const stylesheet = await getStyleSheet(variant);
						if (stylesheet === null) {
							throw new Error(
								"Couldn't get the content of the stylesheet, check your internet connection.",
							);
						}
						await cacheStyleSheetDestination(
							options.symbols.stylesheetPath,
							false,
						);
						await cacheFontDestination(options.symbols.fontPath, false);
						await cacheFontBase(options.symbols.base);

						// Determine public path to font file
						const fontPath = join(
							options.symbols.base,
							basename(options.symbols.fontPath),
						);
						const modifiedSS = replaceSymbolsFontUrlInStyleSheet(
							stylesheet,
							fontPath,
						);

						// TODO: Should we delete previously copied files?

						// Moving files
						await Promise.all([
							// Stylesheet
							(async () => {
								const dest = options.symbols!.stylesheetPath!;
								await mkdir(dirname(dest), {recursive: true});
								await writeFile(dest, modifiedSS);
							})(),
							// Font file
							(async () => {
								const dest = options.symbols!.fontPath!;
								await mkdir(dirname(dest), {recursive: true});
								await cp('.mdicon/material-symbols.woff2', dest, {
									recursive: true,
								});
							})(),
						]);
					}
				}
			}

			// Caching the codepoints needs to be done at the very
			// end because in 'local' mode the given codepoints are
			// compared with the cached ones to determine if the files
			// need to be downloaded/updated or not.
			await cacheCodePoints(codepoints);
		},

		transform(code, id) {
			if (filter(id)) {
				const codePointsMap = {
					outlined: OutlinedCodePointsMap,
					rounded: RoundedCodePointsMap,
					sharp: SharpCodePointsMap,
				}[options.variant!];
				return replaceIconNamesWithCodePoints(
					code,
					codePointsMap,
					options.includeComments,
				);
			}
		},
	};
}

export {
	minifySymbolsLink,
	removeSymbolsLink,
	replaceSymbolsLink,
} from '../html-transformation.js';
export {mdIcon};
export default mdIcon;
