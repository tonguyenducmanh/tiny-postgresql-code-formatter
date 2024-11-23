import { config } from "../../config/config.js";
import { enumeration } from "../common/enumeration.js";
import { postgreSQLKeyword } from "../common/postgreSQLKeyword.js";
import {
  APOSTROPHECHAR,
  OPENPARENTHESISCHAR,
  CLOSEPARENTHESISCHAR,
  SPACECHAR,
  BREAKLINECHAR,
  EMPTYPARENTHESIS,
} from "../common/constant.js";

const TAB = config.tabSpace;
let _currentLevel = 0;
let _startNewLine = false;
let _lastRecusiveValue = null;
/**
 * biến đổi từ tree thành code đã format
 * @param {Abstract Syntax Tree node} node
 */
export function codeGenerator(node, index, allNodes) {
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
      result = node.value + BREAKLINECHAR;
      break;
    }
    case enumeration.astType.semi: {
      _startNewLine = true;
      result = node.value + BREAKLINECHAR + tabForSemi;
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
      result = tabForNewLine + APOSTROPHECHAR + node.value + APOSTROPHECHAR;
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
  let subFix = SPACECHAR;
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
    result = [
      OPENPARENTHESISCHAR,
      parenthesisValue,
      tabSpace + CLOSEPARENTHESISCHAR,
    ].join(BREAKLINECHAR);
  } else {
    result = EMPTYPARENTHESIS;
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
  if (postgreSQLKeyword.find((x) => valueBuild.compareText(x))) {
    if (config?.usingUpperCaseKeyWord) {
      valueBuild = valueBuild.toUpperCase();
    } else {
      valueBuild = valueBuild.toLowerCase();
    }
  }
  let subFix = buildSubFix(allNodes, index);

  if (config.listKeyWordBreakLine.find((x) => valueBuild.compareText(x))) {
    _startNewLine = true;
    result = BREAKLINECHAR + tabSpace + valueBuild + BREAKLINECHAR + tabSpace;
  } else if (
    config.listMutipleKeyWordBreakLine.find((x) =>
      valueBuild.compareStartText(x)
    )
  ) {
    result = BREAKLINECHAR + tabSpace + valueBuild + subFix;
  } else if (
    config.listMutipleKeyWordBreakLine.find((x) => valueBuild.compareEndText(x))
  ) {
    _startNewLine = true;
    result = valueBuild + BREAKLINECHAR + tabSpace;
  } else {
    result = tabForNewLine + valueBuild + subFix;
  }
  return result;
}
