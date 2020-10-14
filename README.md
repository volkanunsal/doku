# doku

Commandline tool to generate pdf from markdown.

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



