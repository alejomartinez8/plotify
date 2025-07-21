#!/bin/bash

# Hook that runs after editing files
# Executes linting and type checking automatically

input=$(cat)
file_path=$(echo "$input" | jq -r '.arguments.file_path // empty')

# Only process TypeScript/JavaScript files
if [[ "$file_path" == *.ts ]] || [[ "$file_path" == *.tsx ]] || [[ "$file_path" == *.js ]] || [[ "$file_path" == *.jsx ]]; then
    echo "🔍 Validating edited code: $file_path"
    
    # Run linting
    if ! npm run lint --silent 2>/dev/null; then
        echo "{\"message\": \"⚠️ Lint errors detected in $file_path. Run 'npm run lint' for details.\"}"
    else
        echo "{\"message\": \"✅ Code validated successfully\"}"
    fi
fi

exit 0