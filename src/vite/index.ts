import {createFilter, ResolvedConfig, type Plugin} from 'vite';
import {MdIconPluginOptions, TransformationFunction} from './types.js';
import {
	convertIconNamesToCodePoints,
	findIconNamesFromFiles,
	replaceIconNamesWithCodePoints,
	Variant,
} from 'mwc3-back-helpers/md-icons.js';
import {
	CodePoint,
	OutlinedCodePointsMap,
	RoundedCodePointsMap,
	SharpCodePointsMap,
} from 'mwc3-back-helpers/codepoints-maps.js';
import fastGlob from 'fast-glob';
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
import {
	minifySymbolsLink,
	removeSymbolsLink,
	replaceSymbolsLink,
} from '../html-transformation.js';
import {existsSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';
import {replaceSymbolsFontUrlInStyleSheet} from 'mwc3-back-helpers/fonts.js';
import {cp, mkdir, writeFile} from 'node:fs/promises';

function mdIcon(options: Partial<MdIconPluginOptions> = {}): Plugin {
	options.include ??= 'src/**/*.{js,ts,jsx,tsx}';
	options.includeComments ??= false;
	options.variant ??= Variant.OUTLINED;

	const filter = createFilter(options.include, options.exclude);

	let config: ResolvedConfig;
	let command: 'serve' | 'build';

	return {
		name: 'md-icon',

		configResolved(_config) {
			config = _config;
			command = config.command;
		},

		transformIndexHtml: async (html: string) => {
			if (command == 'build' || options.devMode) {
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

				switch (options.mode) {
					case 'fonts.googleapis.com':
						// We cache the codepoints because `minifySymbolsLink`
						// relies on the cache system.
						await cacheCodePoints(codepoints);
						return minifySymbolsLink(html);
					case 'local':
						options.stylesheetPath ??= 'public/material-symbols.css';
						options.fontPath ??= 'public/material-symbols.woff2';
						options.fontBase ??= './';

						const retCode = await downloadFiles(
							variant,
							codepoints.length > 0
								? codepoints
								: // Small hack to avoid downloaded a 3MB font file,
									// We add at least one icon to have a minimal font file size.
									['f866'],
						);

						const base = join(config.base, options.fontBase);

						// Should we reflect changes?
						if (
							// New downloaded files?
							retCode == 1 ||
							// User changed stylesheet destination path?
							getStyleSheetCachedDestination() !== options.stylesheetPath ||
							// User changed font destination path?
							getFontCachedDestination() !== options.fontPath ||
							// User changed font base path?
							getFontBase() !== base ||
							// Stylesheet was deleted?
							!existsSync(options.stylesheetPath) ||
							// Font file was deleted?
							!existsSync(options.fontPath)
						) {
							console.log('Yes should do something about it');

							const stylesheet = await getStyleSheet(variant);
							if (stylesheet === null) {
								throw new Error(
									"Couldn't get the content of the stylesheet, check your internet connection.",
								);
							}
							await cacheStyleSheetDestination(options.stylesheetPath, false);
							await cacheFontDestination(options.fontPath, false);
							await cacheFontBase(base);

							// Determine public path to font file
							const fontPath = join(base, basename(options.fontPath));

							const modifiedSS = replaceSymbolsFontUrlInStyleSheet(
								stylesheet,
								fontPath,
							);

							// TODO: Should we delete previously copied files?

							// Moving files
							await Promise.all([
								// Stylesheet
								(async () => {
									const dest = options.stylesheetPath!;
									await mkdir(dirname(dest), {recursive: true});
									await writeFile(dest, modifiedSS);
								})(),
								// Font file
								(async () => {
									const dest = options.fontPath!;
									await mkdir(dirname(dest), {recursive: true});
									await cp('.mdicon/material-symbols.woff2', dest, {
										recursive: true,
									});
								})(),
							]);
						}
						// Caching the codepoints needs to be done at the very
						// end because in 'local' mode the given codepoints are
						// compared with the cached ones to determine if the files
						// need to be downloaded/updated or not.
						await cacheCodePoints(codepoints);

						options.linkTransformation ??= 'auto';
						switch (options.linkTransformation) {
							case 'auto':
								const cssPath = join(
									config.base,
									basename(options.stylesheetPath!),
								);
								return replaceSymbolsLink(
									html,
									`<link rel="stylesheet" href="${cssPath}">`,
								);
							case 'remove':
								return removeSymbolsLink(html);
							default:
								if (typeof options.linkTransformation == 'function') {
									return replaceSymbolsLink(
										html,
										await options.linkTransformation(),
									);
								} else {
									throw new Error(
										"`linkTransformation` needs to be 'auto', 'remove' or a function returning a string. Couldn't determine the type.",
									);
								}
						}
				}
			}
			return html;
		},

		transform(code, id) {
			if (config.command == 'serve' && !options.devMode) {
				// Do not transform icon names to codepoints during dev
				return null;
			}
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

export {mdIcon};
export default mdIcon;
