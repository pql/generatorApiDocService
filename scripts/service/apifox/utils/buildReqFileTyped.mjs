function buildReqFileTyped(props) {
  const { url, name, apiName, fileProps } = props;
  const typeCode = [];

  if (fileProps.length === 0) {
    return {
      name: [],
      code: "",
    };
  }
  fileProps.forEach((i) => {
    typeCode.push(
      `${i.name}: string;${i.description ? ` // ${i.description}` : ""}`
    );
  });

  const template = `
  /**
   * @description ${apiName} buildReqFileTyped
   * @url ${url}
   */
  export interface ${name[0]}FormData extends FormData{
  \tappend: (name: ${fileProps
    .map((i) => `'${i.name}'`)
    .join(" | ")}, value: string | Blob, fileName?: string) => void;
  }
  `;
  return {
    name: [`${name[0]}FormData`],
    deleteName: name[0],
    code: template.trim(),
  };
}

export default buildReqFileTyped;
