# rollup-plugin-md-icon

Generates fonts including only the symbols you use in your app ✨

## Install

`npm add -D rollup-plugin-md-icon`

## ⚒️ Usage

```js
import {mdIcon} from 'rollup-plugin-md-icon';

export default {
	plugins: [
		mdIcon({
			variant: 'outlined', // default
			// other options...
		}),
	],
};
```

By default, the plugin does nothing than just converting icon names to codepoints.  
We will need to link a stylesheet loading the font that can display the symbols.  
From here we have 2 options:

### 1. Request the stylesheet from fonts.googleapis.com

During development we can use the full symbols font

```html
<head>
	<link
		id="symbols"
		href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
		rel="stylesheet"
	/>
</head>
```

_(⚠️ Notice the `id="symbols"` which is **required** so the plugin understands that this link needs to be minified!)_

<details>
  <summary>Working offline</summary>

If requesting a resource over the network is not possible, `rollup-plugin-md-icon` provides an offline stylesheet you can use instead:

- Create a symbolic link inside your static directory:

```
cd www
ln -s ../node_modules/rollup-plugin-md-icon/all-symbols .
```

- Update your `index.html`:

```
<head>
  <link id="symbols" href="./all-symbols/material-symbols.css" rel="stylesheet">
</head>
```

</details>

Of course for final bundle we'll need to transform this link to incorporate only the icons we need. It quite depends on the tools we use but here's an example using [ `@web/rollup-plugin-html` ](https://modern-web.dev/docs/building/rollup-plugin-html/),

```js
import {mdIcon, transformSymbolsLink} from 'rollup-plugin-md-icon';
import {rollupPluginHTML as html} from '@web/rollup-plugin-html';

export default {
	plugins: [
		mdIcon(),
		html({
			transformHtml: transformSymbolsLink,
		}),
	],
};
```

### 2. Serve the stylesheet/font locally

<!-- TODO: complete this section -->
<!-- The plugin offers -->

## How it works

The plugin scans the source code on build start (also works in watch mode) to build a list of all used icons called a codepoints list. This list is used in URLs to instruct the Google Font server to serve a final font file that only contain these icons. The icon names are converted to codepoints in the final bundle.

## Known limitations

- The plugin scans all the files matching the provided glob pattern (option `include`) which means the final font could potentially includes icons that are or will not be used at runtime if some files are being excluded from the module graph at build time.

## License

MIT
