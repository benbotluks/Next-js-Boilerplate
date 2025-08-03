# Project Structure & Organization

## Root Directory Layout
```
├── src/                    # Source code
├── public/                 # Static assets
├── tests/                  # Test files
├── migrations/             # Database migrations
├── .storybook/            # Storybook configuration
├── .github/               # GitHub workflows and actions
└── .kiro/                 # Kiro steering and specs
```

## Source Code Organization (`src/`)

### App Router Structure (`src/app/`)
```
src/app/
├── [locale]/              # Internationalized routes
│   ├── (auth)/           # Auth-protected routes
│   │   ├── dashboard/    # User dashboard
│   │   └── (center)/     # Centered auth pages (sign-in/up)
│   └── (marketing)/      # Public marketing pages
├── global-error.tsx      # Global error boundary
├── robots.ts            # SEO robots.txt
└── sitemap.ts           # SEO sitemap
```

### Component Architecture (`src/components/`)
- **Co-located tests**: `__tests__/` folders alongside components
- **Naming**: PascalCase for components, camelCase for utilities
- **Structure**: One component per file, export as default

### Library Organization (`src/libs/`)
- **Singletons**: Export configured instances (e.g., `audioEngine`)
- **Configuration**: Third-party service setup
- **Business Logic**: Core application logic

### Type Definitions (`src/types/`)
- **Domain-specific**: Separate files per domain (e.g., `MusicTypes.ts`)
- **Shared types**: Common interfaces and types

### Utilities (`src/utils/`)
- **Pure functions**: Stateless utility functions
- **Constants**: Application constants and configurations
- **Validation**: Zod schemas and validation logic

## Testing Structure

### Unit Tests
- **Location**: `src/**/__tests__/` or `src/**/*.test.ts`
- **Naming**: `ComponentName.test.tsx` or `utilityName.test.ts`
- **Browser tests**: Use `.test.tsx` for React components

### E2E Tests
- **Location**: `tests/e2e/`
- **Naming**: `FeatureName.e2e.ts`
- **Integration**: `tests/integration/` for API/database tests

## File Naming Conventions

### Components
- **Files**: `PascalCase.tsx` (e.g., `MusicTestController.tsx`)
- **Tests**: `PascalCase.test.tsx`
- **Stories**: `PascalCase.stories.tsx`

### Utilities & Libraries
- **Files**: `PascalCase.ts` (e.g., `AudioEngine.ts`)
- **Tests**: `PascalCase.test.ts`

### Types & Schemas
- **Types**: `DomainTypes.ts` (e.g., `MusicTypes.ts`)
- **Schemas**: `DomainValidation.ts` (e.g., `CounterValidation.ts`)

## Import Conventions
- **Absolute imports**: Use `@/` prefix for src imports
- **Type imports**: Use `import type` for type-only imports
- **Order**: External deps → internal libs → components → types

## Configuration Files
- **Environment**: `.env` for defaults, `.env.local` for local overrides
- **TypeScript**: Strict mode enabled with comprehensive checks
- **ESLint**: Antfu config with React, Next.js, and accessibility rules
- **Database**: `drizzle.config.ts` for ORM configuration
