function buildFnPathCode(props) {
  const {
    url,
    fnName,
    requestBaseName,
    responseBaseName,
    method,
    apiName,
    headers,
    pathList,
    query,
    params,
    resProps,
  } = props;
  const pathStrList = [];
  const remarkList = [];
  const isBase =
    resProps.oldType !== "array" &&
    resProps.type !== "any" &&
    resProps.type !== responseBaseName;
  const resName = isBase
    ? resProps.type
    : responseBaseName + `${resProps.oldType === "array" ? "Item" : ""}`;
  const resNameValue = resName + `${resProps.oldType === "array" ? "[]" : ""}`;

  pathList.forEach((i) => {
    pathStrList.push(`${i.name}${i.required ? "" : "?"}: ${i.type}`);
    remarkList.push(
      ` * @path ${i.name}${i.required ? "" : "?"}: ${i.type}; ${
        i.description === i.name ? "" : i.description
      }`
    );
  });

  query.forEach((i) => {
    remarkList.push(
      ` * @query ${i.name}${i.required ? "" : "?"}: ${i.type}; ${
        i.description === i.name ? "" : i.description
      }`
    );
  });

  params.forEach((i) => {
    remarkList.push(
      ` * @param ${i.name}${i.required ? "" : "?"}: ${i.type}; ${
        i.description === i.name ? "" : i.description
      }`
    );
  });

  const template1 = `
  /**
    * @description ${apiName} buildFnPathCode${
    remarkList.length ? `\n${remarkList.join("\n")}` : ""
  }
    * @method ${method.toUpperCase()} 请求方式
    * @return Promise<${resNameValue}> 返回值
    */
    export const ${fnName} = async (${pathStrList.join(", ")}) => {
        \treturn ${
          method === "delete" ? "del" : method
        }<${resNameValue}>(${url}${headers ? `, {\n\t\t${headers}\n\t}` : ""})
    }
    `;

  const template2 = `
  /**
    * @description ${apiName} buildFnPathCode${
    remarkList.length ? `\n${remarkList.join("\n")}` : ""
  }
    * @method ${method.toUpperCase()} 请求方式
    * @return Promise<${resNameValue}> 返回值
    */
    export const ${fnName} = async ({ path, params }: ${requestBaseName}Group) => {
    \treturn ${
      method === "delete" ? "del" : method
    }<${resNameValue}>(${url.replace(/\$\{/g, "${path.")},{\n\t\tparams\n\t})
    }
    `;

  return {
    requestName:
      query.length === 0 && params.length === 0
        ? []
        : [`${requestBaseName}Group`],
    responseName: isBase ? [] : [resName],
    code:
      query.length === 0 && params.length === 0
        ? template1.trim()
        : template2.trim(),
  };
}

export default buildFnPathCode;
