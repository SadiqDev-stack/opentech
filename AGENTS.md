# OpenTech source rules

- Keep the original Express/Mongoose API and static HTML/CSS/vanilla-JavaScript frontend; avoid introducing a new framework because this package must run on its existing stack.
- Keep database readiness checks before all data routes and leave `/api/health` available so temporary database outages fail clearly instead of hanging page loaders.
- Never authenticate an account based only on an email supplied by a public form; existing accounts require a valid session, while new guest records may be created without impersonating another account.
- Keep password-reset tokens one-time, expiring, and stored only as digests; never log authentication query values.
