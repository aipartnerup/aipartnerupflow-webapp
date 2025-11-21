# AIPartnerUpFlow WebApp

A modern web application for managing and executing tasks with aipartnerupflow, built with Next.js and Mantine.

## Features

- 🎨 **Modern UI**: Built with Mantine UI components
- 🌍 **Internationalization**: Support for multiple languages (English, Chinese)
- 📊 **Dashboard**: Real-time task statistics and monitoring
- 📋 **Task Management**: Create, view, update, and delete tasks
- 🌳 **Task Tree View**: Visualize task dependencies and hierarchy
- ⚡ **Real-time Updates**: Auto-refresh for running tasks
- 🔐 **Authentication**: JWT token support
- 🎯 **Type-safe**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: Mantine 8
- **Data Fetching**: TanStack Query (React Query)
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Icons**: Tabler Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- AIPartnerUpFlow API server running (default: http://localhost:8000)

### Installation

1. Clone the repository and navigate to the project:

```bash
cd aipartnerupflow-webapp
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file (optional):

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
aipartnerupflow-webapp/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard
│   ├── tasks/              # Task management pages
│   │   ├── page.tsx        # Task list
│   │   ├── create/         # Create task
│   │   ├── running/        # Running tasks
│   │   └── [id]/           # Task detail
│   └── settings/           # Settings page
├── components/             # React components
│   ├── layout/             # Layout components
│   │   ├── AppShell.tsx    # Main layout wrapper
│   │   ├── Navbar.tsx      # Sidebar navigation
│   │   └── Header.tsx      # Top header
│   └── tasks/              # Task-related components
│       └── TaskTreeView.tsx # Task tree visualization
├── lib/                    # Utilities and configurations
│   ├── api/                # API client
│   │   └── aipartnerupflow.ts
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   │   ├── config.ts
│   │   ├── provider.tsx
│   │   └── locales/       # Translation files
│   └── providers/         # React context providers
│       └── QueryProvider.tsx
└── public/                # Static assets
```

## Features Overview

### Dashboard

- View running tasks count
- Monitor task statistics
- Quick access to recent tasks

### Task Management

- **Task List**: Browse all tasks with search and filtering
- **Create Task**: Form to create new tasks with executor configuration
- **Task Detail**: View detailed task information, tree structure, inputs, and results
- **Running Tasks**: Monitor currently executing tasks with real-time progress

### Settings

- Configure API base URL
- Set authentication token (JWT)

## API Integration

The application uses JSON-RPC 2.0 protocol to communicate with the aipartnerupflow API server. All API methods are available through the `apiClient` instance:

```typescript
import { apiClient } from '@/lib/api/aipartnerupflow';

// Create tasks
await apiClient.createTasks([...]);

// Get task
await apiClient.getTask(taskId);

// Get task tree
await apiClient.getTaskTree(taskId);

// Cancel tasks
await apiClient.cancelTasks([taskId1, taskId2]);
```

## Internationalization

The application supports multiple languages. Currently available:

- English (en)
- Chinese (zh)

To add a new language:

1. Create a new JSON file in `lib/i18n/locales/`
2. Add the translation keys
3. Import and add to `lib/i18n/config.ts`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Mantine components for UI consistency

## Customization

### Adding New Pages

1. Create a new file in `app/` directory
2. Use the `AppShell` layout (already included in root layout)
3. Add navigation item in `components/layout/Navbar.tsx`

### Extending API Client

Edit `lib/api/aipartnerupflow.ts` to add new API methods.

### Customizing Theme

Mantine theme can be customized in `app/layout.tsx`:

```typescript
<MantineProvider theme={{ /* your theme config */ }}>
```

## Contributing

This is an open-source project. Contributions are welcome!

## License

Apache-2.0
