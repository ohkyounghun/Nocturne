# Nocturne

[![CI](https://github.com/ohkyounghun/Nocturne/actions/workflows/test.yml/badge.svg)](https://github.com/ohkyounghun/Nocturne/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A community platform for discovering and sharing night view spots in Seoul. Browse spots on an interactive map, submit your own, and save the ones you like.

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
| GET    | `/api/spots`                              | —    | List spots                 |
| GET    | `/api/spots/:id`                          | —    | Get a single spot          |
| POST   | `/api/spots`                              | yes  | Create a spot              |
| DELETE | `/api/spots/:id`                          | yes  | Delete a spot (owner only) |
| GET    | `/api/spots/:id/comments`                 | —    | List comments for a spot   |
| POST   | `/api/spots/:id/comments`                 | yes  | Add a comment              |
| DELETE | `/api/spots/:spotId/comments/:commentId`  | yes  | Delete a comment           |
| POST   | `/api/spots/:id/likes`                    | yes  | Like a spot                |
| DELETE | `/api/spots/:id/likes`                    | yes  | Remove a like              |
| POST   | `/api/spots/:id/photos`                   | yes  | Upload a photo for a spot  |
| POST   | `/api/spots/:id/bookmarks`                | yes  | Bookmark a spot            |
| DELETE | `/api/spots/:id/bookmarks`                | yes  | Remove a bookmark          |
| GET    | `/api/users/me/bookmarks`                 | yes  | List your bookmarks        |

Interactive API documentation is available at `/api/docs` (Swagger UI) while the server is running.

## Project Structure

```
client/                 Static frontend (HTML/CSS/JS), served by Express
  index.html            Map view
  detail.html           Spot detail
  post-spot.html        Spot submission form
  about.html            About page
  login.html
  register.html
  bookmarks.html
server/
  app.js                Express entry point
  routes/               Route definitions
  controllers/          Request handlers
  models/               SQL data access
  middleware/auth.js    JWT verification
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

```bash
npm test
```

## Contributors

| Name          | Area                                          |
|---------------|-----------------------------------------------|
| Kyung Hun Oh  | Backend — auth, spots API, seed data          |
| Gun Woo Kim   | Backend — likes/comments/bookmarks, tests, CI |
| Do Hun Kwon   | Frontend — map, UI, responsive design         |

## Security

**XSS mitigation:**
- All user-generated content is rendered via `textContent` (never `innerHTML`)
- HTTP security headers applied via `helmet`
- JWT stored in `localStorage` — known XSS risk, mitigated by input sanitization at the API boundary
- Error responses follow a consistent `{ "code": "...", "message": "..." }` format to avoid leaking internals

## AI Use Disclosure

This project was developed with assistance from AI tools (Claude by Anthropic) for ideation, code review, and documentation. All code has been reviewed and is understood by the team.

## License

MIT
