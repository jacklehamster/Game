#!/usr/bin/env bash
rsync -r -a -v -e "ssh -l draman" --exclude ".git" --delete src/ bin/App.app/Contents/Resources/app.nw