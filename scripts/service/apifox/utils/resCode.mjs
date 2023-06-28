function resCode(dataList) {
  return `\n${dataList
    .filter((i) => !!i.resCode)
    .map((i) => i.resCode)
    .join("\n\n")}

export default {
\t${dataList
    .filter((i) => i.responseName?.length > 0)
    .map((i) => {
      return i.responseName.sort((a, b) => a.localeCompare(b)).join(",\n\t");
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",\n\t")},
}
`;
}

export default resCode;
