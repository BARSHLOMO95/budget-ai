# Budget Pro 💰

A production-ready SaaS budget management application for Israeli users, supporting both personal/family and business workspaces.

## Features

### Core Features
- **Multi-Workspace Support**: Separate personal and business budgets within the same account
- **Spouse/Partner Sharing**: Share workspaces with family members
- **Hebrew RTL Interface**: Fully localized Hebrew interface with RTL support
- **Israeli Currency (ILS)**: Default currency with shekel formatting

### Transaction Management
- Add, edit, delete transactions (income/expense)
- Categorize by type (fixed/variable) and category
- Tags and notes for detailed tracking
- Duplicate transactions for quick entry
- Recurring transaction support

### Filtering & Search
- **Quick Filters**: Month/year selector, income/expense toggle, fixed/variable toggle, category filter
- **Advanced Filters**: Date range, amount range, text search (case-insensitive), tag filtering
- **Optimized Queries**: Only fetches current month data by default (date-range queries)

### Dashboard & Analytics
- Monthly summary cards (income, expenses, balance, savings rate)
- Expense breakdown (fixed vs variable)
- Category breakdown with budget tracking
- Recent transactions view

### User Management
- Firebase Authentication (Email/Password + Google)
- User profiles with subscription plans
- Workspace member roles (owner, admin, member, viewer)

### Subscription Plans (Stripe)
- **Free**: 1 workspace, 2 members
- **Pro**: 3 workspaces, 5 members, advanced reports, export
- **Pro+Business**: 10 workspaces, 10 members, business workspace type

## Architecture

### Project Structure

```
src/
├── components/          # UI Components (presentational)
│   ├── auth/           # Login, Signup pages
│   ├── dashboard/      # Summary cards, charts
│   ├── filters/        # Quick & advanced filters
│   ├── layout/         # App layout, navigation
│   ├── transactions/   # Transaction list, form
│   ├── ui/             # Base UI components
│   └── workspace/      # Workspace switcher
├── hooks/              # React hooks (data layer)
│   ├── useAuth.tsx     # Authentication state & actions
│   ├── useCategories.ts
│   ├── useTransactions.ts
│   └── useWorkspace.tsx
├── services/           # Firebase/API calls (data access)
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── transaction.service.ts
│   └── workspace.service.ts
├── lib/                # Business logic (domain layer)
│   ├── calculations.ts # Budget calculations, filtering
│   └── firebase.ts     # Firebase initialization
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── pages/              # Page components
```

### Layer Separation

1. **UI Layer** (`components/`): Pure presentational components, no business logic
2. **Hooks Layer** (`hooks/`): State management, data fetching, connects UI to services
3. **Domain Layer** (`lib/`): Business logic, calculations, filtering algorithms
4. **Data Layer** (`services/`): Firebase/Firestore operations, API calls

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Payments**: Stripe (annual subscriptions)
- **State**: React hooks + Zustand (optional)
- **Routing**: React Router v6

## Data Model

### Firestore Collections

```
users/{uid}
  - email, displayName, photoURL
  - plan: 'free' | 'pro' | 'pro_business'
  - defaultWorkspaceId
  - stripeCustomerId

workspaces/{workspaceId}
  - name, type: 'personal' | 'business'
  - ownerId, currency: 'ILS'
  - icon, color

workspaces/{workspaceId}/members/{uid}
  - role: 'owner' | 'admin' | 'member' | 'viewer'
  - email, displayName

workspaces/{workspaceId}/categories/{categoryId}
  - type: 'income' | 'expense'
  - group: 'fixed' | 'variable'
  - label, icon, color, order
  - targetMonthly (budget)

workspaces/{workspaceId}/transactions/{txId}
  - type: 'income' | 'expense'
  - amount, categoryId, description
  - date (indexed for range queries)
  - tags[], notes
  - isRecurring, recurringId
  - createdBy, createdAt
```

## Security Rules

The app uses Firestore security rules to ensure:
- Users can only access workspaces they're members of
- Role-based permissions (viewer can't edit, only admins can delete categories, etc.)
- Transaction validation (required fields, valid types)
- Owner protection (owner role cannot be removed)

See `firestore.rules` for complete rules.

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Auth enabled
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd budget-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Firebase and Stripe keys to .env

# Start development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Add composite indexes for date-range queries

### Required Firestore Indexes

```
Collection: workspaces/{workspaceId}/transactions
Fields: date (ASC), type (ASC)
Fields: date (ASC), categoryId (ASC)
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Deployment

The app can be deployed to:
- Vercel
- Firebase Hosting
- Netlify
- Any static hosting

```bash
npm run build
# Deploy the `dist` folder
```

## License

MIT
