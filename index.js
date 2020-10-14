#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');
const fg = require('fast-glob');
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
  const browser = await puppeteer.launch({ headless: false });
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

  try {
    await page.setContent(
      `
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
            async
          />
          <script
            src='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js'
            type='text/javascript'
            async
          />
          <script src="https://gist.githubusercontent.com/volkanunsal/4f6a0e1d52f871b970feb7c0326872ab/raw/331a7625f6f234f413f05729a7a10d5b3307d020/toc.js" async></script>
          <script type='text/javascript'>
            (() => {
              tableOfContents('#toc', '#toc', { levels: 'h1, h2, h3, h4' });
            })();
          </script>

          <script type="module" src="https://cdn.jsdelivr.net/npm/zero-md@next/dist/zero-md.min.js" async></script>
        </head>
        <body>
          <div className='top'>
            <main className='container'>
              <div className='row'>
                <article className='col-lg-12'>
  ${entries.map(
    (v) => `<zero-md no-shadow src="file://${process.cwd()}/${v}"></zero-md>`
  )}
                </article>
              </div>
            </main>
          </div>
        </body>
      </html>
    `,
      { waitUntil: 'networkidle2' }
    );

    // await page.pdf({
    //   path: `./${fileName}.pdf`,
    //   headerTemplate: '<div></div>',
    //   footerTemplate:
    //     "<div style='width: 100%; text-align: right; font-size: 10px; color: #333; padding-right: 30px;'><span class='pageNumber'></span></div>",
    //   displayHeaderFooter: true,

    //   format: 'A4',
    //   margin: {
    //     bottom: 70,
    //     left: 10,
    //     right: 10,
    //     top: 70,
    //   },
    // });
  } catch (error) {
    console.log(error);
  }
  console.log('PDF file created:', fileName + '.pdf');
  // await browser.close();
};

module.exports.main = main;
if (require.main === module) {
  main();
}
