# doku

Commandline to to generate a pdf file from markdown files.

`doku` is designed to make the process of building downloadable PDFs from markdown files.

## Features

- table of contents: doku can automatically generate a table of contents for you.
- customizable via css
- customizable via Javascript
- extensible Markdown renderer
- full power of Puppeteer for pdf rendering
- simple and easy to use from commandline

```
       __      __
  ____/ /___  / /____  __
 / __  / __ \/ //_/ / / /
/ /_/ / /_/ / ,< / /_/ /
\__,_/\____/_/|_|\__,_/

```

## Installation

```
npm install doku-md
```

## Usage

The easiest way to get started with it is to run `doku` at the root of your documentation project.

```
> doku --glob '*.md'
Success! PDF file created
Open now: file.pdf
```

## Options

```
--fileName [file]     -- name of the output file
--config [doku.json]  -- configuration file
--glob [*.md]         -- glob
--dev  [false]        -- launch a browser
--css                 -- path or url to a custom stylesheet
--js                  -- path or url to a custom Javascript include
--puppeteerOptions    -- override default options of puppetter
--outputDir           -- output directory
--tocLevels           -- table of content levels. default: 'h1, h2, h3, h4'
```

## Advanced usage

### Table of contents

In your markdown files, add a `<toc>` tag where you want to insert an automatically generated table of contents. This tag will scan the rest of the document for h1, h2, h3, and h4 headers and build an indented table of contents at that location.

```md
<toc>

## My Header

lorem ipsum
```

### Configuration file

You can use a `doku.json` file to pass your options. This file also takes an `entries` property where you can specify the files you'd like to use for your pdf. This is a great option if you want more precise control over your input files than a glob would provide.

Example:

```json
{
  "fileName": "Documentation.pdf",
  "entries": ["Chapter1.md", "Chapter2.md"]
}
```

```
> doku
Success! PDF file created
Open now: Documentation.pdf
```

### Custom stylesheet

Under the hood, `doku` uses Bootstrap library to reboot the browser defaults. You can use any Bootstrap utility class to customize the appearance of your markdown files.

You can also pass your own stylesheet through the commandline.

```
doku --css mystyles.css
```

### Custom Javascript

If you'd like to modify the DOM using Javascript, you can pass your own Javascript file.

```
doku --js myscript.js
```

In your file, you can use jQuery. To ensure that the page is completely rendered, listen for the `doku-rendered` custom event.

```js
window.addEventListener(`doku-rendered`, () => { ... })
```

### Extending Markdown renderer

Under the hood, `doku` uses the [`marked`](https://github.com/markedjs/marked) Markdown renderer. The renderer will be available at `window.marked` property. Check out [the "how-to" page of marked](https://marked.js.org/using_pro) to get a better sense of how to extend the renderer.

### Customizing Puppeteer

If you want more control over your PDF, including customization for header and footer templates, you can pass `puppeteerOptions` to `doku` to override any of the defaults.
