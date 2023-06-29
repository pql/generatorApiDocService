import getValueByType from "./getValueByType.mjs";
import upperFirstCase from "./upperFirstCase.mjs";

function buildResAnyTyped(props) {
  const { url, name, apiName, params } = props;
  const typeCode = [];
  const valueCode = [];
  const nameList = [name];
  const subCode = [];
  const subValueCode = [];

  if (params.items?.properties) {
    Object.keys(params.items.properties)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        let item = params.items.properties[key];
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
  } else {
    if (params.properties && Object.keys(params.properties).length) {
      Object.keys(params.properties)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
          let item = params.properties[key];
          if (item.type) {
            let dataTpl = item.type;
            if (Array.isArray(dataTpl)) {
              dataTpl = dataTpl[0];
              if (Array.isArray(dataTpl)) {
                dataTpl = "any[]";
              }
            }

            if (typeof dataTpl === "object") {
              let subName = name + upperFirstCase(key);
              let arrType = Array.isArray(item.type) ? "[]" : "";
              typeCode.push(
                `${key}: ${subName}${arrType};${
                  item.description ? ` // ${item.description}` : ""
                }`
              );
              valueCode.push(
                `${key}: ${getValueByType(subName + arrType)},${
                  item.description ? ` // ${item.description}` : ""
                }`
              );
              let subTypeCode = [];
              let subValueTypeCode = [];

              Object.keys(dataTpl)
                .sort((a, b) => a.localeCompare(b))
                .forEach((subKey) => {
                  let typeValue =
                    typeof dataTpl[subKey] === "string"
                      ? dataTpl[subKey]
                      : Array.isArray(dataTpl[subKey])
                      ? "any[]"
                      : "any";
                  subTypeCode.push(`${subKey}: ${typeValue};`);
                  subValueTypeCode.push(
                    `${subKey}: ${getValueByType(typeValue)},`
                  );
                });
              const template1 = `
                /**
                 * @description ${apiName}  buildResAnyTyped
                 * @url ${url}
                 */
                export type ${subName} = {${
                subTypeCode.length ? `\n\t${subTypeCode.join("\n\t")}` : ""
              }
                }`;
              nameList.push(subName);
              subCode.push(template1.trim());

              const template2 = `
              /**
               * @description ${apiName}  buildResAnyTyped
               * @url ${url}
               */
              export const ${subName}Value = {${
                subValueTypeCode.length
                  ? `\n\t${subValueTypeCode.join("\n\t")}`
                  : ""
              }
              }`;
              subValueCode.push(template2.trim());
            } else {
              typeCode.push(
                `${key}: ${dataTpl};${
                  item.description ? ` //${item.description}` : ""
                }`
              );
              valueCode.push(
                `${key}: ${getValueByType(dataTpl)},${
                  item.description ? ` //${item.description}` : ""
                }`
              );
            }
          }
        });
    }
  }

  const codeTemplate = `${subCode.join("\n")}
  /**
   * @description ${apiName} buildResAnyTyped
   * @url ${url}
   */
  export type ${name} = {${
    typeCode.length ? `\n\t${typeCode.join("\n\t")}` : ""
  }
  }`;

  const valueCodeTemplate = `${subValueCode.join("\n")}
  /**
   * @description ${apiName} buildResAnyTyped
   * @url ${url}
   */
  export const ${name}Value = {${
    valueCode.length ? `\n\t${valueCode.join("\n\t")}` : ""
  }
  }`;

  return {
    name: nameList,
    code: codeTemplate.trim(),
    valueCode: valueCodeTemplate.trim(),
  };
}

export default buildResAnyTyped;
