import { enumeration } from "../common/enumeration.js";

const NUMBERS = /[0-9]/;
const WHITESPACE = /\s/;
const BREAKLINE = `
`;
const NEWLINE = /\n/;
const LETTERSCONTAINNUM = /^[a-z_.:*%><=0-9]+$/i;
/**
 * Bóc tách code thành từng token
 * @param {string} input sourceCode muốn bóc tách thành từng token
 * @returns danh sách token
 */
export function generateTokenizer(input) {
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

    //postgresql viết text trong dấu nháy '' thay vì ""
    // lọc ra văn bản vd '1234'
    if (char === "'") {
      // tương tự như số, lưu danh sách các văn bản kiếm được
      let value = "";
      // bỏ qua dấu nháy kép ban đầu
      char = input[++current];
      // lấy ra các ký tự đến khi gặp ký tự ' tiếp theo
      while (char !== "'") {
        value += char;
        char = input[++current];
      }
      char = input[++current];

      tokens.push({ type: enumeration.tokenType.text, value });

      continue;
    }

    // lọc ra các ký tự keyword trong ngôn ngữ lập trình, vd select, where
    // 1 số alias table như svd2 svd3 thì vẫn coi là keyword
    if (LETTERSCONTAINNUM.test(char)) {
      let value = "";

      // lọc hết, do đã bỏ qua văn bản và số, các ký tự đặc biệt bên trên rồi
      while (LETTERSCONTAINNUM.test(char)) {
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
