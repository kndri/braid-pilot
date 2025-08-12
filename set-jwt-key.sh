#!/bin/bash

# Read the PEM file and escape it properly for JSON
JWT_KEY=$(cat jwt_key.pem | sed ':a;N;$!ba;s/\n/\\n/g')

# Set the JWT_PRIVATE_KEY in Convex
npx convex env set JWT_PRIVATE_KEY "$JWT_KEY"

echo "JWT_PRIVATE_KEY has been set in Convex environment"