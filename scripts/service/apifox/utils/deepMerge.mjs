function deepMerge(oldRes, newRes, isFirst = false) {
  let baseType = ["string", "number", "boolean", "any", "any[]", "any[][]"];
  if (oldRes === null || oldRes === undefined || newRes === null) {
    return oldRes || newRes;
  } else if (typeof oldRes === "string") {
    if (baseType.includes(oldRes) && typeof oldRes === typeof newRes) {
      return oldRes;
    } else {
      if (JSON.stringify(oldRes) !== JSON.stringify(newRes)) {
        console.log(`整体结构变化: 由【${oldRes}】变成了【${newRes}】`);
      }
      return newRes;
    }
  } else {
    if (
      (Array.isArray(oldRes) && Array.isArray(newRes)) ||
      (!Array.isArray(oldRes) && !Array.isArray(newRes))
    ) {
      if (Array.isArray(newRes)) {
        //合并数组
        return [deepMerge(oldRes[0], newRes[0])];
      } else {
        let obj = {};
        if (isFirst) {
          if (Object.keys(newRes).length === 0) {
            return oldRes;
          }
        }
        // 合并对象
        for (let key in oldRes) {
          let oldV = oldRes[key];
          let newV = newRes[key];
          if (newV === undefined) {
            console.log(`删除了字段: ${key}:${oldV}`);
          } else {
            obj[key] = deepMerge(oldV, newV);
          }
        }
        for (let key in newRes) {
          let oldV = oldRes[key];
          let newV = newRes[key];
          if (oldV === undefined) {
            console.log(`新增了字段: ${key}:${newV}`);
            obj[key] = newV;
          } else {
            obj[key] = deepMerge(oldV, newV);
          }
        }
        return obj;
      }
    } else {
      if (!baseType.includes(newRes)) {
        if (JSON.stringify(oldRes) !== JSON.stringify(newRes)) {
          console.log(`整体结构变化: 由【${oldRes}】变成了【${newRes}】`);
        }
        return newRes;
      } else {
        return oldRes;
      }
    }
  }
}

export default deepMerge;
