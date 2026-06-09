# Nocturne

[![CI](https://github.com/ohkyounghun/Nocturne/actions/workflows/test.yml/badge.svg)](https://github.com/ohkyounghun/Nocturne/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A community platform for discovering and sharing night view spots in Seoul. Browse spots on an interactive map, submit your own, and save the ones you like.

**Live demo:** https://nocturne-htdu.onrender.com &nbsp;·&nbsp; **API docs:** https://nocturne-htdu.onrender.com/api/docs

## Features

- Interactive Kakao Maps view of night spots across Seoul
- Submit a spot with title, description, and coordinates
- Filter spots by season (봄/여름/가을/겨울) and weather (맑음/흐림/비/눈)
- Like and bookmark spots
- Comment threads on each spot
- Register, log in, and manage your own submissions

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Backend     | Node.js, Express        |
| Database    | SQLite (`sqlite3`)      |
| Frontend    | Vanilla JavaScript      |
| Map         | Kakao Maps API          |
| Auth        | JWT, bcrypt             |
| API docs    | Swagger UI              |
| CI          | GitHub Actions          |
| Deployment  | Render                  |

## API

Write endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint                                  | Auth | Description                |
|--------|-------------------------------------------|------|----------------------------|
| POST   | `/api/auth/register`                      | —    | Create an account          |
| POST   | `/api/auth/login`                         | —    | Log in, returns a JWT      |
| GET    | `/api/spots`                              | —    | List top 10 spots (`?tag=`, `?limit=all`) |
| GET    | `/api/spots/map`                          | —    | All spots for map markers  |
| GET    | `/api/spots/:id`                          | —    | Get a single spot          |
| POST   | `/api/spots`                              | yes  | Create a spot              |
| PATCH  | `/api/spots/:id`                          | yes  | Edit a spot (owner only)   |
| DELETE | `/api/spots/:id`                          | yes  | Delete a spot (owner only) |
| GET    | `/api/spots/:id/comments`                 | —    | List comments for a spot   |
| POST   | `/api/spots/:id/comments`                 | yes  | Add a comment              |
| DELETE | `/api/spots/:spotId/comments/:commentId`  | yes  | Delete a comment           |
| POST   | `/api/spots/:id/likes`                    | yes  | Like a spot                |
| DELETE | `/api/spots/:id/likes`                    | yes  | Remove a like              |
| POST   | `/api/spots/:id/photos`                   | yes  | Upload a photo for a spot  |
| POST   | `/api/spots/:id/bookmarks`                | yes  | Bookmark a spot            |
| DELETE | `/api/spots/:id/bookmarks`                | yes  | Remove a bookmark          |
| GET    | `/api/users/me/spots`                     | yes  | List spots you posted      |
| GET    | `/api/users/me/likes`                     | yes  | List spots you liked       |
| GET    | `/api/users/me/bookmarks`                 | yes  | List your bookmarks        |

The OpenAPI 3.0 specification lives at [`openapi.json`](openapi.json) in the repository (regenerate with `npm run openapi`). The running app also serves it at:

- `/api/docs` — Swagger UI (interactive)
- `/api/openapi.json` — raw OpenAPI JSON

Live: https://nocturne-htdu.onrender.com/api/docs

## Project Structure

```
client/                 Static frontend (HTML/CSS/JS), served by Express
  index.html            Map view
  detail.html           Spot detail
  post-spot.html        Spot submission form
  my-spots.html         Manage your own spots (edit/delete)
  bookmarks.html        Saved spots
  about.html            About page
  login.html
  register.html
server/
  index.js              Server entry point (DB init + listen)
  app.js                Express app (middleware, routes)
  routes/               Route definitions
  controllers/          Request handlers
  models/               SQL data access
  middleware/auth.js    JWT verification
  utils/                Shared helpers (async error wrapper)
  db/                   Schema, connection, seed data
tests/                  Jest + Supertest API tests
```

The database is a single SQLite file. The schema is created on startup and covers users, spots, photos, comments, likes, and bookmarks, with foreign keys enabled.

## Local Setup

```bash
git clone https://github.com/ohkyounghun/nocturne.git
cd nocturne

npm install

cp .env.example .env   # then fill in the values below

npm run seed           # load initial spot data
npm run dev            # start with hot reload (or: npm start)
```

The app runs at `http://localhost:3000`.

### Environment Variables

```env
PORT=3000
JWT_SECRET=your_jwt_secret
KAKAO_API_KEY=your_kakao_api_key
```

### Tests

Install the dependencies before running the test suite:

```bash
npm install
npm test
```

To run the suites serially while investigating database or open-handle issues:

```bash
npm test -- --runInBand
```

The test suite covers controller behavior and Supertest API flows, including
login, unauthenticated comment requests, spot listing, and duplicate
like/bookmark conflicts. The current suite contains 4 suites and 17 tests.

GitHub Actions runs the same `npm test` command for every pull request targeting
`main` and every push to `main` using Node.js 20.

## Contributors

| Name          | Area                                          |
|---------------|-----------------------------------------------|
| Kyung Hun Oh  | Backend — auth, spots API, seed data          |
| Gun Woo Kim   | Backend — likes/comments/bookmarks, tests, CI |
| Do Hun Kwon   | Frontend — map, UI, responsive design         |

## Security

**Authentication & passwords**
- Passwords hashed with `bcrypt` (cost factor 12); plaintext is never stored or logged
- JWT Bearer tokens verified server-side on every protected route; the middleware also confirms the token's user still exists (stale-session guard returns `SESSION_EXPIRED`)
- Login returns the same `401` for unknown email and wrong password to prevent account enumeration

**Access control (broken-access-control mitigation)**
- Owner-only checks on spot edit/delete and photo upload (`spot.user_id === req.user.sub`) — blocks IDOR
- `express-rate-limit` on `/api/auth` (20 requests / 15 min per IP) to slow brute-force and credential stuffing

**XSS & headers**
- All user-generated content is rendered via `textContent`; values inserted into markup are HTML-escaped (never raw `innerHTML`)
- HTTP security headers applied via `helmet`
- Error responses follow a consistent `{ "code": "...", "message": "..." }` format to avoid leaking internals

## AI Use Disclosure

AI tools (Claude by Anthropic) were used throughout the project as a coding
assistant — for ideation, implementation, code review, debugging, and
documentation. **Every AI-assisted change was reviewed, tested, and is
understood by the team before merging.**

Areas where AI assistance was most significant:

- **Backend — data & auth:** schema design with foreign-key constraints,
  JWT/bcrypt authentication, the spots API, and security hardening
  (stored-XSS escaping, photo-upload IDOR fix, auth rate limiting)
- **Backend — interactions, tests & CI:** likes/bookmarks conflict handling,
  Jest/Supertest test suites, and the GitHub Actions pipeline
- **Frontend — map & UI:** Kakao Maps integration and reverse geocoding,
  the spot submission and My Spots pages, and responsive layout

A batch of commits during final deployment (the My Spots feature, security
fixes, and rate limiting) was implemented in a single AI-assisted session and
reviewed before merging to `main`.

## License

MIT
