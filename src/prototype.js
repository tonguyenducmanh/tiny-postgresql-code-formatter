/**
 * hàm format string giống như String.Format của C#
 * Created by tdmanh1 19/09/2024
 */
String.prototype.format =
  String.prototype.format ||
  function () {
    var arg = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof arg[number] != "undefined" ? arg[number] : match;
    });
  };

/**
 * Kiểm tra kiểu string null hoặc empty
 */
String.prototype.isNullOrEmpty =
  String.prototype.isNullOrEmpty ||
  function () {
    return !this;
  };

/**
 * Kiểm tra string empty
 */
String.prototype.isEmpty =
  String.prototype.isEmpty ||
  function () {
    return this.length == 0;
  };

/**
 * Kiểm tra string chứa 1 string
 */

String.prototype.contains =
  String.prototype.contains ||
  function (value) {
    return arguments && arguments[0] && this.indexOf(arguments[0]) > -1;
  };

/**
 * Thay thế toàn bộ ký tự thỏa mãn điều kiện
 */

String.prototype.replaceAll = function (from, to) {
  return this.split(from).join(to);
};

/**
 * so sánh 2 text string không phân biệt hoa thường và khoảng cách
 */
String.prototype.compareText =
  String.prototype.compareText ||
  function (value) {
    return (
      arguments &&
      arguments[0] &&
      this.trim().toLowerCase() == value.toString().trim().toLowerCase()
    );
  };

/**
 * kiểm tra bắt đầu bằng không phân biệt hoa thường và khoảng cách
 */
String.prototype.compareStartText =
  String.prototype.compareStartText ||
  function (value) {
    return (
      arguments &&
      arguments[0] &&
      value.trim().toLowerCase().startsWith(this.trim().toLowerCase())
    );
  };

/**
 * kiểm tra kết thúc bằng không phân biệt hoa thường và khoảng cách
 */
String.prototype.compareEndText =
  String.prototype.compareEndText ||
  function (value) {
    return (
      arguments &&
      arguments[0] &&
      value.trim().toLowerCase().endsWith(this.trim().toLowerCase())
    );
  };
