function getValueByType(type) {
  if (type.includes("[]")) {
    return "[]";
  } else if (type.includes("string")) {
    return "''";
  } else if (type.includes("number")) {
    return "-1";
  } else if (type.includes("boolean")) {
    return "false";
  } else {
    return "undefined";
  }
}

export default getValueByType;
