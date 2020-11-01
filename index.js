#!/usr/bin/env node
const fs = require('fs');
const nodePath = require('path');
const puppeteer = require('puppeteer');
const fg = require('fast-glob');
const express = require('express');
const app = express();
const expand = require('./expand');
const chalk = require('chalk');
const argv0 = require('minimist');

const main = async () => {
  const argv = argv0(process.argv.slice(2));
  let options = argv;
  let { config = 'doku.json', help, h } = options;

  if (help || h) {
    console.log(
      chalk.yellow(`DOKU

Options:
    --fileName [file]     -- name of the output file
    --config [doku.json]  -- configuration file
    --glob [*.md]         -- glob
    --dev  [false]        -- launch a browser
    --css                 -- path or url to a custom stylesheet
    --js                  -- path or url to a custom Javascript include
    --puppeteerOptions    -- override default options of puppetter
    --outputDir           -- output directory
    --tocLevels           -- table of content levels. default: 'h1, h2, h3, h4'
    --outputPath          -- output path (supersedes other output options)
`)
    );
    return;
  }

  if (config && fs.existsSync(config)) {
    const configFile = JSON.parse(fs.readFileSync(config, 'utf8'));
    options = { ...options, ...configFile };
  }

  let {
    glob,
    fileName = 'file',
    dev,
    css,
    js,
    puppeteerOptions = '',
    outputDir = './',
    tocLevels = 'h1, h2, h3, h4',
    outputPath,
    entries = [],
  } = options;

  const fileServerUrl = 'http://localhost:9999/';
  const headless = !dev || (dev !== 'true' && dev !== true);

  const browser = await puppeteer.launch({ headless });
  fileName = fileName.endsWith('.pdf')
    ? fileName.replace('.pdf', '')
    : fileName;
  const page = await browser.newPage();

  if (glob) {
    if (fs.existsSync(glob)) {
      console.error(
        chalk.red('Error: ') +
          'You have specified a file, not a glob. Try surrounding your glob with quotation marks.'
      );
      process.exit(1);
    } else {
      entries = await fg([glob]);
    }
  }

  if (entries.length === 0) {
    console.error(chalk.red('Error: ') + 'No files were found.');
    process.exit(1);
  }

  app.use(
    '/',
    express.static(process.cwd() + '/', {
      setHeaders: (res) => {
        res.header('Access-Control-Allow-Origin', '*');
      },
    })
  );

  let customStyles = '';
  if (css)
    customStyles = `<link rel="stylesheet" type="text/css" href="${css}">`;

  let customScripts = '';
  if (js)
    customScripts = `<script src="${js}" type="text/javascript" charset="utf-8" ></script>`;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title></title>
      <style type='text/css'>
        @import 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
        @import 'https://use.fontawesome.com/releases/v5.14.0/css/all.css';
      </style>
      <meta charSet='utf-8' />
      <meta httpEquiv='x-ua-compatible' content='ie=edge' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <script
        src='https://code.jquery.com/jquery-3.5.1.min.js'
        type='text/javascript'
      ></script>
      <script
        src='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js'
        type='text/javascript'
      ></script>
      <script type='text/javascript' src="https://cdn.jsdelivr.net/gh/volkanunsal/doku@master/toc.js"></script>
      <script type='text/javascript'>
        let counter = 1;
        window.addEventListener('zero-md-rendered', () => {
          if(counter === ${entries.length}) {
            tableOfContents('toc', 'toc', { levels: ${tocLevels} });
            // Dispatch a custom event.
            const event = new Event('doku-rendered');
            window.dispatchEvent(event);
          }
          counter = counter + 1;
        });
      </script>
      <script type="module" src="https://cdn.jsdelivr.net/npm/zero-md@next/dist/zero-md.min.js"></script>
      ${customStyles}
      ${customScripts}
    </head>
    <body>
      <main className='container'>
        <div className='row'>
          <article className='col-lg-12'>
${entries
  .map((v) => `<zero-md no-shadow src="${fileServerUrl}${v}"></zero-md>`)
  .join('')}
          </article>
        </div>
      </main>
    </body>
  </html>
`;
  app.get('/', (_, res) => {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(html));
  });
  app.listen(9999);

  await page.goto(fileServerUrl, { waitUntil: 'networkidle2' });

  if (dev) {
    browser.on('disconnected', () => {
      process.exit(1);
    });
  } else {
    console.log(chalk.yellow('Please wait...'));

    // Expand options into an object
    puppeteerOptions = expand(puppeteerOptions);
    let outputPath1 = outputPath || `${outputDir}/${fileName}.pdf`;
    const outputPath2 = nodePath.resolve(outputPath1);

    try {
      await page.pdf({
        printBackground: true,
        path: outputPath2,
        headerTemplate: '<div></div>',
        footerTemplate:
          "<div style='width: 100%; text-align: right; font-size: 10px; color: #333; padding-right: 30px;'><span class='pageNumber'></span></div>",
        displayHeaderFooter: true,
        format: 'A4',
        margin: {
          bottom: 70,
          left: 10,
          right: 10,
          top: 70,
        },
        ...puppeteerOptions,
      });
    } catch (error) {
      console.log(error);
    }

    console.log(chalk.green('Success! ') + 'PDF file created');
    console.log(chalk.green('Open now: ') + outputPath2);
    await browser.close();
    process.exit(1);
  }
};

module.exports.main = main;
if (require.main === module) {
  main();
}
