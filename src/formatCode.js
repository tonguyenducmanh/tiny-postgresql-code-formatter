/**
 * file thực hiện nghiệp vụ format code
 */

import { config } from "./config.js";
import "./prototype.js";
import { generateParser } from "./generateParser.js";
import { generateTokenizer } from "./generateTokenizer.js";
import { codeGenerator } from "./codeGenerator.js";

export const NUMBERS = /[0-9]/;
export const WHITESPACE = /\s/;
export const BREAKLINE = `
`;
export const NEWLINE = /\n/;
export const LETTERS = /^[a-z_.:*%><=]+$/i;
const TAB = config.tabSpace;
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
