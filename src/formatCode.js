/**
 * file thực hiện nghiệp vụ format code
 */

import { enumeration } from "./enumeration.js";
import { config } from "./config.js";
import { postgreSQLKeyword } from "./postgreSQLKeyword.js";
import "./prototype.js";

const NUMBERS = /[0-9]/;
const WHITESPACE = /\s/;
const BREAKLINE = `
`;
const NEWLINE = /\n/;
const LETTERS = /^[a-z_.:*%><=]+$/i;
const TAB = config.tabSpace;
let _currentLevel = 0;
let _startNewLine = false;
let _lastRecusiveValue = null;
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

    if (char === ",") {
      tokens.push({
        type: enumeration.tokenType.semi,
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
        enumeration.tokenType.semi,
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
      // kiểm tra xem trong ngoặc có phần tử nào không
      let firstItemInParenthesis = walk(token);
      let node = {
        type: enumeration.astType.callExpression,
      };
      if (firstItemInParenthesis) {
        node.params = [firstItemInParenthesis];
      } else {
        return node;
      }
      // nếu trong ngoặc có phần tử thì thực hiện vòng while để quét bằng hết các phần tử
      while (
        token &&
        (token.type !== enumeration.tokenType.parenthesis ||
          (token.type === enumeration.tokenType.parenthesis &&
            token.value !== ")"))
      ) {
        let nextWalk = walk();
        if (nextWalk) {
          node.params.push(nextWalk);
          token = tokens[current];
        } else {
          return node;
        }
      }

      current++;

      return node;
    }

    //throw new TypeError(token.type);
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
function codeGenerator(node, index, allNodes) {
  if (!_lastRecusiveValue) {
    _startNewLine = true;
  }
  let tabSpace = _currentLevel > 0 ? TAB.repeat(_currentLevel) : "";
  let tabForNewLine = _startNewLine ? TAB : "";
  let tabForSemi = TAB.repeat(_currentLevel - 1 > 0 ? _currentLevel : 0);
  let result = null;
  _startNewLine = false;
  switch (node.type) {
    // node là program thì chạy toàn bộ các node con
    case enumeration.astType.program: {
      let allValues = node.body.map((x, index, arr) =>
        codeGenerator(x, index, arr)
      );
      result = allValues.join("");
      break;
    }
    // bỏ qua xuống dòng thừa thãi từ source code
    case enumeration.astType.newLine: {
      result = null;
      break;
    }

    case enumeration.astType.semicolon:
    case enumeration.astType.comment: {
      result = node.value + "\n";
      break;
    }
    case enumeration.astType.semi: {
      _startNewLine = true;
      result = node.value + "\n" + tabForSemi;
      break;
    }
    case enumeration.astType.keyword: {
      result = buildKeyWordText(node, tabSpace, tabForNewLine, allNodes, index);
      break;
    }
    case enumeration.astType.number: {
      let subFix = buildSubFix(allNodes, index);
      result = tabForNewLine + node.value + subFix;
      break;
    }
    case enumeration.astType.text: {
      result = tabForNewLine + '"' + node.value + '"';
      break;
    }
    case enumeration.astType.callExpression: {
      result = buildCallExpressionText(node, tabSpace);
      break;
    }
    default:
      throw new TypeError(node.type);
  }
  _lastRecusiveValue = result;
  return result;
}

/**
 * kiểm tra và build ra hậu tố cho text hiện tại
 * @param {*} allNodes tất cả các node
 * @param {*} index index của node hiện tại
 * @returns subfix
 */
function buildSubFix(allNodes, index) {
  let subFix = " ";
  if (allNodes?.length > 0 && index + 1 < allNodes.length) {
    let nextNode = allNodes[index + 1];
    // nếu node tiếp theo là dấu ; hoặc , thì không build subfix
    if (
      nextNode.type == enumeration.astType.semi ||
      nextNode.type == enumeration.astType.semicolon
    ) {
      subFix = "";
    }
  }
  return subFix;
}

/**
 * build ra đoạn text tương ứng với các text trong dấu ()
 * @param {*} node node hiện tại trong cây ast
 * @param {*} tabSpace khoảng cách thụt lề (so với thụt lề của dòng bên trên)
 * @returns result
 */
function buildCallExpressionText(node, tabSpace) {
  let result = null;
  _currentLevel++;
  _startNewLine = true;
  // kiểm tra xem ngoặc có giá trị gì bên trong không
  let parenthesisValue = null;
  if (node?.params?.length > 0) {
    parenthesisValue = node.params
      .map((x, index, arr) => codeGenerator(x, index, arr))
      .join("");
  }
  if (parenthesisValue) {
    result = ["(", parenthesisValue, tabSpace + ")"].join("\n");
  } else {
    result = "()";
  }
  _currentLevel--;
  return result;
}

/**
 * build ra đoạn text tương ứng với keyword vd select
 * @param {*} node node hiện tại trong cây ast
 * @param {*} tabSpace khoảng cách thụt lề (so với thụt lề của dòng bên trên)
 * @param {*} tabForNewLine khoảng cách thụt lề cho dòng mới
 * @param {*} allNodes tất cả các node
 * @param {*} index index của node hiện tại
 * @returns result
 */
function buildKeyWordText(node, tabSpace, tabForNewLine, allNodes, index) {
  let result = null;
  let valueBuild = node.value;
  // kiểm tra xem có auto viết hoa từ khóa này không
  if (postgreSQLKeyword.find((x) => node.value.compareText(x))) {
    if (config?.usingUpperCaseKeyWord) {
      valueBuild = node.value.toUpperCase();
    } else {
      valueBuild = node.value.toLowerCase();
    }
  }
  let subFix = buildSubFix(allNodes, index);

  // kiểm tra xem phải danh sách các từ bắt đầu xuống dòng không
  if (config.listKeyWordBreakLine.find((x) => node.value.compareText(x))) {
    _startNewLine = true;
    result = "\n" + tabSpace + valueBuild + "\n" + tabSpace;
  }
  // kiểm tra xem trong danh sách config có ông nào start với text dưới
  else if (
    config.listMutipleKeyWordBreakLine.find((x) =>
      node.value.compareStartText(x)
    )
  ) {
    result = "\n" + tabSpace + valueBuild + subFix;
  }
  // kiểm tra xem trong danh sách config có ông nào end với text dưới
  else if (
    config.listMutipleKeyWordBreakLine.find((x) => node.value.compareEndText(x))
  ) {
    _startNewLine = true;
    result = valueBuild + "\n" + tabSpace;
  } else {
    result = tabForNewLine + valueBuild + subFix;
  }
  return result;
}
