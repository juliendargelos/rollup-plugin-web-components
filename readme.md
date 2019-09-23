# rollup-plugin-web-components

This plugin provides a loader for single file web components, and injects their templates into html files.

## Install

```bash
yarn add rollup-plugin-web-components --dev
```

or

```bash
npm install rollup-plugin-web-components -D
```

## Usage

This plugin only injects component templates to assets emitted with the [emitFile()](https://rollupjs.org/guide/en/#thisemitfileemittedfile-emittedchunk--emittedasset--string) plugin context method and having `.html` as extension.

The following example uses [rollup-plugin-emit-files](https://github.com/juliendargelos/rollup-plugin-emit-files) to emit html pages to rollup bundle.

```javascript
// rollup.config.js

import webComponents from 'rollup-plugin-web-components'
import emitFiles from 'rollup-plugin-emit-files'

export default {
  // ...
  plugins: [
    webComponents(),
    emitFiles({
        src: 'src/pages',
        include: '**/*.html'
    })
  ]
}
```

```html
<!-- src/components/x-button.html !-->

<template id="x-button">
  <span>
    <slot></slot>
  </span>
</template>

<!-- The style element can be either inside or outside the template element !-->

<style>
  :host {
    border: 1px solid black;
    cursor: pointer;
  }
</style>

<script>
  export class XButton extends HTMLElement {
    constructor() {
      super()

      const template = document.getElementById('x-button')

      this
        .attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))
    }
  }
</script>
```

```javascript
// src/index.js

import {
    template, // template as string
    style, // style as string
    XButton // Anything else exported from the script tag is also available
} from './components/x-button.html'

customElements.define('x-button', XButton)
```

```html
<!-- src/pages/index.html !-->

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Page with web components</title>
  </head>
  <body>
    <x-button>hey</x-button>
    <script src="index.js"></script>
  </body>
</html>
```

The output folder will contain the following `index.html` file:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Page with web components</title>
  </head>
  <body>
    <template id="x-button">
      <style>
        :host {
          border: 1px solid black;
          cursor: pointer;
        }
      </style>
      <span>
        <slot></slot>
      </span>
    </template>

    <x-button>hey</x-button>
    <script src="index.js"></script>
  </body>
</html>
```

No matter wether the style element is inside or outside the template element:

- It will always be **inside** when injected into html
- It will always be **removed** and **exported separatly** when imported from javascript

## Options

```typescript
{
  extension?: string
  inject?: boolean
}
```

### extension

The extension which must be loaded with the web-components loader.

Default: `'.html'`

### inject

If set to true, the plugin will inject all templates from imported components to all html files emitted in the rollup bundle.

Default: `true`
