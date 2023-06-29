import isStringType from "./isStringType.mjs";

function clearResponseData(data) {
  if (data === null) {
    return "number | string";
  } else if (Array.isArray(data)) {
    if (data.length === 0) {
      return "any[]";
    }
    let trueData = data.filter((i) => i !== null);
    if (trueData.length === 0 && data.length > 0) {
      trueData = [data[0]];
    }
    if (typeof trueData[0] === "object") {
      let valueMap = {};
      data.forEach((item) => {
        Object.keys(item)
          .sort((a, b) => a.localeCompare(b))
          .forEach((key) => {
            valueMap[key] =
              item[key] === null && isStringType(key)
                ? "string"
                : clearResponseData(item[key]);
          });
      });
      return [valueMap];
    } else if (Array.isArray(trueData[0])) {
      return "any[][]";
    } else {
      return typeof trueData[0] + "[]";
    }
  } else if (typeof data === "object") {
    let valueMap = {};
    Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        valueMap[key] =
          data[key] === null && isStringType(key)
            ? "string"
            : clearResponseData(data[key]);
      });
    return valueMap;
  } else {
    return typeof data;
  }
}

export default clearResponseData;
