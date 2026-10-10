# Firebase integration handoff — structure only

## Current implementation
- `dist/services/accounts.js`: browser-local demo provider. It does not store or verify passwords and does not send email. Session selection is only a UI preview, not authentication.
- `dist/accounts.js`: sign up, sign in, forgotten/reset password previews, client profile, client order list, admin preview, clients list, and order email preview.
- `dist/catalogue.js`: editable collections and product-specific sizes. Product stock remains total across sizes.
- `contracts.ts`: proposed boundaries for replacing the demo implementation. Not a Firebase SDK or an operational backend.
- `emails.mjs`: server-side email rendering templates, not loaded into the website.

## When connecting Firebase
1. Select Firebase project and target hosting. Preserve the current private Sites demo until the replacement is ready. Do not attach real credentials to the demo provider.
2. Replace account provider with Firebase Authentication. Use an auth-state subscription so routing waits for restored identity. Remove `enterPreview`, demo password notices and local role selection only once real authentication is active.
3. Map reset links/action codes to the reset screen. Never reuse the demo `resetPreview` flag to authorize a real reset.
4. Create customer profiles with client role only. Assign admin authority via trusted server custom claims, never a browser-writable role field. Enforce claims on every server mutation and data access.
5. Move products, collections, profiles and orders to Firestore. Fetch bounded pages and queries, not entire collections. Protect customer order reads by their authenticated UID.
6. Keep `createOrder` callable WITHOUT a user account. An authenticated token is optional, but if supplied it must be verified. Ignore any customerId/role/price/total from the client. Validate sizes, products, stock and current prices on the server. Use an atomic transaction and an idempotency key to reserve stock and create exactly one order.
7. Guest receipts must use a high-entropy, revocable token returned once and stored hashed server-side. Do not make guest orders enumerable by number/email, and never allow public reads of the orders collection.
8. Add throttling, input size bounds and abuse checks for guest checkout. Returning visitors must not see other clients' orders. Do not assign old guest orders to a new account merely because email strings match.
9. Send order confirmation only after order creation commits. Use a server-managed email outbox / trusted function with a transactional email provider or configured email extension. Firebase Auth password emails are separate from order notifications. Keep provider secrets server-side; retry with a stable message ID to prevent duplicates. Missing optional email must not block guest orders.
10. Move product images to Storage with admin-only upload/write rules; use thumbnails and file type/size limits. Test security rules and Functions with emulators, then test actual mail delivery and concurrent stock reservations before release.

## Data preservation and test limits
Current products/orders/images are browser-local demo data. Import only intentionally selected data; do not import demo profiles or sample orders into production. Category IDs `black` and `beige` are preserved. Removed collections reassign products to `uncategorized` without deleting products. Product sizes default to S/M/L/XL/XXL for legacy products. A removed size already in a cart blocks checkout until reselected.

No Firebase project, authentication, email provider, security rules, Cloud Functions or production authorization is deployed by this structure-only update.
