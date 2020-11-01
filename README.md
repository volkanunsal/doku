# doku

Commandline tool to generate a PDF file from markdown input.

```
       __      __
  ____/ /___  / /____  __
 / __  / __ \/ //_/ / / /
/ /_/ / /_/ / ,< / /_/ /
\__,_/\____/_/|_|\__,_/

```

## Installation

Currently only way to install it is by cloning the repo and linking the package.

```
git clone git@github.com:volkanunsal/doku.git
cd doku
npm link

...

cd yourproject
npm link doku
```

## Options

```
--fileName [file]     -- name of the output file
--config [doku.json]  -- configuration file
--path [*.md]         -- glob
--dev  [false]        -- launch a browser
--css                 -- path or url to a custom stylesheet
--js                  -- path or url to a custom Javascript include
--puppeteerOptions    -- override default options of puppetter
--outputDir           -- output directory
--tocLevels           -- table of content levels. default: 'h1, h2, h3, h4'
```

## Usage

In your project directory, create a file named `doku.json`. In this file there must be a property named `files`. The value of this property should be an array of relative paths of Markdown documents you'd like to convert.

```json
{
  "files": ["test/example.md"]
}
```

Run the `doku` command.

```
doku
> PDF file created: file.pdf
```
