#!/usr/bin/env node
/**
 * Generate PNG icons from SVG for PWA & App Stores
 * Usage: node scripts/generate-icons.js
 * Requires: sharp (npm install sharp --save-dev)
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SVG_PATH = path.join(__dirname, "../public/icons/icon.svg");
const OUT_DIR = path.join(__dirname, "../public/icons");

// PWA icons
const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// App Store sizes
const IOS_SIZES = [
  { size: 1024, name: "ios-1024" }, // App Store
  { size: 180, name: "ios-180" },   // iPhone @3x
  { size: 167, name: "ios-167" },   // iPad Pro
  { size: 152, name: "ios-152" },   // iPad @2x
  { size: 120, name: "ios-120" },   // iPhone @2x
];

// Play Store
const ANDROID_SIZES = [
  { size: 512, name: "android-512" },   // Play Store
  { size: 192, name: "android-192" },   // xxxhdpi
  { size: 144, name: "android-144" },   // xxhdpi
  { size: 96, name: "android-96" },     // xhdpi
  { size: 72, name: "android-72" },     // hdpi
  { size: 48, name: "android-48" },     // mdpi
];

async function generate() {
  const svg = fs.readFileSync(SVG_PATH);

  // PWA icons (regular)
  for (const size of PWA_SIZES) {
    await sharp(svg).resize(size, size).png().toFile(path.join(OUT_DIR, `icon-${size}.png`));
    console.log(`  ✓ icon-${size}.png`);
  }

  // PWA maskable icons (with padding for safe zone)
  for (const size of [192, 512]) {
    const padding = Math.round(size * 0.1);
    const inner = size - padding * 2;
    const bg = Buffer.from(
      `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#6366f1"/></svg>`
    );
    const icon = await sharp(svg).resize(inner, inner).png().toBuffer();
    await sharp(bg)
      .composite([{ input: icon, left: padding, top: padding }])
      .png()
      .toFile(path.join(OUT_DIR, `icon-maskable-${size}.png`));
    console.log(`  ✓ icon-maskable-${size}.png`);
  }

  // iOS icons
  console.log("\niOS:");
  for (const { size, name } of IOS_SIZES) {
    await sharp(svg).resize(size, size).png().toFile(path.join(OUT_DIR, `${name}.png`));
    console.log(`  ✓ ${name}.png`);
  }

  // Android icons
  console.log("\nAndroid:");
  for (const { size, name } of ANDROID_SIZES) {
    await sharp(svg).resize(size, size).png().toFile(path.join(OUT_DIR, `${name}.png`));
    console.log(`  ✓ ${name}.png`);
  }

  // Favicon
  await sharp(svg).resize(32, 32).png().toFile(path.join(OUT_DIR, "../favicon.png"));
  await sharp(svg).resize(16, 16).png().toFile(path.join(OUT_DIR, "../favicon-16.png"));
  console.log("\n  ✓ favicon.png");

  console.log("\n✅ All icons generated!");
}

generate().catch(console.error);
