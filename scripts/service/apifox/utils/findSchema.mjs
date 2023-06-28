function findSchema(ref, schemas) {
  const result = {
    properties: {},
  };
  if (ref) {
    const id = ref.match(/\d+/)?.[0] + 1;
    const item = schemas.find((i) => i.id === id);
    if (item) {
      if (item.jsonSchema?.required?.length) {
        item.jsonSchema.required.forEach((i) => {
          item.jsonSchema.properties[i].required = true;
        });
      }
      result = {
        properties: item.jsonSchema?.properties || {},
      };
    }
  }
  return result;
}

export default findSchema;
