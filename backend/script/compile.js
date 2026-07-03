import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cobolDir = path.join(__dirname, "../cobol");
const binaryDir = path.join(__dirname, "../binaries");

// Create binaries folder
if (!fs.existsSync(binaryDir)) {
  fs.mkdirSync(binaryDir, { recursive: true });
}

console.log("🔨 Starting automated GnuCOBOL build sequence...");

try {
  const files = fs.readdirSync(cobolDir);

  const cobolFiles = files.filter(
    file => file.endsWith(".cob") || file.endsWith(".cbl")
  );

  if (cobolFiles.length === 0) {
    console.log("⚠ No COBOL files found.");
    process.exit(0);
  }

  cobolFiles.forEach(file => {

    const sourcePath = path.join(cobolDir, file);

    let baseName = path.basename(file, path.extname(file));

    // Avoid reserved keywords
    if (baseName.toLowerCase() === "register") {
      baseName = "user_register";
    }

    if (baseName.toLowerCase() === "login") {
      baseName = "user_login";
    }

    const outputPath = path.join(binaryDir, `${baseName}.exe`);

    console.log(`Compiling ${file}`);

    execSync(
      `cobc -x -free -o "${outputPath}" "${sourcePath}"`,
      {
        stdio: "inherit",
        env: {
          ...process.env,
          COB_CONFIG_DIR: "C:\\msys64\\ucrt64\\share\\gnucobol\\config",
          COB_COPY_DIR: "C:\\msys64\\ucrt64\\share\\gnucobol\\copy"
        }
      }
    );

    console.log(`✅ ${baseName}.exe created`);
  });

  console.log("🎉 All COBOL programs compiled successfully.");

} catch (err) {
  console.error(err.message);
  process.exit(1);
}