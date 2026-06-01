# X Dataset Studio Frontend

React + Vite frontend for building Twitter/X scrape queries, managing cookie authentication, tracking scrape jobs, and downloading generated CSV datasets.

## Features

- Cookie auth account management for the backend scraper
- Structured and raw Twitter/X query input
- Query preview before starting a scrape job
- Live scrape job polling
- CSV download link when a job completes

## Tech Stack

- React
- Vite
- Tailwind CSS
- lucide-react icons

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Environment

In production on Vercel, the frontend calls same-origin `/api/...` routes. A Vercel serverless proxy forwards those requests to the backend and attaches the API key server-side.

Create a local `.env` file for the proxy:

```env
BACKEND_API_BASE_URL=https://implicit-maryl-greenify-2a8c3f29.koyeb.app
BACKEND_API_KEY=test-api-key
```

For Vercel, add the same values in the project settings under **Environment Variables**, then redeploy.

Do not set `VITE_API_BASE_URL` on Vercel unless you intentionally want the browser to call the backend directly. Leaving it empty makes the app use the Vercel proxy and avoids browser CORS preflight failures.

## Expected Backend Routes

The UI expects these API routes to be available:

- `GET /api/health`
- `GET /api/auth/status`
- `POST /api/auth/add-cookie`
- `POST /api/auth/verify`
- `DELETE /api/auth/accounts/:username`
- `POST /api/scrape/preview-query`
- `POST /api/scrape/start`
- `GET /api/scrape/jobs/:jobId`
- `GET /api/scrape/jobs/:jobId/download`

## Project Structure

```text
src/
  App.jsx      Main application UI
  api.js       Backend API client
  main.jsx     React entry point
  styles.css   Global and Tailwind styles
```
