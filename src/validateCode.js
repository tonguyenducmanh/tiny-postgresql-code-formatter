/**
 * File thực hiện validate code
 */
import fs from "fs";
import "./prototype.js";

const _sourceCompare = "./output/sourceCompare.txt";
const _formatCompare = "./output/formatCompare.txt";

/**
 * hàm thực hiện kiểm tra xem sourceCode và formattedCode có giống nhau không
 * @param {*} sourceCode code cần format
 * @param {*} formattedCode code đã format
 * @returns kết quả validate
 */
export function validateCode(sourceCode, formattedCode) {
  // lọc hết khoảng cách giữa các chữ và xuống dòng đi
  let sourceCodeTrim = sourceCode.replace(/\s+/g, "");
  let formatCodeTrim = formattedCode.replace(/\s+/g, "");
  // lưu file kết quả+
  fs.writeFile(_sourceCompare, sourceCodeTrim, (err) => {
    if (err) {
      throw new Error(`Error writing file: ${err}`);
    }
  });
  // lưu file kết quả+
  fs.writeFile(_formatCompare, formatCodeTrim, (err) => {
    if (err) {
      throw new Error(`Error writing file: ${err}`);
    }
  });
  return sourceCodeTrim.compareText(formatCodeTrim);
}
