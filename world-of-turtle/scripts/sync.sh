#!/usr/bin/env bash
rsync -r -a -v -L --exclude ".git .idea" --delete src/ ../gamelib/app_template/App.app/Contents/Resources/app.nw