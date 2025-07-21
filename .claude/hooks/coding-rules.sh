#!/bin/bash

# Hook that reminds about coding standards before processing prompts
# Reads user prompt and adds context about project coding rules

input=$(cat)
prompt=$(echo "$input" | jq -r '.prompt // empty')

# Add context about coding standards for React/Next.js tasks
if [[ "$prompt" == *"component"* ]] || [[ "$prompt" == *"react"* ]] || [[ "$prompt" == *"hook"* ]]; then
    context="CODING RULES REMINDER:
- Prefer Server Components over Client Components
- Use 'use client' only for: interactive features, browser APIs, state management
- Use modern React 19 hooks: useTransition, useOptimistic, useActionState
- Combine hooks for complete CRUD operations
- All code and comments must be in English
- Server Actions: validate with Zod -> database operation -> revalidatePath -> return state

USER PROMPT: $prompt"
    
    echo "{\"context\": \"$context\"}"
else
    echo "{\"context\": \"Remember: All code, comments, and documentation must be in English\"}"
fi

exit 0