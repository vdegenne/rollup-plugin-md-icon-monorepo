import {existsSync} from 'fs';
import {mkdir, readFile, unlink, writeFile} from 'fs/promises';
import {
	Variant,
	downloadSymbolsFontFromStyleSheet,
	downloadSymbolsFontStyleSheet,
} from 'mwc3-back-helpers';
import {type CodePoint} from 'mwc3-back-helpers/codepoints-maps.js';
import {join} from 'path';

export const CACHED_DIRECTORY = '.mdicon';
export const CACHED_FILEPATH = join(CACHED_DIRECTORY, 'cache.json');

interface Cache {
	variant: Variant;
	codepoints: CodePoint[];
	stylesheetDestination?: string;
	fontDestination?: string;
	fontBase?: string;
}

let _cache: Cache = {
	variant: Variant.OUTLINED,
	codepoints: [],
	stylesheetDestination: undefined,
	fontDestination: undefined,
	fontBase: undefined,
};
if (existsSync(CACHED_FILEPATH)) {
	const content = (await readFile(CACHED_FILEPATH, 'utf8')).toString();
	_cache = JSON.parse(content);
}

export function emptyCache() {
	_cache = {
		variant: Variant.OUTLINED,
		codepoints: [],
		stylesheetDestination: undefined,
		fontDestination: undefined,
		fontBase: undefined,
	};
}

export function getCachedVariant() {
	return _cache.variant;
}
export function getCachedCodePoints() {
	return _cache.codepoints.slice(0);
}

export function getStyleSheetCachedDestination() {
	return _cache.stylesheetDestination;
}
export function getFontCachedDestination() {
	return _cache.fontDestination;
}
export function getFontBase() {
	return _cache.fontBase;
}

async function saveCache() {
	await mkdir(CACHED_DIRECTORY, {recursive: true});
	await writeFile(CACHED_FILEPATH, JSON.stringify(_cache));
}

export async function cacheCodePoints(codepoints: CodePoint[], save = true) {
	_cache.codepoints = codepoints.slice(0);
	_cache.codepoints.sort();
	save && (await saveCache());
}
export async function cacheStyleSheetDestination(
	destination: string,
	save = true,
) {
	_cache.stylesheetDestination = destination;
	save && (await saveCache());
}
export async function cacheFontDestination(destination: string, save = true) {
	_cache.fontDestination = destination;
	save && (await saveCache());
}
export async function cacheFontBase(base: string, save = true) {
	_cache.fontBase = base;
	save && (await saveCache());
}
export async function cacheVariant(variant: Variant, save = true) {
	_cache.variant = variant;
	save && (await saveCache());
}

export function codePointsDifferentFromCache(codepoints: CodePoint[]) {
	const cps = codepoints.slice(0);
	cps.sort();

	return (
		cps.length !== _cache.codepoints.length ||
		!cps.every((cp, i) => _cache.codepoints[i] === cp)
	);
}

/**
 * For integrity there should be only one stylesheet in
 * the cached directory.
 *
 * @returns 0 if no download was necessary or 1.
 */
export async function downloadFiles(variant: Variant, codepoints: CodePoint[]) {
	const filepath = join(CACHED_DIRECTORY, `material-symbols-${variant}.css`);
	let exists: boolean;
	if (
		(exists = existsSync(filepath)) &&
		!codePointsDifferentFromCache(codepoints)
	) {
		return 0;
	}
	// We destroy other variants if they exist
	if (!exists) {
		await destroyAnySavedFiles();
	}
	const stylesheet = await downloadSymbolsFontStyleSheet(variant, codepoints, {
		filepath,
	});
	await downloadSymbolsFontFromStyleSheet(stylesheet);
	await cacheCodePoints(codepoints);
	return 1;
}

export async function destroyAnySavedFiles() {
	for (const variant of Object.values(Variant)) {
		try {
			await unlink(join(CACHED_DIRECTORY, `material-symbols-${variant}.css`));
		} catch (error) {}
	}
}

/**
 * Get the content of the saved stylesheet if it exists
 * null otherwise.
 */
export async function getStyleSheet(variant: Variant) {
	try {
		return (
			await readFile(join(CACHED_DIRECTORY, `material-symbols-${variant}.css`))
		).toString('utf8');
	} catch (error) {
		return null;
	}
}
