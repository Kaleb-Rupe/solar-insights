

#Architected Project Structure

src/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── trader/                # Trader-specific endpoints
│   │   │   └── [address]/
│   │   │       ├── route.ts       # Main trader API endpoint
│   │   │       └── trades/
│   │   │           └── route.ts   # Trades-specific endpoint
│   │   └── exchanges/             # Exchange-specific endpoints
│   │       ├── flash/
│   │       │   └── route.ts
│   │       └── jupiter/
│   │           └── route.ts
│   ├── [address]/                 # Address-specific pages
│   │   ├── page.tsx               # Main dashboard page
│   │   ├── layout.tsx             # Layout wrapper
│   │   └── providers/             # Client components for data providers
│   │       └── TraderDataProvider.tsx
│   └── page.tsx                   # Landing page with wallet input
├── core/                          # Core domain logic
│   ├── schemas/                   # Zod schemas for validation
│   │   ├── exchange.schema.ts     # Exchange-specific schemas
│   │   ├── trade.schema.ts        # Trade schemas
│   │   └── trader.schema.ts       # Trader schemas
│   ├── domain/                    # Domain models (type-safe, not persistence-focused)
│   │   ├── trades.ts              # Trade domain models with discriminated unions
│   │   ├── trader.ts              # Trader model
│   │   └── markets.ts             # Market data models
│   └── errors.ts                  # Domain-specific error classes
├── lib/                           # Utility functions and hooks
│   ├── api/                       # API client utilities
│   │   ├── flash.ts               # Flash API client
│   │   └── jupiter.ts             # Jupiter API client
│   ├── adapters/                  # Exchange adapters
│   │   ├── adapter.interface.ts   # Common adapter interface
│   │   ├── flash.adapter.ts       # Flash implementation
│   │   └── jupiter.adapter.ts     # Jupiter implementation
│   ├── repositories/              # Data access repositories
│   │   ├── trade.repository.ts    # Trade data repository
│   │   └── trader.repository.ts   # Trader data repository
│   ├── services/                  # Domain services
│   │   ├── analytics.service.ts   # Analytics calculations
│   │   └── normalization.service.ts # Data normalization
│   ├── hooks/                     # React hooks using React Query
│   │   ├── useTrades.ts           # Hook for fetching trades
│   │   └── useTrader.ts           # Hook for trader data
│   ├── utils/                     # Utility functions
│   │   ├── validation.ts          # Address validation
│   │   └── formatting.ts          # Data formatting utilities
│   └── storage/                   # Client-side storage utilities
│       └── preferences.ts         # User preferences storage
└── middleware.ts                  # Next.js middleware for rate limiting and validation