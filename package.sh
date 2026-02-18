#!/bin/bash

set -e

if [ ! -d "backups" ]; then
    mkdir backups
fi

if [ -d "build" ]; then
    timestamp=$(date +"%Y%m%d_%H%M%S")
    mv build "backups/build_backup_$timestamp"
fi

mkdir -p build

cp -r development_behavior_packs/FeatherBehavior build/
cp -r development_resource_packs/Feather\ RP build/

rm -rf build/FeatherBehavior/.git

cd build

zip -r Feather.mcaddon FeatherBehavior Feather\ RP

cd /root/featherdevserver/development_behavior_packs/FeatherBehavior
git add .
git commit -m "Build_$timestamp"
git push

cd /root/featherdevserver/
git add .
git commit -m "Build_$timestamp"
git push