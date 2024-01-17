import {constructSymbolsFontStyleSheetUrl} from 'mwc3-back-helpers/fonts.js';
import {getCachedCodePoints, getCachedVariant} from './cache.js';

export const SYMBOLS_LINK_REGEX = /<link\s+[^>]*id=["']?symbols["']?[^>]*>/;

export function minifySymbolsLink(html: string) {
	if (!SYMBOLS_LINK_REGEX.test(html)) {
		throw new Error(
			'Material Symbols stylesheet link couldn\'t be found in the provided html. Please use [id="symbols"] on the link tag.',
		);
	}

	return replaceSymbolsLink(
		html,
		`<link href="${constructSymbolsFontStyleSheetUrl(
			getCachedVariant(),
			getCachedCodePoints(),
		)}" rel="stylesheet" />`,
	);
}

export function replaceSymbolsLink(html: string, replaceWith: string) {
	if (!SYMBOLS_LINK_REGEX.test(html)) {
		throw new Error(
			'Material Symbols stylesheet link couldn\'t be found in the provided html. Please use [id="symbols"] on the link tag.',
		);
	}

	return html.replace(SYMBOLS_LINK_REGEX, replaceWith);
}

export function removeSymbolsLink(html: string) {
	return html.replace(SYMBOLS_LINK_REGEX, ``);
}
