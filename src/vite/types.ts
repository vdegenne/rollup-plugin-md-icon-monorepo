export type Mode = 'fonts.googleapis.com' | 'local';

export type TransformationFunction = () => string | Promise<string>;

export interface MdIconPluginOptions {
	/**
	 * The mode used to determine how to bundle resources
	 * at build time. There are 2 modes:
	 *
	 * - 'fonts.googleapis.com': Use this option if you
	 *   want to convert the link (`[id="symbols"]`) to
	 *   point to a minfied version of the font.
	 *   The font will still be served by googleapis servers.
	 *
	 * - 'local': Use this option if you prefer to serve the
	 *   font directly. The font will be saved on the local
	 *   system. Use `stylesheetPath` and `fontPath` option
	 *   to customize the files' path.
	 *
	 *   @default 'fonts.googleapis.com'
	 */
	mode: Mode;

	/**
	 * In 'local' mode the files will be downloded only a build time.
	 * Sometimes the stylesheet needs to be available during development.
	 * Setting this option to `true` will force the plugin to download
	 * the files when the cache changes.
	 *
	 * @default false
	 * @deprecated
	 */
	downloadDuringDev: boolean;

	/**
	 * By default, the plugin will transform html (and download
	 * font in 'local' mode) only at build time.
	 * Though not recommended, you can use this option to force
	 * transform during development too.
	 *
	 * This option can also be helpful if you want to download
	 * the files in 'local' mode during development because your
	 * source code depends on it (e.g. using css import assertion
	 * to bundle the stylesheet in your builds)
	 *
	 * @default false
	 */
	devMode: boolean;

	/**
	 * This option is used in 'local' mode only.
	 * Determine how to transform the link in the final build.
	 * There are 3 options:
	 *  - 'auto':  By default the plugin will replace the link (`[id="symbols"]`)
	 *              with a link pointing to the stylesheet in the public directory.
	 *
	 *  - 'remove':  The link will be completed removed from the html,
	 *                it's particularly useful if you decide to bundle the stylesheet
	 *                in your code directly (e.g. using `CSSStyleSheet`)
	 *
	 *  - function: You can provide a function directly which will be used to replace
	 *            the link completely (it should return a string).
	 *            (e.g. `() => `'<link rel="stylesheet" href="./path/to/symbols.css">'`)
	 *
	 *
	 *  @default 'auto'
	 */
	linkTransformation: 'auto' | 'remove' | TransformationFunction;

	/**
	 * Filepath where to save the downloaded Material Symbols stylesheet.
	 *
	 * @default 'public/material-symbols.css'
	 */
	stylesheetPath: string;

	/**
	 * Filepath where to save the downloaded Material Symbols reduced font.
	 *
	 * @default 'public/material-symbols.woff2'
	 */
	fontPath: string;

	/**
	 * Base path to where the font is located relative to its
	 * stylesheet in the final public directory.
	 * By default the plugin assume both files will reside in the
	 * same directory and use `./` but if you choose a different
	 * font file path (`fontPath`) then you'll have to tweak this
	 * value.
	 *
	 * @default './'
	 */
	fontBase?: string;
	/**
	 * Base path to where the font should be accessed
	 * from the public directory.
	 *
	 * For instance if the font path is `./public/fonts/symbols.woff2`,
	 * then the base should be '/fonts'.
	 * This way it ensures that the stylesheet knows how to access
	 * the font file in production.
	 *
	 * @default '/'
	 */
	// base?: string;

	/**
	 * Files to search for icons
	 *
	 * @default 'src/** /*.{js,ts,jsx,tsx,html}'
	 */
	include: string | string[];
	exclude: string | string[];

	/**
	 * Variant of the icons to use.
	 *
	 * @default 'outlined'
	 */
	variant: 'outlined' | 'rounded' | 'sharp';

	/**
	 * Whether or not to include commented icon names in the search.
	 *
	 * @default false
	 */
	includeComments: boolean;
}
