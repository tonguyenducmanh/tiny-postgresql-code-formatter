export const config = {
  // có tự động viết hoa các từ khóa trong postgreSQL không
  usingUpperCaseKeyWord: true,
  // độ dài của 1 tab
  tabSpace: "    ",
  // danh sách các từ khóa sẽ xuống dòng và tab vào
  listKeyWordBreakLine: [
    "select",
    "where",
    "having",
    "and",
    "or",
    "from",
    "drop",
  ],
  // danh sách các cụm từ khóa sẽ xuống dòng và tab vào
  listMutipleKeyWordBreakLine: ["group by", "order by"],
};
