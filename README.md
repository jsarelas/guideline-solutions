# Guideline Solutions AI Consulting Frontend

Responsive React + TypeScript frontend for Guideline Solutions, with Home, CEO, and Contact pages.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The contact form opens a prefilled email draft in the visitor’s email app; it does not send automatically.

## Deploy (Azure Static Web Apps)

The site is hosted on Azure Static Web Apps (Free tier).

**Site content** is deployed by GitHub Actions
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): every push to
`main` builds and deploys to production, and every pull request gets a preview
URL that is deleted when the PR closes. It uses the repo secret
`AZURE_STATIC_WEB_APPS_API_TOKEN` (Settings → Secrets and variables →
Actions). To set or rotate it:

```sh
cd infra
terraform output -raw deployment_token | pbcopy
```

**Infrastructure** (the static web app and the `www.guidelinesolutions.com`
domain binding) is managed by Terraform in `infra/`. It rarely changes, so it
is run by hand. State is stored in the `guidelinetfstate` storage account
(container `tfstate`), so any machine logged in with `az login` sees the same
state. Prerequisites: Terraform 1.5+ and `az login` to the subscription.

```sh
cd infra
terraform init
terraform plan
terraform apply
```

The state storage account was created once by
`infra/scripts/bootstrap-state.sh`; Terraform can't create its own backend.

URLs have no `.html`. Each page is prerendered to its own folder
(`dist/founder/index.html`) and served at `/founder`. Old `/founder.html`,
`/contact.html`, `/ceo` and `/about` links permanently redirect to the clean
URL, and trailing slashes are dropped. These rules live in
`public/staticwebapp.config.json`; check them locally with
`npx @azure/static-web-apps-cli start dist` (the emulator doesn't apply the
trailing-slash redirect, Azure does).

### First-time domain setup (GoDaddy DNS)

The custom domain is validated by CNAME, so `www` has to point at the static
web app before Azure can bind it and issue the free certificate.

1. Run `terraform apply` with `-var custom_domain=""`, then test the site at
   the `static_web_app_url` output.
2. At GoDaddy, change the `www` CNAME to the `dns_cname_record` value.
3. When the new CNAME resolves, run `terraform apply` (with the default
   `custom_domain`). Azure validates the CNAME and issues the certificate,
   usually within minutes; until then https://www shows a certificate warning.
