# Technology Stack

## Core Framework & Runtime
- **Next.js 15+** with App Router
- **React 19** with TypeScript
- **Node.js 20+** required
- **Tailwind CSS 4** for styling

## Key Libraries & Tools
- **Clerk** - Authentication and user management
- **DrizzleORM** - Type-safe database ORM (PostgreSQL/SQLite/MySQL)
- **PGlite** - Local development database
- **next-intl** - Internationalization (i18n)
- **React Hook Form + Zod** - Form handling and validation
- **Web Audio API** - Audio synthesis for music features

## Development & Testing
- **Vitest** - Unit testing with browser mode
- **Playwright** - E2E testing
- **Storybook** - Component development
- **ESLint + Antfu config** - Linting
- **TypeScript strict mode** - Type safety

## Monitoring & Analytics
- **Sentry** - Error monitoring
- **PostHog** - Analytics
- **Arcjet** - Security and bot protection
- **LogTape** - Logging

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run storybook    # Start Storybook
```

### Database
```bash
npm run db:generate  # Generate migrations
npm run db:studio    # Open Drizzle Studio
```

### Code Quality
```bash
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
npm run check:types  # Type checking
npm run check:deps   # Check unused dependencies
npm run check:i18n   # Validate translations
```

## Build System
- **Vite** for fast builds and HMR
- **Turbopack** for Next.js development
- **Bundle analyzer** available via `npm run build-stats`