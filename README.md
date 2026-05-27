# Anime Website

Static anime website ready for deployment.

## Run locally

This is a static site — open `index.html` in your browser, or serve it with a static server.

Quick start:

```bash
# install optional tooling
npm install

# (optional) install netlify CLI globally for deployment
# npm install -g netlify-cli
```

## Deploy options

- Netlify (recommended for static sites):

	1. Create a GitHub repository and push this project.
	2. On Netlify, create a new site > "Import from Git" and connect your GitHub repo.
	3. For build command leave blank (static) and set publish directory to `/` (project root) or the folder that contains `index.html`.

	Or deploy directly from your machine using the Netlify CLI:

	```bash
	# login once (interactive)
	npx netlify-cli login

	# deploy (first time, omit --prod to get a draft)
	npx netlify-cli deploy --dir .

	# to do a production deploy set NETLIFY_SITE_ID env var or pass --site <site-id>
	NETLIFY_SITE_ID=your_site_id npx netlify-cli deploy --prod --dir .
	```

- GitHub Pages: create a GitHub repo, push, then enable Pages from the repo settings (choose root branch).

This repository includes GitHub Actions workflows to automate publishing:

- `deploy-pages.yml` — automatically uploads the repository root as a Pages site when you push to `main`.
- `deploy-netlify.yml` — optional Netlify deploy on push to `main` if you add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` as repository secrets.

To publish from your machine (example commands):

```bash
# 1) Create a GitHub repo (on github.com) and copy its URL, or create via `gh repo create`.
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main

# 2) (Optional) Add Netlify secrets in the GitHub repo settings if you want Netlify deploys:
#    - NETLIFY_AUTH_TOKEN (create a personal token in Netlify)
#    - NETLIFY_SITE_ID (your site's id)

# After pushing, GitHub Actions will run and publish to GitHub Pages automatically.
``` 

## Automated deploy via CI

If you prefer continuous deploys, connect the GitHub repo to Netlify and it will auto-deploy on push.

## Scripts

Run `npm run deploy:login` to start Netlify login, `npm run deploy` to deploy using the `NETLIFY_SITE_ID` environment variable.

