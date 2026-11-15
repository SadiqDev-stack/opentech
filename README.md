# OpenTech

One integrated platform for OpenTech courses, products, engineering innovations and custom project requests.

## Stack
HTML, CSS, vanilla JS, Node.js, Express, MongoDB, Mongoose, Cloudinary, Paystack, eBulkSMS, Nodemailer. Backend uses ES modules.

## Structure
- `frontend/` - all static files served to the browser.
- `backend/` - Express API, models, routes, services, middleware, utils.

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. `npm install`
3. `npm start`
4. Open `http://localhost:5000`

## Languages
Hausa is default, English available via the language switch.


## Configuration and patched flows

Copy `.env.example` to `.env` and configure `MONGODB_URI`, `JWT_SECRET`, and `APP_URL` before starting. Public course/product/project lists require a reachable MongoDB connection. Paystack checkout requires its server secret and a valid public key; Cloudinary uploads require all three Cloudinary settings. Admin email verification and password reset links require working SMTP settings. Without these external services, the app returns a clear unavailable message rather than claiming an action succeeded.

The public request form remains available without signing in. If an email already belongs to an account, checkout and project requests require that account to be signed in; an email typed into a public form never grants access to another customer's account.

Run `npm test` to execute the included checkout input and password-reset token tests.
