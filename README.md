# 🌃 Nocturne

> Discover Seoul after dark

[![CI](https://github.com/ohkyounghun/nocturne/actions/workflows/ci.yml/badge.svg)](https://github.com/ohkyounghun/nocturne/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Nocturne is a community platform for discovering and sharing night view spots in Seoul. Explore spots on an interactive map, submit your own hidden gems, and connect with others who love the city after dark.

---

## 🔗 Live Demo

*Coming soon — will be deployed to Render*

<!-- TODO: Update with actual URL after deployment -->

---

## ✨ Features

- 🗺️ Explore Seoul night view spots on an interactive map
- 📍 Submit your own spot (location, photo, description)
- 🏷️ Filter by season (봄/여름/가을/겨울) and weather (맑음/흐림/비/눈)
- ❤️ Like and bookmark your favorite spots
- 💬 Comment on spots
- 🔐 User authentication (register / login)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | SQLite |
| Frontend | Vanilla JavaScript |
| Map | Kakao Maps API |
| Auth | JWT + bcrypt |
| API Docs | Swagger UI |
| CI | GitHub Actions |
| Deployment | Render |

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Kyung Hun Oh** | Backend — Auth, Spots API, Initial spots seed data |
| **Gun Woo Kim** | Backend — Likes/Comments/Bookmarks, Testing, CI |
| **Do hun kwon** | Frontend — Map, UI, Responsive design |

---

## 🧑‍💻 Local Setup (for developers)

```bash
# 1. Clone
git clone https://github.com/ohkyounghun/nocturne.git
cd nocturne

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your API keys in .env

# 4. Seed database
npm run seed

# 5. Run
npm run dev
```

### Environment Variables

```env
PORT=3000
JWT_SECRET=your_jwt_secret
KAKAO_API_KEY=your_kakao_api_key
```

### Run Tests

```bash
npm test
```

---

## 📝 AI Use Disclosure

This project was developed with assistance from AI tools (Claude by Anthropic) for ideation, code review, and documentation. All code has been reviewed, understood, and is explainable by each team member.

---

## 📄 License

MIT