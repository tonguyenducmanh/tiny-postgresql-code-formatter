/**
 * file thực hiện nghiệp vụ format code
 */

import { postgreSQLLanguage } from "./postgreSQLLanguage.js";

/**
 * Hàm chính để format code
 * @param {string} sourceCode: text cần format
 * @returns
 */
export function formatCode(sourceCode) {
  if (!validateConfigPostgreSQL()) {
    return sourceCode;
  }
}

function validateConfigPostgreSQL() {
  if (!postgreSQLLanguage.keyword) {
    throw new Error("Not config PostGreSQL KeyWorld");
  }
  if (!postgreSQLLanguage.character) {
    throw new Error("Not config PostGreSQL Character");
  }
  return true;
}
