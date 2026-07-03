import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ES Module __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CobolService {
  /**
   * Execute a compiled COBOL executable.
   *
   * @param {string} programName
   * @param {string[]} args
   * @returns {Promise<Object>}
   */
  static execute(programName, args = []) {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === "win32";
      const binaryExt = isWindows ? ".exe" : "";

      // Path: backend/binaries/programName.exe
      const binaryPath = path.resolve(
        __dirname,
        "..",
        "binaries",
        `${programName}${binaryExt}`
      );

      console.log("====================================");
      console.log("COBOL Binary:", binaryPath);
      console.log("Exists:", fs.existsSync(binaryPath));
      console.log("Arguments:", args);
      console.log("====================================");

      if (!fs.existsSync(binaryPath)) {
        return reject(
          new Error(
            `COBOL executable not found.\nExpected location:\n${binaryPath}`
          )
        );
      }

      execFile(binaryPath, args, (error, stdout, stderr) => {
        if (error) {
          return reject(
            new Error(
              `COBOL Execution Failure:\n${stderr || error.message}`
            )
          );
        }

        const cleanStdout = stdout.trim();
        const cleanStderr = stderr.trim();

        if (cleanStderr) {
          console.warn("COBOL STDERR:", cleanStderr);
        }

        if (!cleanStdout) {
          return reject(
            new Error("COBOL program returned no output.")
          );
        }

        try {
          const result = JSON.parse(cleanStdout);
          resolve(result);
        } catch {
          // Return plain text if output isn't JSON
          resolve({
            success: true,
            output: cleanStdout,
          });
        }
      });
    });
  }
}

export default CobolService;