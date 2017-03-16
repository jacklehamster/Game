#!/usr/bin/env bash
scripts/sync.sh
scripts/png2icns.sh
mkdir out
cp -rf ../gamelib/app_template/App.app out/Game.app
zip -r -X out/Game.zip src/*