/**
 * File thực hiện validate code
 */

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
  return sourceCodeTrim == formatCodeTrim;
}
