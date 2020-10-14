#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');
const fg = require('fast-glob');
const express = require('express');
const app = express();

const argv0 = require('minimist');

const main = async () => {
  const argv = argv0(process.argv.slice(2));
  let { path = '*.md', fileName = 'file', config = 'doku.json', help } = argv;
  if (help) {
    console.log(`DOKU

Options:
    --fileName [file]     -- name of the output file
    --config [doku.json]  -- configuration file
    --path [*.md]         -- glob
`);
    return;
  }
  const fileServerUrl = 'http://localhost:9999/';

  const browser = await puppeteer.launch();
  fileName = fileName.endsWith('.pdf')
    ? fileName.replace('.pdf', '')
    : fileName;

  const page = await browser.newPage();

  let entries = [];
  if (config && fs.existsSync(config)) {
    const configFile = JSON.parse(fs.readFileSync(config, 'utf8'));
    entries = configFile.files;
  } else if (path) {
    // FIXME: glob only fetches a single entry.
    entries = await fg([path]);
  }

  // FIXME: table of contents not showing up.

  app.use(
    '/',
    express.static(process.cwd() + '/', {
      setHeaders: (res) => {
        res.header('Access-Control-Allow-Origin', '*');
      },
    })
  );

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
            tableOfContents('#toc', '#toc', { levels: 'h1, h2, h3, h4' });
          }
          counter = counter + 1;
        });
      </script>

      <script type="module" src="https://cdn.jsdelivr.net/npm/zero-md@next/dist/zero-md.min.js"></script>
    </head>
    <body>
      <div className='top'>
        <main className='container'>
          <div className='row'>
            <article className='col-lg-12'>
            <aside id='toc'>
${entries
  .map((v) => `<zero-md no-shadow src="${fileServerUrl}${v}"></zero-md>`)
  .join('')}
            </aside>
            </article>
          </div>
        </main>
      </div>
    </body>
  </html>
`;
  app.get('/', (_, res) => {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(html));
  });
  app.listen(9999);

  try {
    await page.goto(fileServerUrl, { waitUntil: 'networkidle2' });

    await page.pdf({
      path: `./${fileName}.pdf`,
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
    });
  } catch (error) {
    console.log(error);
  }

  console.log('PDF file created:', fileName + '.pdf');
  await browser.close();
  process.exit(1);
};

module.exports.main = main;
if (require.main === module) {
  main();
}
