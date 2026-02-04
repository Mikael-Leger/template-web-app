# Project Setup Instructions

## Quick Start

When starting a new conversation, use Chrome DevTools MCP to launch and interact with the project:

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:4000`

2. **Open in Chrome via MCP**:
   - Use `navigate_page` to open `http://localhost:4000`
   - Use `take_snapshot` to see the current page state
   - Use `take_screenshot` for visual verification

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + SASS
- **Animation**: GSAP
- **UI**: React 19, React Icons, Bootstrap Icons

## Available Scripts

- `npm run dev` - Start dev server on port 4000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `src/app/` - Next.js app directory
- `src/app/types/` - TypeScript type definitions
- `src/app/data/` - JSON data files
- `src/app/interfaces/` - Interface definitions
- `public/` - Static assets
