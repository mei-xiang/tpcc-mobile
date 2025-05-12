import {
  rem2px,
  px2rem,
  addKW,
  numThousand,
  numParse,
  isPCBrowser,
  formatMilliseconds,
} from "@/common/utils/comm";

// 根据分割长度，返回整数
const _integerOperate = (num, splitNumber = 5) => {
  if (num === 0) return num;
  num = Math.ceil(num);
  const parse = function (num) {
    let resNum = num / splitNumber;
    if (Number.isInteger(resNum)) {
      return num;
    } else {
      return parse(num + 1);
    }
  };
  num = parse(num);
  return num;
};

// 获取一个随机颜色，该颜色不在排除列表中
export const getRandomColorExcluding = (excludedColors) => {
  function getRandomHexColor() {
    // 生成一个随机的十六进制颜色值
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  let randomColor;
  do {
    randomColor = getRandomHexColor();
  } while (excludedColors.includes(randomColor));

  return randomColor;
};

// 图表颜色盘
export const getColorList = () => {
  // #D8D2D2, // 其他--灰色
  // #526AE7 // 汇总--蓝色
  let colorList = [
    "#5BD0C8",
    "#A5D63F",
    "#F79D89",
    "#CCB7FC",
    "#FF83E6",
    "#F5993D",
    "#2A82E4",

    "#6080AB",
    "#C48C66",
    "#80A6FF",
    "#F5983B",
    "#9DABAA",
    "#9AA9F5",
    "#3A8BB6",
    "#63B551",
    "#74A6F2",
    "#F36551",
    "#C5AA51",
    "#46288B",
    "#E4A7F8",
    "#2C83D7",
    "#FF8A38",
    "#A9B987",
    "#9C8C73",
    "#98BCBA",
  ];

  return colorList;
};

const getMapColor = (colorMap = {}, nameList = []) => {
  let colorList = [];
  for (let i = 0; i < nameList.length; i++) {
    colorList.push(colorMap[nameList[i]] || colorList[0]);
  }
  return colorList;
};

// 将color对象转换成background: linear-gradient(180deg, rgba(157, 227, 222, 1) 0%, rgba(51, 176, 168, 1) 100%)
const getGradColor = function (color) {
  if (Object.prototype.toString.call(color) === "[object String]") {
    return color;
  } else if (Object.prototype.toString.call(color) === "[object Object]") {
    let colorStops = color.colorStops;
    let gradient = "linear-gradient(180deg";
    colorStops.forEach((item) => {
      gradient += `, ${item.color} ${item.offset}%`;
    });
    return gradient;
  }
};

/** -----------------------用户分析----------------------- */
export const active_user_pie = ({ seriesData = [], colorMap = {} } = {}) => {
  console.log("seriesData饼图", seriesData);
  console.log("colorMap", colorMap);
  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(
    colorMap,
    seriesData.map((_) => _.name)
  );
  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(0)),
      top: rem2px(px2rem(0)),
      bottom: rem2px(px2rem(0)),
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      className: "tooltip-box",
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
        let percent =
          params.data && params.data.percent
            ? parseFloat((params.data.percent - 0).toFixed(2)) + "%"
            : "0%";
        let tpl = "";
        if (params.name === "其他角色" || params.name === "其他组织") {
          tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params.color
            }'></span>
            <span class='server-name'>${params.name}：</span>
            <span>${numThousand(value)}人</span>
          </div>`;
        } else {
          tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params.color
            }'></span>
            <span class='server-name'>${params.name}：</span>
            <span>${numThousand(value)}人</span>
            <span>(${percent})</span>
          </div>`;
        }
        return tpl;
      },
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["30%", "60%"],
        avoidLabelOverlap: true,
        top: rem2px(px2rem(0)),
        bottom: rem2px(px2rem(10)),
        emphasis: {
          disabled: isPCBrowser() ? false : true, // 是否关闭高亮扇区状态（鼠标移入会自动触发）
        },
        selectedMode: "multiple",
        select: {
          label: {
            color: "#688ff4",
            // fontWeight: 'bold'
          },
        },
        itemStyle: {
          borderRadius: rem2px(px2rem(0)),
          borderColor: "#fff",
          borderWidth: rem2px(px2rem(2)),
        },
        label: {
          color: "#1D252F",
          fontSize: isPCBrowser() ? rem2px(px2rem(10)) : rem2px(px2rem(10)),
          lineHeight: isPCBrowser() ? rem2px(px2rem(12)) : rem2px(px2rem(12)),
          formatter(params) {
            let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
            let percent =
              params.data && params.data.percent
                ? parseFloat((params.data.percent - 0).toFixed(2))
                : 0;
            if (params.name === "其他角色" || params.name === "其他组织") {
              return `${params.name}${isPCBrowser() ? ": " : "\n"}${numThousand(
                value
              )}人`;
            } else {
              return `${params.name}${isPCBrowser() ? ": " : "\n"}${numThousand(
                value
              )}人(${percent}%)`;
            }
          },
        },
        labelLine: {
          show: true,
        },
        data: seriesData,
      },
    ],
  };
};

export const visit_num_time_bar = ({
  xAxisData = [],
  seriesData = [],
  cardId = "",
  colorMap = {},
} = {}) => {
  console.log("seriesData柱状图", seriesData);
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 1 : (max - 0) / 5;

  let yUnitName = "";
  let yPadding = [0, 0, 0, 0];
  let seriesName = "";
  if (cardId === "aveVisitsNumberUba") {
    yUnitName = "单位：次";
    yPadding = [0, 0, rem2px(px2rem(10)), rem2px(px2rem(max > 10 ? 0 : 20))];
    seriesName = "人均页面浏览量";
  } else {
    yUnitName = "单位：秒";
    yPadding = [0, 0, rem2px(px2rem(10)), rem2px(px2rem(max > 10 ? 0 : 20))];
    seriesName = "人均浏览时长";
  }

  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(colorMap, xAxisData);
  let maxObj = {
    value: Math.max(...seriesData),
    index: seriesData.findIndex((_) => _ === Math.max(...seriesData)),
  };
  console.log("maxObj", maxObj);
  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(5)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      // triggerEvent: true,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: true, // 是否显示x轴线
        lineStyle: {
          color: "#E5E5E5",
        },
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        interval: 0, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        color: "#73757E",
        formatter(value) {
          return "";
          // let strLable = "";
          // if (value.length > 7) {
          //   strLable = value.slice(0, 7).split("").join("\n") + "\n" + "...";
          // } else {
          //   strLable = value.split("").join("\n");
          // }
          // return strLable;
        },
      },
    },
    yAxis: {
      type: "value",
      // name: yUnitName,
      // nameTextStyle: {
      //   fontSize: rem2px(px2rem(10)),
      //   padding: yPadding,
      // },
      // nameGap: rem2px(px2rem(5)),
      axisLine: {
        show: false, // 是否显示Y轴线
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          if (cardId === "aveVisitsTimeUba") {
            const hours = Math.floor(Math.floor(max / 1000) / 3600);
            return formatMilliseconds(num, hours > 0);
          } else {
            return addKW(num, 1, max);
          }
        },
      },
      min: 0,
      max,
      interval,
    },
    series: [
      {
        data: Array.from({ length: seriesData.length }, (item, idx) => {
          return {
            name: xAxisData[idx],
            value: 0,
          };
        }),
        type: "bar",
        name: "名称",
        barWidth: rem2px(px2rem(16)),
        barGap: 0,
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          distance: 0, // 距离图形元素的距离
          // color: "#73757E",
          position: "top",
          lineHeight: rem2px(px2rem(12)),
          fontSize: rem2px(px2rem(10)),
          rich: {
            a: {
              color: "#688ff4",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          },
          formatter(params) {
            let value = params.data.name;
            let strLable = "";
            if (value.length > 11) {
              strLable = value.slice(0, 11).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            return `{b|${strLable}}`;
          },
        },
      },
      {
        data: seriesData,
        type: "bar",
        name: seriesName,
        barWidth: rem2px(px2rem(16)),
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            // 人均浏览时长
            if (cardId === "aveVisitsTimeUba") {
              if (maxObj.index === params.dataIndex && params.value > 0) {
                const hours = Math.floor(Math.floor(max / 1000) / 3600);
                return formatMilliseconds(params.value, hours > 0);
              }
            } else {
              // 人均页面浏览量
              return params.value > 0
                ? numThousand(parseFloat(params.value.toFixed(2)))
                : "";
            }
            return "";
          },
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],
          color: (param) => {
            return colorList[param.dataIndex];
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        // console.log("tooltip-params", params);
        let paramsObj = params.filter((_) => _.seriesName === seriesName);
        let paramsData = paramsObj.length > 0 ? paramsObj[0] : {};
        let tpl = "";
        if (cardId === "aveVisitsTimeUba") {
          const hours = Math.floor(Math.floor(max / 1000) / 3600);
          let num = formatMilliseconds(paramsData.value, hours > 0);
          tpl += `
          <div class='server-name'>${paramsData.name}</div>
          <div>
            <span class='circle-tool' style='background-color:${paramsData.color}'></span>
            <span>${paramsData.seriesName}：</span>
            <span>${num}</span>
          </div>
          `;
          return tpl;
        } else {
          const value = parseFloat(paramsData.value.toFixed(2));
          tpl += `
          <div class='server-name'>${paramsData.name}</div>
          <div>
            <span class='circle-tool' style='background-color:${
              paramsData.color
            }'></span>
            <span>${paramsData.seriesName}：</span>
            <span>${numThousand(value)}</span>
          </div>
          `;
          return tpl;
        }
      },
    },
  };
};

export const user_sunmary_line = ({
  xAxisData = [],
  seriesData = [],
  cardId = "",
  colorMap = {},
} = {}) => {
  console.log("seriesData折线图", seriesData);
  let mergeData = seriesData.reduce((pre, cur, idx) => {
    return pre.concat(cur.data || []);
  }, []);

  let yUnitName =
    cardId === "dailyActiveUserCount" || cardId === "monthlyActiveUserCount"
      ? "单位：人"
      : cardId === "aveVisitsNumberUba"
      ? "单位：次"
      : "单位：秒";
  // let colorList = getColorList();
  let colorList = getMapColor(
    colorMap,
    seriesData.map((_) => _.name)
  );

  let max = _integerOperate(Math.max(...mergeData, 5), 5);
  let interval = mergeData.length === 0 ? 1 : (max - 0) / 5;
  let series = [];
  seriesData.forEach((item) => {
    series.push({
      type: "line",
      smooth: true,
      showSymbol: true,
      itemStyle: {},
      symbolSize(value, params) {
        if (params.dataIndex % 4 !== 0) return [0, 0];
        return [rem2px(px2rem(4)), rem2px(px2rem(4))];
      },
      symbol: "emptyCircle", // 标记类型 emptyCircle circle none
      data: item.data,
      name: item.name,
    });
  });

  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(15)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisTick: {
        show: false, // 是否显示坐标轴刻度
        alignWithLabel: false,
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: false, // 是否显示x轴线
      },
      axisLabel: {
        interval: 3, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        // showMinLabel: false,
        // showMaxLabel: true,
        // rotate: 30,
        formatter: function (value, index) {
          // 0 4 8 12 14 16 20 24 28
          if (index % 4 !== 0) {
            return "";
          }
          let date = new Date(value);
          let MM = (date.getMonth() + 1).toString().padStart(2, 0);
          let dd = date.getDate().toString().padStart(2, 0);
          return `${MM}/${dd}`;
        },
      },
    },
    yAxis: {
      type: "value",
      // name: yUnitName,
      // nameTextStyle: {
      //   fontSize: rem2px(px2rem(10)),
      //   padding: [0, 0, rem2px(px2rem(7)), rem2px(px2rem(max > 10 ? 0 : 20))],
      // },
      // nameGap: rem2px(px2rem(5)),
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          if (cardId === "aveVisitsTimeUba") {
            const hours = Math.floor(Math.floor(max / 1000) / 3600);
            return formatMilliseconds(num, hours > 0);
          } else {
            return addKW(num, 1, max);
          }
        },
      },
      min: 0,
      max,
      interval,
    },
    series,
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        // console.log("tooltip-params", params);
        let tpl = "";
        if (cardId === "aveVisitsTimeUba") {
          tpl += `<div>${params[0].name}</div>`;
          for (let index = 0; index < params.length; index++) {
            const el = params[index];
            const hours = Math.floor(Math.floor(max / 1000) / 3600);
            let num = formatMilliseconds(el.value, hours > 0);
            tpl += `<div class='server-box'>
              <span class='circle-tool' style='background-color:${el.color}'></span>
              <span class='server-name'>${el.seriesName}：</span>
              <span>${num}</span>
            </div>
            `;
          }
          return tpl;
        } else {
          tpl += `<div>${params[0].name}</div>`;
          for (let index = 0; index < params.length; index++) {
            const el = params[index];
            const value = parseFloat(el.value.toFixed(2));
            tpl += `<div class='server-box'>
              <span class='circle-tool' style='background-color:${
                el.color
              }'></span>
              <span class='server-name'>${el.seriesName}：</span>
              <span>${numThousand(value)}</span>
            </div>
            `;
          }
          return tpl;
        }
      },
    },
  };
};

/** -----------------------系统分析----------------------- */
// 按系统--访问分布
export const sys_visits_distribute = ({
  xAxisData = [],
  seriesData = [],
  topData = [],
} = {}) => {
  console.log("系统seriesData柱状图", seriesData);
  console.log("topData", topData);
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 1 : (max - 0) / 5;
  xAxisData =
    xAxisData.length === 0
      ? Array.from({ length: 24 }, (_, _idx) => _idx)
      : xAxisData;

  return {
    grid: {
      left: "0%",
      right: "0%",
      top: rem2px(px2rem(20)),
      bottom: 0,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: false, // 是否显示x轴线
      },
      axisLabel: {
        interval: 3, //强制显示所有刻度
        color: "#73757E",
        fontSize: rem2px(px2rem(10)),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          return addKW(num, 1, max);
        },
      },
      min: 0,
      max,
      interval,
    },
    series: [
      {
        data: seriesData,
        type: "bar",
        name: "访问量",
        label: {
          show: true,
          color: "#656565",
          position: "top",
          formatter(params) {
            let val = "";
            // 找到前两个元素
            let curObj = topData.find(
              (_) => _.value === params.data && _.index === params.dataIndex
            );
            // 相邻的话只显示最大的一个
            if (
              topData[0] &&
              topData[1] &&
              Math.abs(topData[1].index - topData[0].index) === 1 &&
              curObj &&
              !curObj.top1
            ) {
              return "";
            }
            if (curObj && curObj.value > 0) {
              val = addKW(curObj.value, 1, max, false);
            }
            return val;
          },
          fontSize: rem2px(px2rem(10)),
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],
          color: (param) => {
            if (!param.data) return param.color;
            let curObj = topData.find(
              (_) => _.value === param.data && _.index === param.dataIndex
            );
            if (curObj) {
              // 最大值颜色
              return {
                type: "linear",
                x: 1, // 右
                y: 0, // 下
                x2: 0, // 左
                y2: 1, // 上
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(242, 98, 78, 1)", // 100% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(242, 98, 78, 0.36)", // 0% 处的颜色
                  },
                ], // 柱子颜色
              };
            }
            return "#688ff4";
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "sys-tooltip",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        // console.log(params);
        let dataIndex = params[0].dataIndex;
        let tpl = "";
        let labelStr = `${dataIndex.toString().padStart(2, 0)}:00~${(
          dataIndex + 1
        )
          .toString()
          .padStart(2, 0)}:00`;
        tpl += `<div class="tooltip-sys-box">`;
        tpl += `<div class="tooltip-sys-total">总数：${numThousand(
          params[0].data
        )}</div>`;
        tpl += `<div class="tooltip-sys-txt">时段：${labelStr}</div>`;

        tpl += `</div>`;
        return tpl;
      },
    },
  };
};
// 按菜单、按组织、按角色--访问量
export const type_visits_distribute = ({
  xAxisData = [],
  seriesData = [],
  tagType = "1",
} = {}) => {
  let seriesName = "";
  let seriesName1 = "";
  if (tagType === "1") {
    seriesName = "菜单浏览量";
    seriesName1 = "菜单名称";
  } else if (tagType === "2") {
    seriesName = "组织浏览量";
    seriesName1 = "组织名称";
  } else if (tagType === "3") {
    seriesName = "角色浏览量";
    seriesName1 = "角色名称";
  }
  console.log(seriesName + "seriesData柱状图", seriesData);
  let flatData = seriesData.map((_) => _.value - 0);
  let series1 = seriesData.map((_) => {
    return {
      id: _.id,
      name: _.name,
      value: 0,
    };
  });
  let max = _integerOperate(Math.max(...flatData, 5), 5);
  let interval = flatData.length === 0 ? 1 : (max - 0) / 5;
  let maxObj = {
    value: Math.max(...flatData),
    index: flatData.findIndex((_) => _ === Math.max(...flatData)),
  };
  console.log("maxObj", maxObj);
  return {
    color: ["#688ff4"],
    grid: {
      left: "0%",
      right: rem2px(px2rem(5)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      // triggerEvent: true,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: true, // 是否显示x轴线
        lineStyle: {
          color: "#E5E5E5",
        },
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        interval: 0, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        color: "#73757E",
        formatter(value) {
          return "";
        },
      },
    },
    yAxis: {
      type: "value",
      // name: "单位：次",
      nameTextStyle: {
        fontSize: rem2px(px2rem(10)),
        // padding: [0, 0, rem2px(px2rem(10)), rem2px(px2rem(max > 10 ? 0 : 20))],
      },
      // nameGap: rem2px(px2rem(5)),
      axisLine: {
        show: false, // 是否显示Y轴线
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          return addKW(num, 1, max);
        },
      },
      min: 0,
      max,
      interval,
    },
    series: [
      {
        data: series1,
        type: "bar",
        name: seriesName1,
        barWidth: rem2px(px2rem(16)),
        barGap: 0,
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          distance: 0, // 距离图形元素的距离
          // color: "#73757E",
          position: "top",
          lineHeight: rem2px(px2rem(12)),
          fontSize: rem2px(px2rem(10)),
          rich: {
            a: {
              color: "#688ff4",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          },
          formatter(params) {
            let value = params.data.name;
            let strLable = "";
            if (value.length > 9) {
              strLable = value.slice(0, 9).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            return `{b|${strLable}}`;
          },
        },
      },
      {
        data: seriesData,
        type: "bar",
        name: seriesName,
        barWidth: rem2px(px2rem(16)),
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            let val = "";
            if (params.dataIndex === maxObj.index) {
              return addKW(params.value, 1, max, false);
            }
            return val;
          },
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],

          color: (param) => {
            if (!param.data) return param.color;
            // if (param.dataIndex === maxObj.index) {
            //   // 最大值颜色
            //   return {
            //     type: "linear",
            //     x: 1, // 右
            //     y: 0, // 下
            //     x2: 0, // 左
            //     y2: 1, // 上
            //     colorStops: [
            //       {
            //         offset: 0,
            //         color: "rgba(242, 98, 78, 1)", // 100% 处的颜色
            //       },
            //       {
            //         offset: 1,
            //         color: "rgba(242, 98, 78, 0.36)", // 0% 处的颜色
            //       },
            //     ], // 柱子颜色
            //   };
            // }
            return "#688ff4";
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        // console.log("tooltip-params", params);
        let paramsObj = params.filter((_) => _.seriesName === seriesName);
        let paramsData = paramsObj.length > 0 ? paramsObj[0] : {};
        let tpl = "";
        let value = parseFloat(paramsData.value.toFixed(2));
        tpl += `
          <div class='server-name'>${paramsData.name}</div>
          <div>
            <span class='circle-tool' style='background:${getGradColor(
              paramsData.color
            )}'></span>
            <span>${paramsData.seriesName}：</span>
            <span>${numThousand(value)}</span>
          </div>
          `;
        return tpl;
      },
    },
  };
};
// 首屏平均加载时间分布
export const fscreen_load_pie = ({ seriesData = [] } = {}) => {
  console.log("seriesData饼图", seriesData);
  return {
    color: ["#688ff4", "#BED984"],
    grid: {
      left: "0%",
      right: rem2px(px2rem(0)),
      top: rem2px(px2rem(0)),
      bottom: rem2px(px2rem(0)),
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      className: "tooltip-box",
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
        let tpl = "";
        tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params.color
            }'></span>
            <span class='server-name'>${params.name}：</span>
            <span>${numThousand(value)}秒</span>
            <span>(${params.percent}%)</span>
          </div>`;
        return tpl;
      },
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: isPCBrowser() ? ["30%", "60%"] : ["22%", "52%"],
        avoidLabelOverlap: false,
        top: rem2px(px2rem(0)),
        bottom: rem2px(px2rem(0)),
        emphasis: {
          disabled: isPCBrowser() ? false : true, // 是否关闭高亮扇区状态（鼠标移入会自动触发）
        },
        // selectedMode: "multiple",
        select: {
          label: {
            color: "#688ff4",
            // fontWeight: 'bold'
          },
        },
        itemStyle: {
          borderRadius: rem2px(px2rem(0)),
          borderColor: "#fff",
          borderWidth: rem2px(px2rem(2)),
        },
        label: {
          color: "#1D252F",
          fontSize: rem2px(px2rem(10)),
          lineHeight: rem2px(px2rem(12)),
          formatter(params) {
            let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
            if (isPCBrowser()) {
              return `${params.name}(${numThousand(value)}秒)`;
            } else {
              return `${params.name}\n(${numThousand(value)}秒)`;
            }
          },
        },

        labelLine: {
          show: true, // 显示引导线
          length: rem2px(px2rem(5)), // 引导线长度
          length2: rem2px(px2rem(10)), // 引导线第二段长度
          smooth: true, // 是否平滑
        },
        data: seriesData,
      },
    ],
  };
};
// 各功能平均响应时间
export const sys_menu_res_time = ({ xAxisData = [], seriesData = [] } = {}) => {
  console.log("各功能平均响应时间" + "seriesData柱状图", seriesData);
  let flatData = seriesData.map((_) => _.value - 0);
  let series1 = seriesData.map((_) => {
    return {
      id: _.id,
      name: _.name,
      value: 0,
    };
  });
  let seriesName = "平均响应时间";
  let max = _integerOperate(Math.max(...flatData, 5), 5);
  let interval = flatData.length === 0 ? 1 : (max - 0) / 5;
  let maxObj = {
    value: Math.max(...flatData),
    index: flatData.findIndex((_) => _ === Math.max(...flatData)),
  };
  console.log("maxObj", maxObj);
  return {
    color: ["#688ff4"],
    grid: {
      left: "0%",
      right: rem2px(px2rem(5)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      // triggerEvent: true,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: true, // 是否显示x轴线
        lineStyle: {
          color: "#E5E5E5",
        },
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        interval: 0, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        color: "#73757E",
        formatter(value) {
          return "";
        },
      },
    },
    yAxis: {
      type: "value",
      // name: "单位：次",
      nameTextStyle: {
        fontSize: rem2px(px2rem(10)),
        // padding: [0, 0, rem2px(px2rem(10)), rem2px(px2rem(max > 10 ? 0 : 20))],
      },
      // nameGap: rem2px(px2rem(5)),
      axisLine: {
        show: false, // 是否显示Y轴线
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          return addKW(num, 1, max);
        },
      },
      min: 0,
      max,
      interval,
    },
    series: [
      {
        data: series1,
        type: "bar",
        name: "菜单名称",
        barWidth: rem2px(px2rem(16)),
        barGap: 0,
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          distance: 0, // 距离图形元素的距离
          // color: "#73757E",
          position: "top",
          lineHeight: rem2px(px2rem(12)),
          fontSize: rem2px(px2rem(10)),
          rich: {
            a: {
              color: "#688ff4",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          },
          formatter(params) {
            let value = params.data.name;
            let strLable = "";
            if (value.length > 9) {
              strLable = value.slice(0, 9).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            return `{b|${strLable}}`;
          },
        },
      },
      {
        data: seriesData,
        type: "bar",
        name: seriesName,
        barWidth: rem2px(px2rem(16)),
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            let val = "";
            if (params.dataIndex === maxObj.index) {
              val = addKW(params.value, 1, max, false) || "";
            }
            return val;
          },
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],

          color: (param) => {
            if (!param.data) return param.color;
            // if (param.dataIndex === maxObj.index) {
            //   // 最大值颜色
            //   return {
            //     type: "linear",
            //     x: 1, // 右
            //     y: 0, // 下
            //     x2: 0, // 左
            //     y2: 1, // 上
            //     colorStops: [
            //       {
            //         offset: 0,
            //         color: "rgba(242, 98, 78, 1)", // 100% 处的颜色
            //       },
            //       {
            //         offset: 1,
            //         color: "rgba(242, 98, 78, 0.36)", // 0% 处的颜色
            //       },
            //     ], // 柱子颜色
            //   };
            // }
            return "#688ff4";
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let paramsObj = params.filter((_) => _.seriesName === seriesName);
        let paramsData = paramsObj.length > 0 ? paramsObj[0] : {};
        let tpl = "";
        let value = parseFloat(paramsData.value.toFixed(2));
        let maxTime = paramsData?.data.maxTime || 0;
        tpl += `
          <div class='server-name'>${paramsData.name}</div>
          <div>
            <span class='circle-tool' style='background:${getGradColor(
              paramsData.color
            )}'></span>
            <span>${paramsData.seriesName}：</span>
            <span>${numThousand(value)}</span>
          </div>

          <div>
            <span class='circle-tool' style='background:${getGradColor(
              paramsData.color
            )}'></span>
            <span>${"最长响应时间"}：</span>
            <span>${numThousand(maxTime)}</span>
          </div>
          `;
        return tpl;
      },
    },
  };
};

/** -----------------------业务分析----------------------- */
// 总设备数分布饼图
export const device_count_pie = ({ seriesData = [], colorMap = {} } = {}) => {
  console.log("seriesData饼图", seriesData);
  console.log("colorMap", colorMap);
  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(
    colorMap,
    seriesData.map((_) => _.name)
  );
  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(0)),
      top: rem2px(px2rem(0)),
      bottom: rem2px(px2rem(0)),
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      className: "tooltip-box",
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
        // let valueRate =
        //   params.data && params.data.valueRate
        //     ? parseFloat((params.data.valueRate - 0).toFixed(2)) + "%"
        //     : "0%";
        let tpl = "";
        tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params.color
            }'></span>
            <span class='server-name'>${params.name}：</span>
            <span>${numThousand(value)}个</span>
            <span>(${params.percent}%)</span>
          </div>`;
        return tpl;
      },
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["30%", "60%"],
        avoidLabelOverlap: true,
        top: rem2px(px2rem(0)),
        bottom: rem2px(px2rem(10)),
        emphasis: {
          disabled: isPCBrowser() ? false : true, // 是否关闭高亮扇区状态（鼠标移入会自动触发）
        },
        selectedMode: "multiple",
        select: {
          label: {
            color: "#688ff4",
            // fontWeight: 'bold'
          },
        },
        itemStyle: {
          borderRadius: rem2px(px2rem(0)),
          borderColor: "#fff",
          borderWidth: rem2px(px2rem(2)),
        },
        label: {
          color: "#1D252F",
          fontSize: isPCBrowser() ? rem2px(px2rem(10)) : rem2px(px2rem(10)),
          lineHeight: isPCBrowser() ? rem2px(px2rem(12)) : rem2px(px2rem(12)),
          formatter(params) {
            let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
            // let valueRate =
            //   params.data && params.data.valueRate
            //     ? parseFloat((params.data.valueRate - 0).toFixed(2))
            //     : 0;

            return `${params.name}${isPCBrowser() ? ": " : "\n"}${numThousand(
              value
            )}个(${params.percent}%)`;
          },
        },
        labelLine: {
          show: true,
        },
        data: seriesData,
      },
    ],
  };
};

// 设备在线率柱状图
export const device_online_rate_bar = ({
  xAxisData = [],
  seriesData = [],
  seriesData2 = [],
  colorMap = {},
} = {}) => {
  console.log("seriesData柱状图", seriesData);
  let flatData = seriesData.map((_) => _.value - 0);
  let flatData2 = seriesData2.map((_) => _.value - 0);
  let max = _integerOperate(Math.max(...flatData, 5), 5);
  let max2 = _integerOperate(Math.max(...flatData2, 5), 5);
  let interval = flatData.length === 0 ? 1 : (max - 0) / 5;
  let interval2 = flatData2.length === 0 ? 1 : (max2 - 0) / 5;

  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(colorMap, xAxisData);
  let maxObj = {
    value: Math.max(...flatData),
    index: flatData.findIndex((_) => _ === Math.max(...flatData)),
  };
  console.log("maxObj", maxObj);
  return {
    color: colorList,
    grid: {
      left: rem2px(px2rem(1)),
      right: rem2px(px2rem(1)),
      top: rem2px(px2rem(12)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      // triggerEvent: true,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: true, // 是否显示x轴线
        lineStyle: {
          color: "#E5E5E5",
        },
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        interval: 0, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        color: "#73757E",
        formatter(value) {
          return "";
          // let strLable = "";
          // if (value.length > 7) {
          //   strLable = value.slice(0, 7).split("").join("\n") + "\n" + "...";
          // } else {
          //   strLable = value.split("").join("\n");
          // }
          // return strLable;
        },
      },
    },
    yAxis: [
      {
        type: "value",
        // name: "设备数",
        // nameTextStyle: {
        //   fontSize: rem2px(px2rem(10)),
        //   padding: [
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(max > 10 ? 0 : 20)),
        //   ],
        // },
        // nameGap: rem2px(px2rem(10)),
        axisLine: {
          show: false, // 是否显示Y轴线
        },
        splitLine: {
          show: false, // 是否显示分隔线
        },
        axisLabel: {
          fontSize: rem2px(px2rem(10)),
          formatter: (num) => {
            return addKW(num, 1, max);
          },
        },
        min: 0,
        max,
        interval,
      },
      {
        type: "value",
        // name: "在线率",
        // nameTextStyle: {
        //   fontSize: rem2px(px2rem(10)),
        //   padding: [
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(0)),
        //     rem2px(px2rem(max > 10 ? 0 : 20)),
        //   ],
        // },
        // nameGap: rem2px(px2rem(10)),
        min: 0,
        max: max2,
        interval: interval2,
        axisLabel: {
          fontSize: rem2px(px2rem(10)),
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        data: Array.from({ length: seriesData.length }, (item, idx) => {
          return {
            name: xAxisData[idx],
            value: 0,
          };
        }),
        type: "bar",
        name: "名称",
        barWidth: isPCBrowser() ? rem2px(px2rem(16)) : rem2px(px2rem(14)),
        barGap: 0,
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          distance: 0, // 距离图形元素的距离
          // color: "#73757E",
          position: "top",
          lineHeight: rem2px(px2rem(12)),
          fontSize: rem2px(px2rem(10)),
          rich: {
            a: {
              color: "#688ff4",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          },
          formatter(params) {
            let value = params.data.name;
            let strLable = "";
            if (value.length > 11) {
              strLable = value.slice(0, 11).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            return `{b|${strLable}}`;
          },
        },
      },
      {
        data: seriesData,
        type: "bar",
        name: "设备数",
        barWidth: isPCBrowser() ? rem2px(px2rem(16)) : rem2px(px2rem(12)),
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            // return params.value > 0
            //   ? numThousand(parseFloat(params.value.toFixed(2)))
            //   : "";
            return "";
          },
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],
          color: (param) => {
            return colorList[param.dataIndex];
          },
        },
      },
      {
        name: "在线率",
        type: "line",
        color: "#FFC300",
        yAxisIndex: 1,
        smooth: true,
        showSymbol: true,
        itemStyle: {},
        symbolSize(value, params) {
          return [rem2px(px2rem(4)), rem2px(px2rem(4))];
        },
        symbol: "emptyCircle", // 标记类型 emptyCircle circle none
        data: seriesData2,
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let tpl = "";
        tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params[1].color
            }'></span>
            <span class='server-name'>${params[1].name}设备数：</span>
            <span>${numThousand(params[1].value)}个</span>
          </div>
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${
              params[2].color
            }'></span>
            <span class='server-name'>${params[2].seriesName}：</span>
            <span>${numThousand(params[2].value)}%</span>
          </div>
          <div class='line-box'></div>
          <div class='server-box'>
            <span>在线设备数：</span>
            <span>${numThousand(params[1]?.data?.deviceOnline || 0)}个</span>
          </div>
          <div class='server-box'>
            <span>离线设备数：</span>
            <span>${numThousand(params[1]?.data?.deviceOffline || 0)}个</span>
          </div>
          <div class='server-box'>
            <span>禁用设备数：</span>
            <span>${numThousand(params[1]?.data?.deviceDisable || 0)}个</span>
          </div>
          `;
        return tpl;
      },
    },
  };
};

// 平均离线次数柱状图
export const device_avg_offline_bar = ({
  xAxisData = [],
  seriesData = [],
  colorMap = {},
} = {}) => {
  console.log("seriesData柱状图", seriesData);
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 1 : (max - 0) / 5;

  let yUnitName = "";
  let yPadding = [0, 0, 0, 0];
  let seriesName = "";
  yUnitName = "单位：次";
  yPadding = [0, 0, rem2px(px2rem(10)), rem2px(px2rem(max > 10 ? 0 : 20))];
  seriesName = "离线次数";

  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(colorMap, xAxisData);
  let maxObj = {
    value: Math.max(...seriesData),
    index: seriesData.findIndex((_) => _ === Math.max(...seriesData)),
  };
  console.log("maxObj", maxObj);
  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(5)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      // triggerEvent: true,
      axisTick: {
        show: true, // 是否显示坐标轴刻度
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: true, // 是否显示x轴线
        lineStyle: {
          color: "#E5E5E5",
        },
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        interval: 0, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        color: "#73757E",
        formatter(value) {
          return "";
          // let strLable = "";
          // if (value.length > 7) {
          //   strLable = value.slice(0, 7).split("").join("\n") + "\n" + "...";
          // } else {
          //   strLable = value.split("").join("\n");
          // }
          // return strLable;
        },
      },
    },
    yAxis: {
      type: "value",
      // name: yUnitName,
      // nameTextStyle: {
      //   fontSize: rem2px(px2rem(10)),
      //   padding: yPadding,
      // },
      // nameGap: rem2px(px2rem(5)),
      axisLine: {
        show: false, // 是否显示Y轴线
      },
      splitLine: {
        show: false, // 是否显示分隔线
      },
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          return addKW(num, 1, max);
        },
      },
      min: 0,
      max,
      interval,
    },
    series: [
      {
        data: Array.from({ length: seriesData.length }, (item, idx) => {
          return {
            name: xAxisData[idx],
            value: 0,
          };
        }),
        type: "bar",
        name: "名称",
        barWidth: rem2px(px2rem(16)),
        barGap: 0,
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          distance: 0, // 距离图形元素的距离
          // color: "#73757E",
          position: "top",
          lineHeight: rem2px(px2rem(12)),
          fontSize: rem2px(px2rem(10)),
          rich: {
            a: {
              color: "#688ff4",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          },
          formatter(params) {
            let value = params.data.name;
            let strLable = "";
            if (value.length > 15) {
              strLable = value.slice(0, 15).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            return `{b|${strLable}}`;
          },
        },
      },
      {
        data: seriesData,
        type: "bar",
        name: seriesName,
        barWidth: rem2px(px2rem(16)),
        showBackground: true,
        backgroundStyle: {
          opacity: 0.5,
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            // 人均页面浏览量
            return params.value > 0
              ? numThousand(parseFloat(params.value.toFixed(2)))
              : "";
          },
        },
        itemStyle: {
          borderRadius: [rem2px(px2rem(15)), rem2px(px2rem(15)), 0, 0],
          color: (param) => {
            return colorList[param.dataIndex];
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        // console.log("tooltip-params", params);
        let paramsObj = params.filter((_) => _.seriesName === seriesName);
        let paramsData = paramsObj.length > 0 ? paramsObj[0] : {};
        let tpl = "";

        const value = parseFloat(paramsData.value.toFixed(2));
        tpl += `
          <div class='server-name'>${paramsData.name}</div>
          <div>
            <span class='circle-tool' style='background-color:${
              paramsData.color
            }'></span>
            <span>${paramsData.seriesName}：</span>
            <span>${numThousand(value)}次</span>
          </div>
          `;
        return tpl;
      },
    },
  };
};

// 总消息数分布饼图
export const device_msg_pie = ({ seriesData = [], colorMap = {} } = {}) => {
  console.log("seriesData饼图", seriesData);
  console.log("colorMap", colorMap);
  // let colorList = getColorList();
  // colorList.splice(7, 0, "#D8D2D2");
  let colorList = getMapColor(
    colorMap,
    seriesData.map((_) => _.name)
  );
  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(0)),
      top: rem2px(px2rem(0)),
      bottom: rem2px(px2rem(0)),
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      className: "tooltip-box",
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let value = params.value ? parseFloat(params.value.toFixed(2)) : 0;
        // let valueRate =
        //   params.data && params.data.valueRate
        //     ? parseFloat((params.data.valueRate - 0).toFixed(2)) + "%"
        //     : "0%";
        // if (value > 10000) {
        //   value = numThousand(numParse(value)) + "万";
        // } else {
        //   value = numThousand(value);
        // }
        let tpl = "";
        tpl += `
          <div class='server-box'>
            <span class='circle-tool' style='background-color:${params.color}'></span>
            <span class='server-name'>${params.name}：</span>
            <span>${numThousand(value)}条</span>
            <span>(${params.percent}%)</span>
          </div>`;
        return tpl;
      },
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["30%", "60%"],
        avoidLabelOverlap: true,
        top: rem2px(px2rem(0)),
        bottom: rem2px(px2rem(10)),
        emphasis: {
          disabled: isPCBrowser() ? false : true, // 是否关闭高亮扇区状态（鼠标移入会自动触发）
        },
        selectedMode: "multiple",
        select: {
          label: {
            color: "#688ff4",
            // fontWeight: 'bold'
          },
        },
        itemStyle: {
          borderRadius: rem2px(px2rem(0)),
          borderColor: "#fff",
          borderWidth: rem2px(px2rem(2)),
        },
        label: {
          color: "#1D252F",
          fontSize: isPCBrowser() ? rem2px(px2rem(10)) : rem2px(px2rem(10)),
          lineHeight: isPCBrowser() ? rem2px(px2rem(12)) : rem2px(px2rem(12)),
          formatter(params) {
            let value = params.value || 0;
            if (value > 10000) {
              value = numThousand(numParse(value)) + "万";
            } else {
              value = numThousand(value);
            }
            // let valueRate =
            //   params.data && params.data.valueRate
            //     ? parseFloat((params.data.valueRate - 0).toFixed(2))
            //     : 0;

            return `${params.name}${isPCBrowser() ? ": " : "\n"}${value}(${
              params.percent
            }%)`;
          },
        },
        labelLine: {
          show: true,
        },
        data: seriesData,
      },
    ],
  };
};

// 近30日趋势图
export const business_trend_line = ({
  xAxisData = [],
  seriesData = [],
  colorMap = {},
  cardId = "",
} = {}) => {
  console.log("seriesData折线图", seriesData);
  let mergeData = seriesData.reduce((pre, cur, idx) => {
    return pre.concat(cur.data || []);
  }, []);

  // let colorList = getColorList();
  let colorList = getMapColor(
    colorMap,
    seriesData.map((_) => _.name)
  );
  let isRate = cardId === "deviceOnlineRate";

  let max = _integerOperate(Math.max(...mergeData, 5), 5);
  let interval = mergeData.length === 0 ? 1 : (max - 0) / 5;
  let series = [];
  seriesData.forEach((item) => {
    series.push({
      type: "line",
      smooth: true,
      showSymbol: true,
      itemStyle: {},
      symbolSize(value, params) {
        if (params.dataIndex % 4 !== 0) return [0, 0];
        return [rem2px(px2rem(4)), rem2px(px2rem(4))];
      },
      symbol: "emptyCircle", // 标记类型 emptyCircle circle none
      data: item.data,
      name: item.name,
    });
  });

  return {
    color: colorList,
    grid: {
      left: "0%",
      right: rem2px(px2rem(15)),
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(5)),
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisTick: {
        show: false, // 是否显示坐标轴刻度
        alignWithLabel: false,
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: false, // 是否显示x轴线
      },
      axisLabel: {
        interval: 3, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        // showMinLabel: false,
        // showMaxLabel: true,
        // rotate: 30,
        formatter: function (value, index) {
          // 0 4 8 12 14 16 20 24 28
          if (index % 4 !== 0) {
            return "";
          }
          let date = new Date(value);
          let MM = (date.getMonth() + 1).toString().padStart(2, 0);
          let dd = date.getDate().toString().padStart(2, 0);
          return `${MM}/${dd}`;
        },
      },
    },
    yAxis: {
      type: "value",
      // name: yUnitName,
      // nameTextStyle: {
      //   fontSize: rem2px(px2rem(10)),
      //   padding: [0, 0, rem2px(px2rem(7)), rem2px(px2rem(max > 10 ? 0 : 20))],
      // },
      // nameGap: rem2px(px2rem(5)),
      axisLabel: {
        fontSize: rem2px(px2rem(10)),
        formatter: (num) => {
          return isRate ? `${num}%` : addKW(num, 1, max);
        },
      },
      min: 0,
      max,
      interval,
    },
    series,
    tooltip: {
      trigger: "axis",
      className: "tooltip-box",
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
      formatter(params) {
        let tpl = "";
        tpl += `<div>${params[0].name}</div>`;
        for (let index = 0; index < params.length; index++) {
          const el = params[index];
          const value = parseFloat(el.value.toFixed(2));

          tpl += `<div class='server-box'>
              <span class='circle-tool' style='background-color:${
                el.color
              }'></span>
              <span class='server-name'>${el.seriesName}：</span>
              <span>${numThousand(value)}${isRate ? "%" : ""}</span>
            </div>
            `;
        }
        return tpl;
      },
    },
  };
};
