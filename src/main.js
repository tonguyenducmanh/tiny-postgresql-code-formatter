/**
 * file chạy chính của chương trình
 */

import fs from "fs";
import { formatCode } from "./formatCode.js";
import { validateCode } from "./validateCode.js";

const _utf8 = "utf8";
const _inputPath = "./input/input.sql"; // Change this to your input file
const _outputPath = "./output/output.sql"; // Output file
const _errorResultMessage = "formatted code error";
const _errorReadFileMessage = "Đã có lỗi khi đọc file";
const _errorWriteFileMessage = "Đã có lỗi khi viết file";

/**
 * hàm chạy chính của chương trình
 */
export function main() {
  // đọc file source
  fs.readFile(_inputPath, _utf8, (err, sourceCode) => {
    if (err) {
      console.error(`${_errorReadFileMessage}: ${err}`);
      return;
    }

    // Format code trong file source
    const formattedCode = formatCode(sourceCode);

    // kiểm tra code trong file source và result có giống nhau không
    if (!validateCode(sourceCode, formattedCode)) {
      formattedCode = _errorResultMessage;
    }

    // lưu file kết quả+
    fs.writeFile(_outputPath, formattedCode, (err) => {
      if (err) {
        console.error(`${_errorWriteFileMessage}: ${err}`);
        return;
      }
    });
  });
}
