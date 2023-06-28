function buildReqGetOrPostTyped(props) {
  const { url, name, apiName, params, path } = props;
  const typeCode = [];
  const pathCode = [];
  params.forEach((i) => {
    typeCode.push(
      `${i.name}${i.required ? "" : "?"}: ${
        typeof i.type === "string" ? i.type : "any"
      };${i.description ? ` // ${i.description}` : ""}`
    );
  });
  path.forEach((i) => {
    pathCode.push(
      `${i.name}${i.required ? "" : "?"}: ${
        typeof i.type === "string" ? i.type : "any"
      };${i.description ? ` // ${i.description}` : ""}`
    );
  });
  const hasGroup = path.length > 0 && params.length > 0;
  const nameList = [name];
  if (hasGroup) {
    nameList.push(name + "Group");
  }

  const template1 = `
  /**
   * @description ${apiName} buildReqGetOrPostTyped
   * @url ${url}
   */
  export interface ${name} {${
    typeCode.length ? `\n\t${typeCode.join("\n\t")}` : ""
  }
  }`;

  const template2 = `
  /**
   * @description ${apiName} buildReqGetOrPostTyped
   * @url ${url}
   */
    export interface ${name}Group {
        path: {\n\t\t${pathCode.join("\n\t\t")}\n\t};
        params: ${name};
    }
    `;

  let code = template1.trim();

  if (hasGroup) {
    code += template2.trim();
  }

  return {
    name: nameList,
    code,
  };
}

export default buildReqGetOrPostTyped;
