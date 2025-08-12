const fs = require('fs');
const { execSync } = require('child_process');

// Read the PEM file
const pemContent = fs.readFileSync('jwt_key.pem', 'utf8');

// Escape the content for shell command
const escapedContent = pemContent.replace(/\n/g, '\\n').replace(/"/g, '\\"');

// Set the environment variable in Convex
try {
  execSync(`npx convex env set JWT_PRIVATE_KEY "${escapedContent}"`, { stdio: 'inherit' });
  console.log('JWT_PRIVATE_KEY has been successfully set in Convex environment');
} catch (error) {
  console.error('Error setting JWT_PRIVATE_KEY:', error.message);
}