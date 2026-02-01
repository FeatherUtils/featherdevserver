#!/usr/bin/env bash

set -euo pipefail

# CONFIG
SOURCE_DIR="development_behavior_packs/FeatherDynamicLighting"
BUILD_DIR="dynlightbuild"
SOURCE_FOLDER_NAME="FeatherDynamicLighting"
PACK_NAME="FeatherDynamicLighting"
OUTPUT_MCPACK="${PACK_NAME}.mcpack"

# Ensure source exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source behavior pack folder '$SOURCE_DIR' not found."
  exit 1
fi

# Clean + recreate build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy pack contents into build/lifesteal
DEST_DIR="${BUILD_DIR}/${SOURCE_FOLDER_NAME}"
cp -R "$SOURCE_DIR" "$DEST_DIR"

rm -rf ${BUILD_DIR}/${SOURCE_FOLDER_NAME}/.git
rm -rf ${BUILD_DIR}/${SOURCE_FOLDER_NAME}/node_modules

# Create the mcpack (zip of the pack folder, renamed)
(
  cd "$BUILD_DIR"
  # Remove any old mcpack with the same name
  rm -f "$OUTPUT_MCPACK"

  # Zip the folder contents *with the folder as root in archive*
  zip -r "$OUTPUT_MCPACK" "$PACK_NAME" >/dev/null
)

echo "Built: ${BUILD_DIR}/${OUTPUT_MCPACK}"