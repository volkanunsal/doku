# doku

Commandline tool to generate pdf from markdown.


## Installation

Currently only way to install it is by forking the repo and linking it.

```
git clone https://github.com/volkanunsal/doku
cd doku 
npm link

...

cd yourproject
npm link doku
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

## TODO

1. Render images
1. Generate table of contents
1. Handle globs 
1. Generate HTML



