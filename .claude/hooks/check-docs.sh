#!/bin/bash

# Documentation Update Check Hook
# This script runs after code changes to determine if documentation needs updating

# Set project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DOCS_DIR="$PROJECT_DIR/docs"
LOG_FILE="$PROJECT_DIR/.claude/logs/doc-updates.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract tool name and file path from the input
TOOL_NAME=$(echo "$HOOK_INPUT" | grep -o '"toolName":"[^"]*"' | cut -d'"' -f4)
FILE_PATH=$(echo "$HOOK_INPUT" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4)

# Log the hook execution
log_message "Hook executed for tool: $TOOL_NAME, file: $FILE_PATH"

# Initialize documentation update flag
DOCS_NEED_UPDATE=false
DOCS_TO_UPDATE=""

# Function to check if file changes require doc updates
check_documentation_needs() {
    local file_path="$1"
    local relative_path="${file_path#$PROJECT_DIR/}"
    
    # Check for API changes
    if [[ "$relative_path" =~ app/api/.* ]] || [[ "$relative_path" =~ pages/api/.* ]]; then
        DOCS_NEED_UPDATE=true
        DOCS_TO_UPDATE="$DOCS_TO_UPDATE api/endpoints.md"
        log_message "API change detected in $relative_path"
    fi
    
    # Check for component changes
    if [[ "$relative_path" =~ components/.* ]]; then
        DOCS_NEED_UPDATE=true
        DOCS_TO_UPDATE="$DOCS_TO_UPDATE architecture/components.md"
        log_message "Component change detected in $relative_path"
    fi
    
    # Check for database/backend changes
    if [[ "$relative_path" =~ .*convex.* ]] || [[ "$relative_path" =~ prisma/.* ]]; then
        DOCS_NEED_UPDATE=true
        DOCS_TO_UPDATE="$DOCS_TO_UPDATE architecture/database.md convex_backend_guide.md"
        log_message "Database/backend change detected in $relative_path"
    fi
    
    # Check for configuration changes
    if [[ "$relative_path" =~ .*config.* ]] || [[ "$relative_path" == "package.json" ]]; then
        DOCS_NEED_UPDATE=true
        DOCS_TO_UPDATE="$DOCS_TO_UPDATE deployment/configuration.md"
        log_message "Configuration change detected in $relative_path"
    fi
    
    # Check for authentication changes
    if [[ "$relative_path" =~ app/signup/.* ]] || [[ "$relative_path" =~ app/login/.* ]]; then
        DOCS_NEED_UPDATE=true
        DOCS_TO_UPDATE="$DOCS_TO_UPDATE features/authentication.md user-guides/onboarding.md"
        log_message "Authentication change detected in $relative_path"
    fi
}

# Process based on tool type
case "$TOOL_NAME" in
    "Write"|"Edit"|"MultiEdit"|"NotebookEdit")
        if [ -n "$FILE_PATH" ]; then
            check_documentation_needs "$FILE_PATH"
        fi
        ;;
    "TodoWrite")
        # Check for completed tasks that might need documentation
        if echo "$HOOK_INPUT" | grep -q '"status":"completed"'; then
            TASK_CONTENT=$(echo "$HOOK_INPUT" | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
            log_message "Task completed: $TASK_CONTENT"
            
            # Check for keywords that suggest documentation needs
            if echo "$TASK_CONTENT" | grep -iE "(api|endpoint|component|database|auth|pricing|booking)" > /dev/null; then
                DOCS_NEED_UPDATE=true
                DOCS_TO_UPDATE="$DOCS_TO_UPDATE README.md"
            fi
        fi
        ;;
esac

# Output result for Claude
if [ "$DOCS_NEED_UPDATE" = true ]; then
    # Remove duplicates from docs list
    UNIQUE_DOCS=$(echo "$DOCS_TO_UPDATE" | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    # Create JSON output
    cat <<EOF
{
  "type": "documentation_reminder",
  "message": "📚 Documentation may need updating",
  "files_to_review": "$UNIQUE_DOCS",
  "recommendation": "Consider updating the documentation to reflect recent changes",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    log_message "Documentation update recommended for: $UNIQUE_DOCS"
fi

# Always exit successfully to not block the operation
exit 0