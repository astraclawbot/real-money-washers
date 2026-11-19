# Real Money Washers
A static website built with HTML, CSS, and JavaScript.

## AWS services used
- **Amazon S3:** Stores the website files in a private bucket.
- **Amazon CloudFront:** Caches and delivers the website, using Origin Access Control (OAC) to access S3.

## Run locally
Run commands from the `real-money-washers` project root. Requires Node.js 20 or later. No dependencies to install.
```sh
npm run dev
```
Open http://localhost:4173. Stop with Ctrl+C.

## Build
```sh
npm run build
```
For S3 and CloudFront, upload the contents of the generated `dist/` folder to the bucket root, with `index.html`, the other HTML pages, and `assets/` side by side. Set the CloudFront default root object to `index.html`.

## Edit
Page fragments: `src/pages/`. Shared header/footer: `src/header.html` and `src/footer.html`. Styles: `src/styles.css`, `src/pages.css`. Behaviour: `src/main.js`, `src/contact.js`. Assets: `public/assets/`.

