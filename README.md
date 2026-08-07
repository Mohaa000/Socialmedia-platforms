# CampusLink — Social Media Platform (SWE4040A Project 3)

A social media platform built with React (frontend) and Node.js/Express + SQLite (backend).

## Features (covers the core user stories)
1. Register an account
2. Log in / log out
3. Create a post
4. View the campus feed (all posts, newest first)
5. Like / unlike a post
6. Comment on a post
7. View a user's profile (bio, posts, follower/following counts)
8. Follow / unfollow another user

## Local development
Terminal 1:
```
cd backend
npm install
npm start
```
Terminal 2:
```
cd frontend
npm install
npm run dev
```
Frontend dev server runs on http://localhost:5173 and proxies /api calls to the backend on :3001.

## Production build (single deployable service)
The backend serves the built frontend as static files, so you only deploy ONE service.
```
cd frontend && npm install && npm run build
cd ../backend && npm install && npm start
```
Visit http://localhost:3001 — the whole app (API + UI) is served from one place.
