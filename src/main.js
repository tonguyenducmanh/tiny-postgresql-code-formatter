import fs from "fs";
import { formatCode } from "./formatCode.js";
import { validateCode } from "./validateCode.js";
const _inputPath = "./input/input.sql"; // Change this to your input file
const _outputPath = "./output/output.sql"; // Output file
const _errorResultMessage = "formatted code error";

export function main() {
  // Read input file
  fs.readFile(_inputPath, "utf8", (err, code) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    // Format the code
    const formattedCode = formatCode(code);

    // validate code
    if (!validateCode(code, formatCode)) {
      formattedCode = _errorResultMessage;
    }

    // Write the formatted code to the output file
    fs.writeFile(_outputPath, formattedCode, (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
        return;
      }
    });
  });
}
