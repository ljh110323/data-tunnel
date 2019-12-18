
export const data1 = { result: [] }

for(let i = 0; i < 1000; i++) {
  data1.result.push({
    data: "测试数据",
    prop: "测试属性"
  });
}