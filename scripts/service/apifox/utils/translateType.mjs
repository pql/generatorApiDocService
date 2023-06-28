export const typeTransform = {
  integer: "number",
  object: "any",
  array: "any[]",
};

function translateType(config, oldReqData, oldResData) {
  config = JSON.parse(JSON.stringify(config));
  config.request.params = config.request.params.map((sub) => {
    sub.type = typeTransform[sub.type] || sub.type;
    return sub;
  });
  config.request.path = config.request.path.map((sub) => {
    sub.type = typeTransform[sub.type] || sub.type;
    return sub;
  });
  config.request.query = config.request.query.map((sub) => {
    sub.type = typeTransform[sub.type] || sub.type;
    return sub;
  });
  config.request.params = config.request.params.map((item, index) => {
    config.request.params[index].oldType = item.type;
    delete config.request.params[index].format;
    delete item["x-tmp-pending-properties"];
    if (item.type === "array") {
      // 如果是数组类型，判断子项
      const newType = typeTransform[item.items?.type];
      if (newType) {
        config.request.params[index].type = newType;
      } else {
        config.request.params[index].type = item.items?.type;
      }
    } else {
      const type = typeTransform[item.type] || item.type;
      config.request.params[index].type = type;
    }
    return config.request.params[index];
  });

  if (oldReqData) {
    if (oldReqData.params?.length) {
      oldReqData.params.forEach((item) => {
        const has = config.request.params.find((i) => i.name === item.name);
        if (!has) {
          config.request.params.push(item);
        }
      });
    }
    if (oldReqData.query?.length) {
      oldReqData.query.forEach((item) => {
        const has = config.request.query.find((i) => i.name === item.name);
        if (!has) {
          config.request.query.push(item);
        }
      });
    }
    if (oldReqData.path?.length) {
      oldReqData.path.forEach((item) => {
        const has = config.request.path.find((i) => i.name === item.name);
        if (!has) {
          config.request.path.push(item);
        }
      });
    }
  }
  // 优先处理真实的返回值结构
  if (oldResData) {
    // 处理数组
    if (Array.isArray(oldResData)) {
      const properties = {};

      Object.keys(oldResData[0])
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
          const value = oldResData[0][key];
          const type =
            typeof value === "string"
              ? value
              : `any${Array.isArray(value) ? "[]" : ""}`;
          properties[key] = { type };
        });
      config.response = {
        type: `${config.responseBaseName}Item`,
        oldType: "array",
        items: {
          type: "object",
          properties,
        },
      };
    } else if (oldResData && typeof oldResData === "object") {
      // 处理对象
      const properties = {};

      Object.keys(oldResData)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
          const value = oldResData[key];
          properties[key] = { type: value };
        });
      config.response = {
        type: config.responseBaseName,
        oldType: "object",
        properties,
      };
    } else {
      // 处理基本类型
      config.response = {
        type: oldResData,
        oldType: oldResData,
      };
    }
  } else {
    const newRes = JSON.parse(JSON.stringify(config.response));
    newRes.oldType = newRes.type;
    if (newRes.type === "array") {
      const newType = typeTransform[newRes.items?.type];
      if (newType && newType !== "any") {
        // 基础数组类型
        newRes.type = newType;
      } else {
        // 自定义数组类型
        newRes.type = `${config.responseBaseName}Item`;
        const sub = newRes.items.properties;
        for (const key in sub) {
          const subItem = sub[key];
          delete sub[key].format;
          sub[key].oldType = subItem.type;
          if (subItem.type === "array") {
            sub[key].type = typeTransform[subItem.type] || subItem.type;
          } else {
            if (subItem.type) {
              sub[key].type = typeTransform[subItem.type] || subItem.type;
            } else {
              sub[key].type = "any";
            }
          }
        }
      }
    } else {
      const newType = typeTransform[newRes.type];
      if (newType && newType !== "any") {
        newRes.type = newType;
      } else {
        if (newRes.properties && Object.keys(newRes.properties).length) {
          newRes.type = config.responseBaseName;
          for (const key in newRes.properties) {
            const item = newRes.properties[key];
            if (item.$ref) {
              newRes.properties[key].type = "any";
            }
          }
        } else {
          newRes.type = "any";
        }
      }
    }
    config.response = newRes;
    for (const key in config.response.properties) {
      const item = config.response.properties[key];
      if (item.type) {
        config.response.properties[key].type =
          typeTransform[item.type] || item.type;
      }
    }
  }
  return config;
}

export default translateType;
