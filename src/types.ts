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

	symbols: {
		/**
		 * Filepath where to save the downloaded Material Symbols stylesheet.
		 *
		 * @default 'public/material-symbols.css'
		 */
		stylesheetPath?: string;
		/**
		 * Filepath where to save the downloaded Material Symbols reduced font.
		 *
		 * @default 'public/material-symbols.woff2'
		 */
		fontPath?: string;
	};

	/**
	 * Whether or not to include commented icon names in the search.
	 *
	 * @default false
	 */
	includeComments: boolean;
}
