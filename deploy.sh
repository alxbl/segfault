#!/bin/bash
# Deployment script for segfault.me static blog
# Called by github on PushEvent WebHook.

git pull                     # Get latest master
git submodule update  --init # Update submodules
npm run generate             # Generate content
