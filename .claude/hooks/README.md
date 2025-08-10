# Braid Pilot Documentation Update Hooks

## Overview
This directory contains automated hooks that help maintain up-to-date documentation as the codebase evolves. The hooks analyze code changes and identify which documentation files need updating.

## How It Works

### Automatic Triggering
The hooks are automatically triggered:
- **After code changes**: When files are written, edited, or modified
- **After task completion**: When a development task is completed
- **After commits**: To ensure documentation stays synchronized

### Documentation Mapping
The system maps code changes to relevant documentation:

| Code Pattern | Documentation Files |
|-------------|-------------------|
| `app/api/*` | `api/endpoints.md`, `api/README.md` |
| `components/*` | `architecture/components.md` |
| `*convex*`, `prisma/*` | `architecture/database.md`, `convex_backend_guide.md` |
| `*config*`, `package.json` | `deployment/configuration.md` |
| `app/signup/*`, `app/login/*` | `features/authentication.md`, `user-guides/onboarding.md` |
| `*.test.*`, `*.spec.*` | `development/testing.md` |

## Hook Scripts

### check-docs.sh
The main shell script that:
- Analyzes file changes
- Identifies documentation that needs updating
- Logs all documentation recommendations
- Returns JSON output for Claude Code

### update-docs.py
A comprehensive Python script that:
- Provides detailed change analysis
- Generates documentation templates
- Creates specific update tasks
- Maintains update history

## Configuration

The hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [...],
    "Stop": [...]
  }
}
```

## Logs

Documentation update recommendations are logged to:
- `.claude/logs/doc-updates.log` - Human-readable log
- `.claude/logs/doc_updates.jsonl` - Structured JSON log

## Usage

### Manual Execution
You can manually run the documentation check:

```bash
# Check a specific file change
echo '{"toolName":"Edit","toolInput":{"file_path":"app/api/users.ts"}}' | \
  ./.claude/hooks/check-docs.sh

# Run the Python analyzer
echo '{"toolName":"Write","toolInput":{"file_path":"components/NewComponent.tsx"}}' | \
  python3 ./.claude/hooks/update-docs.py
```

### Viewing Recommendations
After hooks run, Claude Code will display documentation recommendations:

```json
{
  "type": "documentation_reminder",
  "message": "📚 Documentation may need updating",
  "files_to_review": "api/endpoints.md architecture/components.md",
  "recommendation": "Consider updating the documentation to reflect recent changes"
}
```

## Best Practices

1. **Review Recommendations**: Always review hook recommendations after completing tasks
2. **Update Promptly**: Update documentation while changes are fresh
3. **Use Templates**: The Python script provides templates for consistent documentation
4. **Check Logs**: Review `.claude/logs/` for documentation update history
5. **Test Hooks**: Verify hooks work correctly after configuration changes

## Extending the System

### Adding New Patterns
Edit the mapping in either script:
- Shell script: Add new patterns to `check_documentation_needs()`
- Python script: Update `self.doc_mappings` dictionary

### Custom Templates
Modify template methods in `update-docs.py`:
- `_get_api_template()`
- `_get_component_template()`
- `_get_feature_template()`
- `_get_architecture_template()`

## Troubleshooting

### Hooks Not Running
1. Verify scripts are executable: `chmod +x .claude/hooks/*.sh`
2. Check `.claude/settings.json` configuration
3. Ensure `CLAUDE_PROJECT_DIR` environment variable is set

### No Recommendations Appearing
1. Check log files in `.claude/logs/`
2. Manually test hooks with sample input
3. Verify file patterns match your changes

### Performance Issues
- Adjust timeout in settings.json (default: 3000ms)
- Simplify pattern matching for large codebases
- Consider using Python script for complex analysis

## Benefits

✅ **Consistent Documentation**: Ensures docs stay synchronized with code
✅ **Automated Reminders**: Never forget to update documentation
✅ **Change Tracking**: Maintains history of what needs updating
✅ **Task Integration**: Works seamlessly with development workflow
✅ **Customizable**: Easy to extend for project-specific needs

---

*These hooks help maintain the high-quality documentation that makes Braid Pilot a professional, maintainable codebase.*