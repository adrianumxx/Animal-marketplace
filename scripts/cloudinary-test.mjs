// Cloudinary onboarding test — run: node scripts/cloudinary-test.mjs
import { v2 as cloudinary } from "cloudinary";

// 1. Configure (inline for this onboarding test)
cloudinary.config({
  cloud_name: "difvfzm0g",
  api_key: "274858172744978",
  api_secret: "jm_c7uEYMCCYLPNRtFtHOBSYdms",
  secure: true,
});

async function main() {
  // 2. Upload a sample image from Cloudinary's demo domain
  const res = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
    folder: "pawtrust/onboarding-test",
  });
  console.log("Uploaded secure URL:", res.secure_url);
  console.log("Public ID:", res.public_id);

  // 3. Image details
  console.log("\nDetails:");
  console.log("  width :", res.width);
  console.log("  height:", res.height);
  console.log("  format:", res.format);
  console.log("  bytes :", res.bytes);

  // 4. Transformed URL:
  //    f_auto -> Cloudinary picks the best image format for the browser (WebP/AVIF/...)
  //    q_auto -> Cloudinary picks the best quality/size trade-off automatically
  const transformed = cloudinary.url(res.public_id, { fetch_format: "auto", quality: "auto" });
  console.log("\nDone! Click link below to see the optimized version of the image. Check the size and the format.");
  console.log(transformed);
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
