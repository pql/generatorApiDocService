import getValueByType from "./getValueByType.mjs";

function buildResArrayTyped(props) {
  const { url, name, apiName, params } = props;
  const typeCode = [];
  const valueCode = [];
  if (params.items.properties) {
    Object.keys(params.items.properties)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        const item = params.items.properties[key];
        typeCode.push(
          `${key}: ${item.type};${
            item.description ? ` // ${item.description}` : ""
          }`
        );
        valueCode.push(
          `${key}: ${getValueByType(item.type)},${
            item.description ? ` // ${item.description}` : ""
          }`
        );
      });
  }
  const template1 = `
  /**
   * @description ${apiName} buildResArrayTyped
   * @url ${url}
   */
  export type ${name}Item = {${
    typeCode.length ? `\n\t${typeCode.join("\n\t")}` : ""
  }
  }`;
  const template2 = `
  /**
   * @description ${apiName} buildResArrayTyped
   * @url ${url}
   */
  export const ${name}ItemValue = {${
    valueCode.length ? `\n\t${valueCode.join("\n\t")}` : ""
  }
  }`;
  return {
    name: [`${name}Item`],
    deleteName: name,
    code: template1.trim(),
    valueCode: template2.trim(),
  };
}

export default buildResArrayTyped;
