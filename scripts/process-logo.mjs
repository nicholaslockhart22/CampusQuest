/**
 * One-time script: make logo background transparent and resize.
 * Usage: node scripts/process-logo.mjs
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const srcPath = join(
  root,
  "../.cursor/projects/Users-nicklockhart-campusquest/assets/image-ace67ea1-9960-49ce-afbc-0b5792087931.png"
);
const outPath = join(root, "public/campusquest-logo.png");

// Fallback: if assets path doesn't exist, copy from public current and just resize
const inputPath = existsSync(srcPath) ? srcPath : join(root, "public/campusquest-logo.png");

async function main() {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const { width } = meta;
  const newWidth = Math.round((width || 400) * 0.75); // 25% smaller

  let buffer = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = buffer;
  const { width: w, height: h, channels } = info;
  const pixelCount = w * h;

  // Make black / near-black pixels transparent (threshold ~30)
  const threshold = 35;
  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * channels + 0];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i * channels + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: w,
      height: h,
      channels: 4,
    },
  })
    .png()
    .resize(newWidth, null, { withoutEnlargement: true })
    .toFile(outPath);

  console.log("Logo written to public/campusquest-logo.png (transparent bg, smaller)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
