#!/bin/bash

# Hook to validate commands before execution
# Reads command from stdin in JSON format

input=$(cat)
command=$(echo "$input" | jq -r '.arguments.command // empty')

# Forbidden commands
FORBIDDEN_COMMANDS=("rm -rf" "sudo rm" "format" "fdisk" "mkfs")

for forbidden in "${FORBIDDEN_COMMANDS[@]}"; do
    if [[ "$command" == *"$forbidden"* ]]; then
        echo "{\"block\": true, \"reason\": \"Forbidden command: $forbidden\"}"
        exit 2
    fi
done

# Validate that destructive database commands are not executed
if [[ "$command" == *"DROP TABLE"* ]] || [[ "$command" == *"DELETE FROM"* ]] && [[ "$command" != *"WHERE"* ]]; then
    echo "{\"block\": true, \"reason\": \"Destructive SQL command detected\"}"
    exit 2
fi

# Allow command
echo "{\"block\": false}"
exit 0