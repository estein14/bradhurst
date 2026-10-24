# Bradhurst map

React map hosted at https://estein14.github.io/bradhurst/ and embedded in
https://www.shopbradhurst.org/ through an iframe.

## Google Maps key

The app reads `REACT_APP_GOOGLE_MAPS_API_KEY` at build time. The resulting
JavaScript and Google Maps requests expose this browser key to visitors, even
when it is stored in a GitHub Actions secret. Protect its use in Google Cloud:

- Application restrictions: **Websites**, allowing `https://estein14.github.io/*`.
  Browsers commonly strip paths from cross-origin referrers, so restricting it
  to `/bradhurst/*` can block legitimate requests.
- API restrictions: **Restrict key**, allowing **Maps JavaScript API** for the
  current map. Links to Google Maps directions do not require Directions API.
- Use a separate key for other apps or local development.

The iframe uses Maps JavaScript API, not Maps Embed API. Restricting only to
`shopbradhurst.org` will not authorize the GitHub Pages document inside it.

## Configure GitHub deployment

1. In the repository's **Settings → Environments → prod → Environment secrets**,
   update the existing `GOOGLE_MAPS_API_KEY` secret with the restricted production
   key. The build job uses the `prod` environment and passes that secret to the
   React build as `REACT_APP_GOOGLE_MAPS_API_KEY`. No duplicate secret is needed.
   If `prod` limits deployment branches, ensure `main` is allowed and retain
   any required reviewer protections.
2. Commit and push `.github/workflows/deploy-pages.yml` with these setup files
   to `main`. If Pages is still configured to deploy from `gh-pages`, the first
   workflow run may fail at deployment until the next step is complete.
3. In **Settings → Pages → Build and deployment → Source**, select
   **GitHub Actions**. The workflow is already provided, so no template is needed.
4. In **Actions → Deploy map to GitHub Pages**, use **Run workflow** on `main`.
   Wait for both the build and deployment to succeed.
5. Verify the map directly and inside the live Shop Bradhurst page, including
   markers and filters. The existing iframe URL continues to work.

Future pushes to `main` build and deploy automatically. Updating a GitHub secret
does not trigger a build; run the workflow again after changing the key.
The workflow uploads only `build/` and does not commit generated JavaScript
to a publishing branch. The old `gh-pages` history can still contain old keys.

`npm run deploy` is the legacy local publishing command. It reads your local
environment instead of GitHub secrets; use the Actions workflow for production.

## Rotate an existing production key

1. In Google Cloud, inspect the existing key's usage and restrictions. Confirm
   whether any other apps depend on it before changing or retiring it.
2. For a key dedicated to this map, apply the website and API restrictions above,
   save, allow time for propagation, and verify the live map.
3. Open the key and choose **Rotate key → Create**. Rotation copies its
   restrictions and temporarily accepts both the previous and replacement keys.
   If the old key is shared, create a separate restricted map key instead.
4. Save the replacement in `prod`'s `GOOGLE_MAPS_API_KEY` environment secret,
   then run the deployment workflow. Keep the previous key active until the new
   deployment is verified.
5. Check both live URLs and Google Cloud usage. After all legitimate users of
   the previous key have migrated, choose **Delete the previous key** on the
   rotated key's page, or retire the old dedicated key if you created a separate
   replacement. Never delete a shared key that other apps still need.

Removing an old key from current files does not remove it from Git history.
Retiring the previous key makes those historical copies unusable.

## Local development

Copy `.env.example` to `.env.local`, set a separate development key restricted
to your local website origin and Maps JavaScript API, then run:

```sh
npm ci
npm start
```

Local `.env*` files are ignored except for the placeholder `.env.example`.
Restart the development server after changing an environment file.

## References

- [Google Maps API security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Create React App environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
