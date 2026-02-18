#!/usr/bin/env bash

set -euo pipefail

# config
SOURCE_DIR="development_behavior_packs/featherlifesteal"
BUILD_DIR="lifestealbuild"
PACK_NAME="featherlifesteal"
OUTPUT_MCPACK="${PACK_NAME}.mcpack"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source behavior pack folder '$SOURCE_DIR' not found."
  exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

DEST_DIR="${BUILD_DIR}/${PACK_NAME}"
cp -R "$SOURCE_DIR" "$DEST_DIR"

rm -rf lifestealbuild/featherlifesteal/.git
rm -rf lifestealbuild/featherlifesteal/node_modules

(
  cd "$BUILD_DIR"
  rm -f "$OUTPUT_MCPACK"

  zip -r "$OUTPUT_MCPACK" "$PACK_NAME" >/dev/null
)

echo "Built: ${BUILD_DIR}/${OUTPUT_MCPACK}"