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
pnpm dev             # Start development server with Turbopack
pnpm build           # Production build
pnpm start           # Start production server
```

### Testing
```bash
pnpm test            # Run unit tests
pnpm test:e2e        # Run E2E tests
pnpm storybook       # Start Storybook
```

### Database
```bash
pnpm db:generate     # Generate migrations
pnpm db:studio       # Open Drizzle Studio
```

### Code Quality
```bash
pnpm lint            # Check linting
pnpm lint:fix        # Fix linting issues
pnpm check:types     # Type checking
pnpm check:deps      # Check unused dependencies
pnpm check:i18n      # Validate translations
```

## Build System
- **Vite** for fast builds and HMR
- **Turbopack** for Next.js development
- **Bundle analyzer** available via `pnpm build-stats`
- **pnpm** as the package manager for fast, efficient dependency management