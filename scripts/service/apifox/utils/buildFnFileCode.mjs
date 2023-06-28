function buildFnFileCode(props) {
  const {
    url,
    fnName,
    requestBaseName,
    responseBaseName,
    method,
    apiName,
    headers,
    params,
  } = props;
  let remarkList = [];
  params.forEach((i) => {
    remarkList.push(
      ` * @param {${i.name}}${i.required ? "" : "?"}: ${i.type}; ${
        i.description === i.name ? "" : i.description
      }`
    );
  });

  const template = `
  /**
   * @description ${apiName} buildFnFileCode
   * @param params: {${requestBaseName}FormData} 请求参数${
    remarkList.length ? `\n${remarkList.join("\n")}` : ""
  }
   * @method ${method.toUpperCase()} 请求方式
   * @return Promise<${responseBaseName}> 返回值
   */
  export const ${fnName} = async (params?: ${requestBaseName}FormData) => {
  \treturn ${method}<${responseBaseName}>(${url}, {
  \t\tparams${headers ? `,\n\t\t${headers}` : ""}
  \t})
  }
  `;
  return {
    requestName: [requestBaseName + "FormData"],
    responseName: [responseBaseName],
    code: template.trim(),
  };
}

export default buildFnFileCode;
