/**
 * file thực hiện nghiệp vụ format code
 */

import "./common/prototype.js";
import { generateParser } from "./generate/generateParser.js";
import { generateTokenizer } from "./generate/generateTokenizer.js";
import { codeGenerator } from "./generate/generatorCode.js";

/**
 * Hàm chính để format code
 * @param {string} sourceCode: text cần format
 * @returns
 */
export function formatCode(sourceCode) {
  let tokens = generateTokenizer(sourceCode);
  let ast = generateParser(tokens);
  let formattedCode = codeGenerator(ast);
  return transformAfterFormat(formattedCode);
}

/**
 * 1 số xử lý không muốn dùng trong hàm codeGenerator tránh đệ quy
 * @param {string} formattedCode
 * @returns
 */
function transformAfterFormat(formattedCode) {
  // cắt đầu cuối, xóa dòng bị trống (ngoại trừ việc kết thúc dòng trên bằng ;)
  return formattedCode
    ?.replace(/^\s*[\r\n]/gm, "")
    .replace(/;/g, ";\n")
    .trim();
}
