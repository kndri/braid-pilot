# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Braid Pilot is a salon management platform for hair braiding businesses built with Next.js 15.4.6, React 19, TypeScript, and Tailwind CSS v4. The application consists of three core components:
1. Landing page for user acquisition
2. Onboarding wizard for salon pricing configuration  
3. "Price My Style" tool for client quote generation

## Common Development Commands

```bash
npm run dev       # Start development server with Turbopack at http://localhost:3000
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run ESLint checks
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **UI**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4 with inline theme configuration
- **Backend** (planned): Convex.dev for real-time database and API
- **Fonts**: Geist Sans and Geist Mono

### Project Structure
- `/app/` - Next.js App Router pages and layouts
- `/docs/` - Comprehensive documentation organized by category
- `/tasks/` - Project management with detailed task specifications
- `/public/` - Static assets

### Key Architectural Decisions
- App Router for file-based routing and server/client component separation
- TypeScript with strict mode for type safety
- Tailwind CSS v4 for consistent, utility-first styling
- Path aliasing configured with `@/*` for clean imports
- Turbopack enabled for fast development builds

## Task Management

The project uses a detailed task management system in `/tasks/` with:
- 3 major epics covering all development phases
- 15 tasks with acceptance criteria and technical specifications
- Gherkin scenarios for behavior-driven development
- See `/tasks/TODO.md` for current status and `/tasks/README.md` for task organization

## Development Guidelines

### TypeScript
- Strict mode enabled
- Use type inference where possible
- Define explicit interfaces for component props and API responses

### Styling
- Use Tailwind CSS utilities
- Follow mobile-first responsive design
- Dark mode support via CSS custom properties
- Maintain consistent spacing and typography using Tailwind's design system

### Component Development
- Create modular, reusable components
- Separate server and client components appropriately
- Use Next.js built-in optimizations (Image, Link, etc.)

## Backend Integration (Planned)

Convex.dev will be used for:
- Real-time database operations
- Authentication and user management
- API endpoint generation
- See `/docs/convex_backend_guide.md` for implementation details