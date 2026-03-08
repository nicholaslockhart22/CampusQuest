/**
 * Generate PWA icon sizes from public/campusquest-logo.png
 * Run: node scripts/generate-pwa-icons.cjs
 * Requires: npm install (sharp is a devDependency)
 */
const path = require("path");
const fs = require("fs");

async function main() {
  const sharp = require("sharp");
  const publicDir = path.join(__dirname, "..", "public");
  const logoPath = path.join(publicDir, "campusquest-logo.png");

  if (!fs.existsSync(logoPath)) {
    console.error("Source logo not found:", logoPath);
    process.exit(1);
  }

  const sizes = [
    [192, 192, "icon-192x192.png"],
    [512, 512, "icon-512x512.png"],
    [180, 180, "apple-icon.png"],
  ];

  for (const [w, h, name] of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(logoPath).resize(w, h).png().toFile(outPath);
    console.log("Created", name, `(${w}x${h})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
