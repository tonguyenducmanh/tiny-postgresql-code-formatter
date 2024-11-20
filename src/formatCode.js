/**
 * file thực hiện nghiệp vụ format code
 */

import { enumeration } from "./enumeration.js";

const NUMBERS = /[0-9]/;
const WHITESPACE = /\s/;
const BREAKLINE = `
`;
const NEWLINE = /\n/;
const LETTERS = /^[a-z_.*%><=]+$/i;

/**
 * Hàm chính để format code
 * @param {string} sourceCode: text cần format
 * @returns
 */
export function formatCode(sourceCode) {
  let tokens = generateTokenizer(sourceCode);
  let ast = generateParser(tokens);
  let formattedCode = codeGenerator(ast);
  return formattedCode?.trim();
}

/**
 * Bóc tách code thành từng token
 * @param {string} input sourceCode muốn bóc tách thành từng token
 * @returns danh sách token
 */
function generateTokenizer(input) {
  // chữ cái hiện tại muốn check
  let current = 0;

  // mảng token trả về
  let tokens = [];

  // duyệt qua toàn bộ các từ khóa
  while (current < input.length) {
    // lấy ra giá trị text hiện tại
    let char = input[current];

    if (char === "(") {
      tokens.push({
        type: enumeration.tokenType.parenthesis,
        value: char,
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: enumeration.tokenType.parenthesis,
        value: char,
      });
      current++;
      continue;
    }

    if (char === ";") {
      tokens.push({
        type: enumeration.tokenType.semicolon,
        value: char,
      });
      current++;
      continue;
    }

    // lọc ra comment theo dòng --
    if (char === "-") {
      // kiểm tra ký tự tiếp theo phải - không, có thì lọc tất cả đến khi ra ký tự xuống dòng
      let value = char;
      char = input[++current];
      if (char === "-") {
        while (input[current] != BREAKLINE) {
          value += char;
          char = input[++current];
        }

        tokens.push({
          type: enumeration.tokenType.comment,
          value: value,
        });

        continue;
      } else {
        // không phải thì thêm ký tự - ban đầu vào dấu câu
        tokens.push({
          type: enumeration.tokenType.keyword,
          value: value,
        });
      }
    }

    // nếu là dấu xuống dòng
    if (NEWLINE.test(char)) {
      tokens.push({
        type: enumeration.tokenType.newLine,
        value: char,
      });
      current++;
      continue;
    }

    // lọc ra comment theo nhiều dòng /* */
    if (char === "/") {
      // kiểm tra ký tự tiếp theo phải * không, có thì lọc tất cả đến khi ra chuỗi "*/"
      let value = char;
      char = input[++current];
      if (char === "*") {
        while (value.slice(value.length - 2) != "*/") {
          value += char;
          char = input[++current];
        }

        tokens.push({
          type: enumeration.tokenType.comment,
          value: value,
        });

        continue;
      } else {
        // không phải thì thêm ký tự / ban đầu vào keyword
        tokens.push({
          type: enumeration.tokenType.keyword,
          value: value,
        });
      }
    }

    // bỏ qua toàn bộ khoảng cách
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // lọc ra chữ số vd 123, 456
    if (NUMBERS.test(char)) {
      // dùng biến này lưu các số lọc được
      let value = "";
      // dùng vòng while lọc đến khi hết các số thì dừng
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: enumeration.tokenType.number, value });

      continue;
    }

    // lọc ra văn bản vd "1234"
    if (char === '"') {
      // tương tự như số, lưu danh sách các văn bản kiếm được
      let value = "";
      // bỏ qua dấu nháy kép ban đầu
      char = input[++current];
      // lấy ra các ký tự đến khi gặp ký tự " tiếp theo
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];

      tokens.push({ type: enumeration.tokenType.text, value });

      continue;
    }

    // lọc ra các ký tự keyword trong ngôn ngữ lập trình, vd select, where
    if (LETTERS.test(char)) {
      let value = "";

      // lọc hết, do đã bỏ qua văn bản và số, các ký tự đặc biệt bên trên rồi
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: enumeration.tokenType.keyword, value });

      continue;
    }

    // không tìm được ký tự hiện tại thì văng exception
    //throw new TypeError("I dont know what this character is: " + char);
    // tạm thời cho next
    current++;
    continue;
  }

  return tokens;
}

/**
 * biến đổi các token thành Abstract Syntax Tree
 * @param {array} tokens: danh sách các token đã parse được
 */
function generateParser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (
      [
        enumeration.tokenType.number,
        enumeration.tokenType.text,
        enumeration.tokenType.keyword,
        enumeration.tokenType.semicolon,
        enumeration.tokenType.newLine,
        enumeration.tokenType.comment,
      ].includes(token.type)
    ) {
      current++;
      return {
        type: enumeration.astType[token.type],
        value: token.value,
      };
    }

    if (
      token.type === enumeration.tokenType.parenthesis &&
      token.value === "("
    ) {
      token = tokens[++current];

      let node = {
        type: enumeration.astType.callExpression,
        params: [walk(token)],
      };

      while (
        token.type !== enumeration.tokenType.parenthesis ||
        (token.type === enumeration.tokenType.parenthesis &&
          token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;

      // And return the node.
      return node;
    }

    // throw new TypeError(token.type);
    // tạm thời next
    current++;
  }

  // cây phân hệ
  let ast = {
    type: enumeration.astType.program,
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // trả về cây phân hệ đã parse
  return ast;
}

/**
 * biến đổi từ tree thành code đã format
 * @param {Abstract Syntax Tree node} node
 */
function codeGenerator(node) {
  switch (node.type) {
    // node là program thì chạy toàn bộ các node con
    case enumeration.astType.program:
      return node.body.map(codeGenerator).join("");

    case enumeration.astType.semicolon:
      return node.value + "\n";
    case enumeration.astType.keyword:
    case enumeration.astType.number:
      return node.value + " ";
    case enumeration.astType.comment:
      return node.value + "\n";
    case enumeration.astType.text:
      return '"' + node.value + '"';
    // bỏ qua xuống dòng thừa thãi từ source code
    case enumeration.astType.newLine:
      return null;
    case enumeration.astType.callExpression:
      return ["", "(", node.params.map(codeGenerator).join(""), ")", ""].join(
        "\n"
      );
    default:
      throw new TypeError(node.type);
  }
}
