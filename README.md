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

The frontend calls the backend through `VITE_API_BASE_URL`. If this value is omitted, requests are made relative to the current origin.

Create a local `.env` file when the backend runs on a separate host or port:

```env
VITE_API_BASE_URL=http://localhost:8000
```

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
