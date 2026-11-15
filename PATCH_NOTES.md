# OpenTech patched source

## Fixes included
- Database-backed API routes now wait for MongoDB and return a clear temporary-unavailable response instead of timing out behind catalog shimmer; `/api/health` remains available. Vercel can import the Express app without starting a listening server.
- Request/error logs use request IDs and omit query strings, protecting one-time admin/reset tokens. Admin email login reports a configuration failure instead of claiming a mock email was delivered.
- Catalog requests have a timeout. Home catalog sections load concurrently, search input is encoded, and course/product cards link to their actual detail pages.
- Course enroll and product buy actions select the intended item. Cart includes per-item purchase and a working Purchase All checkout form. Project detail has share links and opens a prefilled similar-project request.
- Public uploads remain available without a customer login, are rate-limited, require Cloudinary configuration, and sign only the expected folder/formats; upload errors are surfaced.
- Existing accounts cannot be accessed by submitting their email in a public order or project form. Existing-account purchases/requests require the matching signed-in customer; safe new-account checkout still works.
- Password recovery now sends a generic, expiring, one-time reset link and only stores a SHA-256 digest. Removed unauthenticated password replacement.
- The admin page shell moves already-rendered page nodes once instead of re-executing all page scripts. Account and admin layouts now adapt to smaller screens.
- Fixed a missing JSON response in admin report updates.

## Verification
Run `npm test` and `npm start` with your own environment settings. Automated security/checkout validation tests are included. Live database, SMTP, Cloudinary, and Paystack transactions were not tested because the source archive contained no usable credentials or record export.

## Stack
Node.js, Express, Mongoose/MongoDB, static HTML/CSS, and vanilla JavaScript are unchanged.
