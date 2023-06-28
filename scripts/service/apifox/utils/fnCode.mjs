function fnCode(dataList, methodImport, requestImport, responseImport) {
  return `${methodImport}
${requestImport.replace(
  /\$/,
  `\n\t${dataList
    .filter((i) => i.requestName?.length > 0)
    .map((i) => {
      return i.requestName.sort((a, b) => a.localeCompare(b)).join(",\n\t");
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",\n\t")},\n`
)}
${responseImport.replace(
  /\$/,
  `\n\t${dataList
    .filter((i) => i.responseName?.length > 0)
    .map((i) => {
      return i.responseName.sort((a, b) => a.localeCompare(b)).join(",\n\t");
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",\n\t")},\n`
)}

${dataList
  .filter((i) => !!i.fnCode)
  .map((i) => i.fnCode)
  .join("\n")}
`;
}

export default fnCode;
