function buildFnGetOrPostCode(props) {
  const {
    url,
    fnName,
    requestBaseName,
    responseBaseName,
    method,
    apiName,
    headers,
    params,
    resProps,
  } = props;
  const remarkList = [];
  const isBase =
    resProps.oldType !== "array" &&
    resProps.type !== "any" &&
    resProps.type !== responseBaseName;
  const resName = isBase ? resProps.type : responseBaseName;
  params.forEach((i) => {
    remarkList.push(
      ` * @param {${requestBaseName}.${i.name}}${i.required ? "" : "?"}: ${
        i.type
      }; ${i.description === i.name ? "" : i.description}`
    );
  });
  const template = `
  /**
   * @description ${apiName} buildFnGetOrPostCode
   * @param params: {${requestBaseName}} 请求参数${
    remarkList.length ? `\n${remarkList.join("\n")}` : ""
  }
   * @method ${method.toUpperCase()} 请求方式
   * @return Promise<${resName}> 返回值
   */
  export const ${fnName} = async (params?: ${requestBaseName}) => {
  \treturn ${method}<${resName}>(${url}, {
  \t\tparams${headers ? `,\n\t\t${headers}` : ""}
  \t})
  }
  `;
  return {
    requestName: [requestBaseName],
    responseName: isBase ? [] : [resName],
    code: template.trim(),
  };
}

export default buildFnGetOrPostCode;
