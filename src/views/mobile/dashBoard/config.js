// import arrorImg from "@/assets/images/dashBoard/arrow.png";
import {
  rem2px,
  px2rem,
  addKW,
  numThousand,
  numParse,
} from "@/common/utils/comm";

// 根据分割长度，返回整数
const _integerOperate = (num, splitNumber = 5) => {
  if (num === 0) return num;
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

// 日活跃用户分布
export const user_distribution = ({
  xAxisData = [],
  seriesData = [],
  data = [],
} = {}) => {
  console.log("日活跃用户分布:seriesData", seriesData);
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 1 : (max - 0) / 5;
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
        alignWithLabel: false,
        lineStyle: {
          color: "#d9d9d9",
        },
      },
      axisLine: {
        show: false, // 是否显示x轴线
      },
      axisLabel: {
        interval: 1, // 强制显示所有刻度
        fontSize: rem2px(px2rem(10)),
        rotate: 30,
        formatter: function (value, index) {
          if (value == 0 || value == undefined || value == "undefined")
            return "";
          let date = new Date(value);
          let MM = (date.getMonth() + 1).toString().padStart(2, 0);
          let dd = date.getDate().toString().padStart(2, 0);
          return `${MM}/${dd}`;
        },
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
        name: "活跃用户数",
        // barWidth: 20,
        label: {
          show: true,
          color: "#656565",
          position: "top",
          fontSize: rem2px(px2rem(10)),
          formatter(params) {
            // console.log("params", params);
            return params.value > 0
              ? addKW(params.value, 1, params.value, false)
              : "";
          },
        },
        itemStyle: {
          color: (param) => {
            if (!param.data) return param.color;
            if (param.dataIndex === 14) {
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
      // enterable: true, // 鼠标是否可进入提示框浮层中
      confine: true, // 是否将 tooltip 框限制在图表的区域内
    },
  };
};

// 访问分布
export const visit_distribute = ({
  xAxisData = [],
  seriesData = [],
  data = [],
  topData = [],
} = {}) => {
  console.log("seriesData", seriesData);
  console.log("topData", topData);
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 5 : (max - 0) / 5;
  return {
    // dataZoom: [
    //   {
    //     // 横轴缩放和滚动
    //     type: "inside",
    //     start: 0,
    //     end: 50, // 初始显示50%的数据
    //   },
    // ],
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
        // barWidth: 20,
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
              val = addKW(curObj.value, 0, curObj.value, false);
            }
            return val;
          },
          fontSize: rem2px(px2rem(10)),
        },
        itemStyle: {
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
        let sysList = data[dataIndex]?.visitDistributionSystemList || [];
        let top3SysList = sysList.slice(0, 3);
        // let sysChart = JSON.stringify(sysList).replace(/\"/g, "'");
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
        // if (top3SysList.length > 0) {
        //   top3SysList.forEach((item) => {
        //     // 我们渲染 Dom 节点的时候，是用的字符串拼接形式。所以，对于 onclick 事件中的参数，我们也因该转化成字符串的形式进行拼接
        //     let row = JSON.stringify(item).replace(/\"/g, "'");
        //     tpl += `
        //       <div class="tooltip-sys-item" onclick="tplSysClick(${row})">
        //         <span class="tooltip-sys-name">${item.sysName}</span>
        //         <span class="tooltip-sys-val">${numThousand(
        //           item.visitNumber
        //         )}</span>
        //         </div>`;
        //     // <img class="tooltip-arrow" src="${arrorImg}" alt="" />
        //   });
        // }
        // if (data.length === 0) {
        //   tpl += `<div class="tooltip-sys-nodata">暂无数据</div>`;
        // }
        // if (data.length > 3) {
        //   tpl += `<div class="tooltip-sys-more" onclick="tplSysAllClick(${sysChart})">查看全部系统 >></div>`;
        // }
        tpl += `</div>`;
        return tpl;
      },
    },
  };
};

// 服务器使用率分布
export const server_use_rate = ({
  xAxisData = [],
  seriesData = [],
  type = "低",
} = {}) => {
  let max = _integerOperate(Math.max(...seriesData, 5), 5);
  let interval = seriesData.length === 0 ? 5 : (max - 0) / 5;
  return {
    title: {},
    grid: {
      left: "0%",
      right: "0%",
      top: rem2px(px2rem(20)),
      bottom: rem2px(px2rem(25)),
      containLabel: true,
    },
    legend: {
      data: ["服务器数"],
      left: "center",
      bottom: 0,
      itemWidth: rem2px(px2rem(10)),
      itemHeight: rem2px(px2rem(8)),
      textStyle: {
        color: "#656565",
        fontSize: rem2px(px2rem(10)),
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      triggerEvent: true,
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
        interval: 0,
        fontSize: rem2px(px2rem(10)),
        color: (value, index) => {
          return type === value ? "#526AE7" : "#73757E";
        },
        formatter: (value) => {
          if (value === type) {
            return `{a|${value}}`;
          }
          return value;
        },
        rich: {
          a: {
            color: "#526AE7",
            fontSize: rem2px(px2rem(10)),
            fontWeight: "bold",
          },
        },
      },
    },
    tooltip: {
      show: false,
      trigger: "axis",
      confine: true,

      // axisPointer: {
      //   type: 'shadow'
      // },
      // formatter() {
      //   return ''
      // }
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
        name: "服务器数",
        barWidth: rem2px(px2rem(20)),
        itemStyle: {
          color: "#688ff4",
        },
        label: {
          show: true,
          color: "#656565",
          position: "top",
          // formatter: "{c}",
          formatter(params) {
            // console.log("params", params);
            return params.value > 0 ? numThousand(params.value) : "";
          },
          fontSize: rem2px(px2rem(10)),
        },
      },
    ],
  };
};
