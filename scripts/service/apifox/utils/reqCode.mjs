function reqCode(dataList) {
  return `
${dataList
  .filter((i) => !!i.reqCode)
  .map((i) => i.reqCode)
  .join("\n\n")}

export default {
    ${dataList
      .filter((i) => i.requestName?.length > 0)
      .map((i) => {
        return i.requestName.sort((a, b) => a.localeCompare(b)).join(",\n\t");
      })
      .sort((a, b) => a.localeCompare(b))
      .join(",\n\t")},
}
`;
}

export default reqCode;
