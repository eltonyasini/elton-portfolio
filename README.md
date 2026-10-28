# Public portfolio hosting artifact

This public repository contains only the prebuilt portfolio and its Pages deployment workflow. The maintained working project, original Git history, local CMS, editable originals and private archives are excluded. The published site is publicly accessible.

## Deployment

The October 28 UI refinement is documented in `REFINEMENTS.md`. Changes to
`site/**` on `main` now deploy automatically; manual workflow dispatch remains
available. The original export instructions below describe the initial release.

Current mount: `/elton-portfolio/`. For a different repository name or a user-site/custom-domain root, re-export with the correct base before publishing. Upload the contents of this folder to the new hosting repository, select Settings → Pages → GitHub Actions, then manually run **Deploy public portfolio**. The workflow has only a manual trigger; it does not deploy merely because files were copied. It uploads **site/** only, without a Node install or backend. The workflow uses the versions in GitHub's official custom-workflow guide checked on October 28, 2026: checkout v6, configure-pages v5, upload-pages-artifact v4, deploy-pages v4. These are supported documented versions, not a claim they are the newest release. Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages . The v4 uploader excludes dotfiles; .nojekyll is supplied for alternative branch/static hosting and is unnecessary for an Actions prebuilt upload.

## Local export (private maintained project)

From the maintained project's root, using its existing dependencies:

```sh
node tools/build-github-pages.mjs --base /elton-portfolio/
node tests/github-pages-export.mjs
node tests/github-pages-browser.mjs
# Another mount or a root-site export, always to a separate output:
node tools/build-github-pages.mjs --base / --out ../github-pages-root
```

The reusable exporter and tests remain PRIVATE in the maintained project; they are not needed in this prebuilt hosting repository. Re-export after edits; the hosting output is generated, not a second CMS. Existing non-export folders and Git repositories are refused. After the hosting folder becomes a Git checkout, export to another separate folder with --out ../github-pages-next and copy only its reviewed public output into the hosting checkout; never run this exporter over a Git repository. Source changes during export abort publication.

## Static architecture

Content is loaded solely from prefixed content JSON; there are no API calls. Three canonical brand routes have their own index.html for direct navigation/refresh (Pages may add a trailing slash). Existing six legacy hash routes and old brand hash redirects are retained. 404.html boots the same router for unknown paths; truly unknown URLs show Page not found with HTTP 404, not a misleading redirect to home. All script/style/media URLs and sandboxed HTML preview image/CSP scopes use the configured mount. The original strict HTML sanitizer and empty iframe sandbox remain in effect. No remote email assets are newly permitted.

Media is copied byte-for-byte from current approved public references, including responsive crops. Unused legacy brand galleries are removed from the main data document; canonical brand chapters, current covers/order and all six core projects are retained. YouTube playback remains consent-based and requires YouTube/network availability; it is not mirrored. No transcoding, redesign or editable-source distribution is performed.

export-manifest.json records every site file's bytes and SHA-256. Browser verification is run separately against a real no-API HTTP server with byte-range video support.
