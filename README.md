# Abayat Store

Arabic RTL ecommerce demo with storefront, guest checkout, product sizes, collections, image management, admin previews and account screens.

## Run locally

```sh
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765`. No dependency installation or build is required.

## Tests

```sh
node tests/store.cjs
node tests/accounts.cjs
```

## Deployment

Vercel serves only `dist`, as configured by `vercel.json`. This repository also retains the existing Sites project manifest under `.openai/hosting.json`; it is not part of the public site output.

## Demo limitations

Authentication and roles are UI previews. Passwords are not stored or checked. Emails are previews, not sent. Products, orders and images persist only in the current browser. No payments or shipping are performed. Do not enter real customer data or real passwords.

Firebase migration contracts and handoff: `integration/firebase/README.md`.

## Payment tracking

Private billing records are kept locally in `finance/payments.json` and `finance/PAYMENTS.md`. The whole finance directory is excluded from Git and deployments. Never put bank details, invoices or payment evidence in `dist`.
