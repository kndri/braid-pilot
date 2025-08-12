const fs = require('fs');
const { execSync } = require('child_process');

// Read the PEM file content
const pemContent = fs.readFileSync('jwt_key.pem', 'utf8');

// Write to a temporary file
fs.writeFileSync('temp_jwt.txt', pemContent);

// Use the file to set the environment variable
try {
  // First delete the existing key
  execSync('npx convex env unset JWT_PRIVATE_KEY', { stdio: 'inherit' });
  console.log('Removed old JWT_PRIVATE_KEY');
  
  // Set the new key from file
  execSync('npx convex env set JWT_PRIVATE_KEY < temp_jwt.txt', { stdio: 'inherit', shell: true });
  console.log('JWT_PRIVATE_KEY has been successfully set');
  
  // Clean up
  fs.unlinkSync('temp_jwt.txt');
} catch (error) {
  console.error('Error:', error.message);
  // Clean up even on error
  if (fs.existsSync('temp_jwt.txt')) {
    fs.unlinkSync('temp_jwt.txt');
  }
}