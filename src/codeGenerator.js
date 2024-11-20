import { config } from "./config";
import { enumeration } from "./enumeration";
import { postgreSQLKeyword } from "./postgreSQLKeyword";

let _currentLevel = 0;
/**
 * biến đổi từ tree thành code đã format
 * @param {Abstract Syntax Tree node} node
 */
export function codeGenerator(node, index, allNodes) {
  let result = null;
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
      result = node.value + "\n";
      break;
    }
    case enumeration.astType.keyword: {
      result = buildKeyWordText(node, allNodes, index);
      break;
    }
    case enumeration.astType.number: {
      let subFix = buildSubFix(allNodes, index);
      result = node.value + subFix;
      break;
    }
    case enumeration.astType.text: {
      result = '"' + node.value + '"';
      break;
    }
    case enumeration.astType.callExpression: {
      result = buildCallExpressionText(node);
      break;
    }
    default:
      throw new TypeError(node.type);
  }
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
 * @returns result
 */
function buildCallExpressionText(node) {
  let result = null;
  _currentLevel++;
  // kiểm tra xem ngoặc có giá trị gì bên trong không
  let parenthesisValue = null;
  if (node?.params?.length > 0) {
    parenthesisValue = node.params
      .map((x, index, arr) => codeGenerator(x, index, arr))
      .join("");
  }
  if (parenthesisValue) {
    result = ["(", parenthesisValue + ")"].join("\n");
  } else {
    result = "()";
  }
  _currentLevel--;
  return result;
}
/**
 * build ra đoạn text tương ứng với keyword vd select
 * @param {*} node node hiện tại trong cây ast
 * @param {*} allNodes tất cả các node
 * @param {*} index index của node hiện tại
 * @returns result
 */
function buildKeyWordText(node, allNodes, index) {
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

  // kiểm tra xem trong danh sách config có ông nào start với text dưới
  if (
    config.listMutipleKeyWordBreakLine.find((x) =>
      node.value.compareStartText(x)
    )
  ) {
    result = "\n" + valueBuild + subFix;
  }

  // kiểm tra xem trong danh sách config có ông nào end với text dưới
  else if (
    config.listMutipleKeyWordBreakLine.find((x) => node.value.compareEndText(x))
  ) {
    result = valueBuild + "\n";
  }

  // kiểm tra xem phải danh sách các từ bắt đầu xuống dòng không
  else if (config.listKeyWordBreakLine.find((x) => node.value.compareText(x))) {
    result = "\n" + valueBuild + "\n";
  } else {
    result = valueBuild + subFix;
  }
  return result;
}
