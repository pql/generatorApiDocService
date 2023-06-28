function resValueCode(dataList) {
  return `\n${dataList
    .filter((i) => !!i.resValueCode)
    .map((i) => i.resValueCode)
    .join("\n\n")}

export default {
\t${dataList
    .filter((i) => i.responseValueName?.length > 0)
    .map((i) => {
      return i.responseValueName
        .sort((a, b) => a.localeCompare(b))
        .join(",\n\t");
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",\n\t")},
}
`;
}

export default resValueCode;
