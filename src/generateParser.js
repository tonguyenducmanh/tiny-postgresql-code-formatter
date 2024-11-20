import { enumeration } from "./enumeration.js";

/**
 * biến đổi các token thành Abstract Syntax Tree
 * @param {array} tokens: danh sách các token đã parse được
 */
export function generateParser(tokens) {
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
