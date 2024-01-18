export interface MdIconPluginOptions {
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
	 * Setting this field will instruct the plugin to download fonts locally
	 * which by default saves them under `dist`.
	 */
	symbols: {
		/**
		 * Filepath where to save the downloaded Material Symbols stylesheet.
		 *
		 * @default 'dist/material-symbols.css'
		 */
		stylesheetPath?: string;
		/**
		 * Filepath where to save the downloaded Material Symbols reduced font.
		 *
		 * @default 'dist/material-symbols.woff2'
		 */
		fontPath?: string;

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
		base?: string;
	};

	/**
	 * Whether or not to include commented icon names in the search.
	 *
	 * @default false
	 */
	includeComments: boolean;
}
