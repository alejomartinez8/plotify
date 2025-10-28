# Plotify - Cash Management System

A Next.js application for community cash management with multi-fund architecture and PostgreSQL database.

## TODO Management Requirements

**CRITICAL**: Always check and update TODO.md when starting or completing tasks.

### Before Starting Any Task:

1. **Read TODO.md** to understand current priorities
2. **Mark task as in progress** by checking the current status
3. **Focus on Phase 1 items first** (Cash Management System foundation)

### When Completing a Task:

1. **Mark task as completed** with ✅ and add completion date
2. **Add any new tasks discovered** during implementation
3. **Update TODO.md** with next logical steps
4. **Prioritize new items** based on Cash Management System phases

### Current Priority Focus:

- **Phase 1**: Database schema, income classification, initial balances, basic dashboard
- **Phase 2**: Debt tracking, partial payments, multi-type receipts
- **Phase 3**: Google Drive integration, advanced features

**Always reference TODO.md before suggesting or starting work on any feature.**

## Project Structure

- **Frontend**: Next.js 15.3.5 with React 19.1.0, TypeScript, TailwindCSS
- **Backend**: Next.js Server Actions with PostgreSQL
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (auto-deploy from main branch)
- **UI**: Shadcn/ui components with Lucide icons

## Coding Standards

### Language Requirements

- **All code, comments, documentation, and commit messages must be in English**
- Variables, functions, classes, and files use English names
- Error messages and logs in English
- All .md files, inline docs, and code comments in English
- Git commit messages, branch names, and PR descriptions in English

### React/Next.js Guidelines

#### Server Components First

- **Default**: All components are Server Components unless explicitly marked with `'use client'`
- **Client Components Only When Necessary**:
  - Interactive features requiring browser APIs (onClick, onChange, useState, useEffect)
  - Browser-only APIs (localStorage, window, document)
  - State management or event handlers
  - Third-party libraries requiring client-side execution

#### Modern React Hooks (Client Components)

**useTransition** - For responsive UI during server operations:

```typescript
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  await serverAction();
});
```

**useOptimistic** - For instant UI feedback:

```typescript
const [optimisticData, updateOptimistic] = useOptimistic(
  serverData,
  (state, action) => applyOptimisticUpdate(state, action)
);
```

**useActionState** - For form handling with server actions:

```typescript
const [state, formAction] = useActionState(serverAction, initialState);
```

### Internationalization Standards

- **NEVER use hardcoded text**: All user-facing text must come from `src/lib/translations.ts`
- **Import translations**: Always import `{ translations }` from `src/lib/translations.ts`
- **Add missing translations**: If a text doesn't exist in translations.ts, add it there first
- **Use proper translation keys**: Follow the existing structure (e.g., `translations.labels.amount`)

```typescript
import { translations } from "@/lib/translations";

// ✅ Good - Using translations
const message = translations.messages.created;
const buttonText = translations.actions.save;

// ❌ Bad - Hardcoded text
const message = "Created successfully";
const buttonText = "Save";
```

### Server Actions Standards

```typescript
export async function createItemAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  // 1. Validate with Zod
  const validated = schema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: translations.errors.missingFields,
    };
  }

  try {
    // 2. Database operation
    await createItem(validated.data);

    // 3. Revalidate cache
    revalidatePath("/items");

    // 4. Success response
    return { message: translations.messages.created, errors: {} };
  } catch (error) {
    return { message: translations.errors.database, errors: {} };
  }
}
```

## Database

### Prisma Migrations

- Use descriptive names with timestamps
- Review migrations before execution
- Example: `20240101000000_create_users_table`

### Commands

- Run linting: `npm run lint`
- Database migrations: `npm run db:migrate`
- Generate Prisma client: `npm run db:generate`

## Security

- Never commit .env files or secrets
- All environment variables in .env.local for development
- Use proper validation on all server actions

## Development Workflow

- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- Server-first approach with progressive enhancement
- Modern React patterns with Server Actions for data mutations

## Memories

### Code Standards

- to memorize. Always use `@src/lib/translations.ts`

### Deployment Standards

- to memorize, when is a deploy to prod never reset the DB
