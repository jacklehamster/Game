#!/usr/bin/env bash
scripts/sync.sh
scripts/png2icns.sh
cp -rf ../app_template/App.app out/Game.app
zip -r out/Game.zip src/*