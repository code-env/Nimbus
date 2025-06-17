#!/bin/bash

set -e

echo "▶ Building CLI..."
bun run build

echo "▶ Linking CLI globally..."
sudo npm link

echo "▶ Logging into Nimbus..."
nimbus login
