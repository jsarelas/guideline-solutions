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

The site is hosted on Azure Static Web Apps (Free tier). `infra/` creates the
static web app and the `www.guidelinesolutions.com` domain binding, and
uploads `dist/` whenever it changes.

Prerequisites: Terraform 1.5+, Node, and `az login` to the subscription.

```sh
npm run build
cd infra
terraform init
terraform apply
```

URLs have no `.html`. Each page is prerendered to its own folder
(`dist/founder/index.html`) and served at `/founder`. Old `/founder.html`,
`/contact.html`, `/ceo` and `/about` links permanently redirect to the clean
URL, and trailing slashes are dropped. These rules live in
`public/staticwebapp.config.json`; check them locally with
`npx @azure/static-web-apps-cli start dist` (the emulator doesn't apply the
trailing-slash redirect, Azure does).

### First-time domain setup (GoDaddy DNS)

1. After the first `terraform apply`, test the site at the
   `static_web_app_url` output.
2. Add the `dns_txt_record` output at GoDaddy (Type TXT, Name `_dnsauth.www`).
3. Wait until the domain shows **Ready** in the portal under the static
   web app's **Custom domains**. The free certificate is issued then.
4. Change the `www` CNAME at GoDaddy to the `dns_cname_record` value.
