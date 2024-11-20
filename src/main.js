/**
 * file chạy chính của chương trình
 */

import fs from "fs";
import { formatCode } from "./formatCode.js";
import { validateCode } from "./validateCode.js";

const _utf8 = "utf8";
const _inputPath = "./input/input.sql";
const _outputPath = "./output/output.sql";
const _errorResultMessage = "formatted code error";

/**
 * hàm chạy chính của chương trình
 */
export function main() {
  // đọc file source
  fs.readFile(_inputPath, _utf8, (err, sourceCode) => {
    if (err) {
      throw new Error(`Error reading file: ${err}`);
    }

    // Format code trong file source
    let formattedCode = formatCode(sourceCode);

    // kiểm tra code trong file source và result có giống nhau không
    if (!validateCode(sourceCode, formattedCode)) {
      formattedCode = _errorResultMessage;
    }

    // lưu file kết quả
    fs.writeFile(_outputPath, formattedCode, (err) => {
      if (err) {
        throw new Error(`Error writing file: ${err}`);
      }
    });
  });
}
