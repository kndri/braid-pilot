#!/usr/bin/env python3
"""
Documentation Update Hook for Braid Pilot
Automatically analyzes code changes and updates relevant documentation
"""

import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class DocumentationUpdater:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.docs_dir = self.project_root / "docs"
        self.changes_detected = []
        self.docs_to_update = set()
        
        # Mapping of file patterns to documentation files
        self.doc_mappings = {
            # API Documentation
            r"app/api/.*": ["api/README.md", "api/endpoints.md"],
            r"lib/api/.*": ["api/README.md", "api/endpoints.md"],
            
            # Architecture Documentation
            r"app/.*\.tsx?$": ["architecture/frontend.md", "architecture/components.md"],
            r"components/.*\.tsx?$": ["architecture/components.md"],
            r"lib/.*\.ts$": ["architecture/backend.md", "architecture/services.md"],
            r"hooks/.*": ["architecture/integrations.md"],
            
            # Database/Backend Documentation
            r".*convex.*": ["convex_backend_guide.md", "architecture/database.md"],
            r"prisma/.*": ["architecture/database.md"],
            r".*\.sql$": ["architecture/database.md"],
            
            # Configuration Documentation
            r".*config.*": ["deployment/configuration.md"],
            r"package\.json": ["development/setup.md", "deployment/dependencies.md"],
            r".*\.env.*": ["deployment/environment-variables.md"],
            
            # Testing Documentation
            r".*\.test\.(ts|tsx|js|jsx)$": ["development/testing.md"],
            r".*\.spec\.(ts|tsx|js|jsx)$": ["development/testing.md"],
            
            # Component Documentation
            r"components/Header\.tsx": ["components/navigation.md"],
            r"components/.*CTA.*": ["components/conversion.md"],
            r"components/.*Form.*": ["components/forms.md"],
            
            # Feature-specific Documentation
            r"app/signup/.*": ["features/authentication.md", "user-guides/onboarding.md"],
            r"app/pricing/.*": ["features/pricing.md", "user-guides/pricing-setup.md"],
            r"app/booking/.*": ["features/booking.md", "user-guides/booking-system.md"],
        }
        
        # Documentation templates for new sections
        self.doc_templates = {
            "api": self._get_api_template(),
            "component": self._get_component_template(),
            "feature": self._get_feature_template(),
            "architecture": self._get_architecture_template()
        }
    
    def process_hook_input(self) -> Dict:
        """Process the hook input from stdin"""
        try:
            hook_data = json.load(sys.stdin)
            return hook_data
        except json.JSONDecodeError:
            return {}
    
    def analyze_changes(self, hook_data: Dict) -> List[str]:
        """Analyze the changes from the hook data"""
        tool_name = hook_data.get("toolName", "")
        tool_input = hook_data.get("toolInput", {})
        
        changes = []
        
        # Handle different tool types
        if tool_name in ["Write", "Edit", "MultiEdit"]:
            file_path = tool_input.get("file_path", "")
            if file_path:
                changes.append(file_path)
                self._check_documentation_needs(file_path, tool_input)
        
        elif tool_name == "NotebookEdit":
            notebook_path = tool_input.get("notebook_path", "")
            if notebook_path:
                changes.append(notebook_path)
        
        elif tool_name == "TodoWrite":
            # Check if task completion requires doc updates
            todos = tool_input.get("todos", [])
            for todo in todos:
                if todo.get("status") == "completed":
                    self._check_task_documentation(todo.get("content", ""))
        
        return changes
    
    def _check_documentation_needs(self, file_path: str, tool_input: Dict):
        """Check if a file change requires documentation updates"""
        # Convert absolute path to relative
        try:
            rel_path = Path(file_path).relative_to(self.project_root)
            rel_path_str = str(rel_path)
        except ValueError:
            rel_path_str = file_path
        
        # Check against patterns
        for pattern, doc_files in self.doc_mappings.items():
            if re.match(pattern, rel_path_str):
                self.docs_to_update.update(doc_files)
        
        # Check for specific content changes that need documentation
        if "new_string" in tool_input:
            content = tool_input["new_string"]
            self._analyze_content_for_docs(content, rel_path_str)
    
    def _analyze_content_for_docs(self, content: str, file_path: str):
        """Analyze content for documentation-worthy changes"""
        # Check for new API endpoints
        if re.search(r"(app|pages)/api/", file_path):
            if re.search(r"export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)", content):
                self.docs_to_update.add("api/endpoints.md")
                self.changes_detected.append(f"New API endpoint in {file_path}")
        
        # Check for new components
        if re.search(r"export\s+(default\s+)?function\s+\w+", content) and "components/" in file_path:
            self.docs_to_update.add("architecture/components.md")
            component_name = re.search(r"export\s+(?:default\s+)?function\s+(\w+)", content)
            if component_name:
                self.changes_detected.append(f"New component: {component_name.group(1)}")
        
        # Check for database schema changes
        if re.search(r"(CREATE|ALTER)\s+TABLE", content, re.IGNORECASE):
            self.docs_to_update.add("architecture/database.md")
            self.changes_detected.append("Database schema change detected")
        
        # Check for new configuration
        if re.search(r"process\.env\.\w+", content):
            self.docs_to_update.add("deployment/environment-variables.md")
            env_vars = re.findall(r"process\.env\.(\w+)", content)
            for var in env_vars:
                self.changes_detected.append(f"New environment variable: {var}")
    
    def _check_task_documentation(self, task_content: str):
        """Check if completed task requires documentation updates"""
        task_lower = task_content.lower()
        
        # Keywords that suggest documentation needs
        doc_keywords = {
            "api": ["api/README.md", "api/endpoints.md"],
            "endpoint": ["api/endpoints.md"],
            "component": ["architecture/components.md"],
            "database": ["architecture/database.md"],
            "schema": ["architecture/database.md"],
            "authentication": ["features/authentication.md"],
            "auth": ["features/authentication.md"],
            "pricing": ["features/pricing.md"],
            "booking": ["features/booking.md"],
            "payment": ["features/payments.md"],
            "integration": ["architecture/integrations.md"],
            "deploy": ["deployment/README.md"],
            "config": ["deployment/configuration.md"],
            "test": ["development/testing.md"]
        }
        
        for keyword, docs in doc_keywords.items():
            if keyword in task_lower:
                self.docs_to_update.update(docs)
                self.changes_detected.append(f"Task completed: {task_content}")
    
    def _get_api_template(self) -> str:
        return """# API Endpoint: {endpoint_name}

## Overview
{description}

## Request
- **Method**: {method}
- **Path**: `/api/{path}`
- **Authentication**: Required/Optional

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

### Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| {param} | {type} | {required} | {description} |

## Response
### Success (200 OK)
```json
{response_example}
```

### Error Responses
- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Missing or invalid authentication
- **500 Internal Server Error**: Server error

## Examples
### cURL
```bash
curl -X {method} \\
  https://api.braidpilot.com/{path} \\
  -H "Authorization: Bearer {token}" \\
  -d '{request_body}'
```

---
*Last Updated: {date}*
"""
    
    def _get_component_template(self) -> str:
        return """## Component: {component_name}

### Purpose
{description}

### Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| {prop} | {type} | {required} | {default} | {description} |

### Usage
```tsx
import {component_name} from '@/components/{component_name}'

<{component_name}
  {props}
/>
```

### Events
- `{event}`: {event_description}

### Styling
- Uses Tailwind CSS classes
- Responsive breakpoints: {breakpoints}
- Theme variables: {theme_vars}

---
*Last Updated: {date}*
"""
    
    def _get_feature_template(self) -> str:
        return """# Feature: {feature_name}

## Overview
{description}

## User Flow
1. {step1}
2. {step2}
3. {step3}

## Technical Implementation
### Frontend Components
- {component1}
- {component2}

### Backend Services
- {service1}
- {service2}

### Database Tables
- {table1}
- {table2}

## Configuration
```env
{env_vars}
```

## Testing
- Unit tests: `{test_file}`
- Integration tests: `{integration_test}`

---
*Last Updated: {date}*
"""
    
    def _get_architecture_template(self) -> str:
        return """# Architecture: {section_name}

## Overview
{description}

## Components
### {component_category}
- **{component}**: {component_description}

## Data Flow
```mermaid
graph LR
    A[{source}] --> B[{processor}]
    B --> C[{destination}]
```

## Dependencies
- {dependency1}: {version}
- {dependency2}: {version}

## Considerations
- **Performance**: {performance_notes}
- **Scalability**: {scalability_notes}
- **Security**: {security_notes}

---
*Last Updated: {date}*
"""
    
    def generate_update_summary(self) -> Dict:
        """Generate a summary of documentation updates needed"""
        summary = {
            "needs_update": len(self.docs_to_update) > 0,
            "docs_to_update": list(self.docs_to_update),
            "changes_detected": self.changes_detected,
            "timestamp": datetime.now().isoformat(),
            "recommendations": []
        }
        
        # Add specific recommendations
        if "api/endpoints.md" in self.docs_to_update:
            summary["recommendations"].append(
                "Update API documentation with new endpoints and their specifications"
            )
        
        if "architecture/components.md" in self.docs_to_update:
            summary["recommendations"].append(
                "Document new React components and their props/usage"
            )
        
        if "architecture/database.md" in self.docs_to_update:
            summary["recommendations"].append(
                "Update database schema documentation and ER diagrams"
            )
        
        if "deployment/environment-variables.md" in self.docs_to_update:
            summary["recommendations"].append(
                "Document new environment variables and their purposes"
            )
        
        return summary
    
    def create_documentation_tasks(self) -> List[str]:
        """Create specific documentation tasks based on changes"""
        tasks = []
        
        for doc_file in self.docs_to_update:
            doc_path = self.docs_dir / doc_file
            
            # Check if documentation file exists
            if not doc_path.exists():
                tasks.append(f"CREATE: {doc_file} - New documentation file needed")
            else:
                tasks.append(f"UPDATE: {doc_file} - Review and update with recent changes")
        
        return tasks
    
    def write_update_log(self, summary: Dict):
        """Write update log for tracking"""
        log_dir = self.project_root / ".claude" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / "doc_updates.jsonl"
        with open(log_file, "a") as f:
            json.dump(summary, f)
            f.write("\n")
    
    def run(self) -> int:
        """Main execution method"""
        # Process hook input
        hook_data = self.process_hook_input()
        
        if not hook_data:
            return 0
        
        # Analyze changes
        changes = self.analyze_changes(hook_data)
        
        # Generate summary
        summary = self.generate_update_summary()
        
        # Create documentation tasks
        if summary["needs_update"]:
            tasks = self.create_documentation_tasks()
            summary["tasks"] = tasks
            
            # Write log
            self.write_update_log(summary)
            
            # Output for Claude
            output = {
                "type": "documentation_update",
                "message": f"📚 Documentation updates recommended for {len(self.docs_to_update)} files",
                "docs_to_update": list(self.docs_to_update),
                "tasks": tasks,
                "changes": self.changes_detected
            }
            
            print(json.dumps(output, indent=2))
            
            # Return non-zero to indicate documentation needs attention
            # (but not block the operation)
            return 0
        
        return 0


def main():
    # Get project directory from environment or use current directory
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    
    updater = DocumentationUpdater(project_dir)
    return updater.run()


if __name__ == "__main__":
    sys.exit(main())