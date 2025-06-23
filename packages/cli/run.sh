#!/bin/bash

set -e

echo "▶ Building CLI..."
bun run build

echo "▶ Linking CLI globally..."
sudo npm link

echo "✅ CLI setup complete. You can now use the 'nimbus' command."
echo "Please run 'nimbus login' to authenticate with your account."
