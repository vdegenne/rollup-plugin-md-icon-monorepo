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
		base?: string;

		include: string | string[];
	};

	/**
	 * Whether or not to include commented icon names in the search.
	 *
	 * @default false
	 */
	includeComments: boolean;
}
