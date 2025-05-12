<template>
  <div class="echarts-box" :key="echartDom">
    <div class="echart-title">
      {{ echartTitle }}
      <tipBox :showTip="showTip" v-if="showTip">
        <template #tipTxt>
          <div class="popover-content">
            {{ tipTxt }}
          </div>
        </template>
      </tipBox>
    </div>
    <slot name="subTitleHead"></slot>
    <div
      ref="echartsDom"
      :id="echartDom"
      :style="{ width: width, height: $px2rem(height) }"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, watch, nextTick } from "vue";
import tipBox from "@/views/mobile/dashBoard/sysDetails/components/tipBox.vue";
// 全局引入
// import * as echarts from "echarts";

// 按需加载
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart, LineChart, PieChart } from "echarts/charts";
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";
import { debounce } from "lodash";
import { rem2px, px2rem } from "@/common/utils/comm";

// 注册必须的组件
echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LineChart,
  BarChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

const props = defineProps({
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: 180,
  },
  echartDom: {
    type: String,
    default: "",
  },
  echartTitle: {
    type: String,
    default: "",
  },
  // 图表配置
  opsObj: {
    type: Object,
    default: () => {},
  },
  // 是否添加图表点击
  isTriggerEvent: {
    type: Boolean,
    default: false,
  },
  // 是否隐藏图表点击高亮
  isHideTriggerHigh: {
    type: Boolean,
    default: false,
  },
  // 是否添加图表隐藏tooltip
  isHideTipEvent: {
    type: Boolean,
    default: false,
  },
  // 坐标轴方向
  direction: {
    type: String,
    default: "horizontal",
  },
  // X轴文字是否竖直显示
  xLabelVertical: {
    type: Boolean,
    default: false,
  },
  // X轴文字是否显示在坐标轴内部，需series添加一个bar作为文字系列
  xLabelInAxis: {
    type: Boolean,
    default: false,
  },
  // X轴文字显示在坐标轴内部，需series添加一个bar作为文字系列，长度
  xLabelInAxisLen: {
    type: [String, Number],
    default: 11,
  },
  selectedData: {
    type: Array,
    default() {
      return [];
    },
  },
  // 是否显示tip
  showTip: {
    type: Boolean,
    default: false,
  },
  tipTxt: {
    type: String,
    default: "",
  },
});
const emits = defineEmits(["clickLabelEvent"]);

let echartsDom = ref(null);
// let data = reactive({ chartInstance: null });
let chartInstance = reactive(null);

const hideTip = () => {
  chartInstance &&
    chartInstance.dispatchAction({
      type: "hideTip",
    });
};
const __clickHandler = (e) => {
  // 在这里调用 hideTooltip 方法关闭 tooltip
  if (e.target.nodeName !== "CANVAS") {
    hideTip();
  }
};
const __touchHandler = (e) => {
  // 在这里调用 hideTooltip 方法关闭 tooltip
  hideTip();
};
const __resizeHandler = debounce(() => {
  if (chartInstance) {
    console.log("重新初始化了吗");
    initChart();
    chartInstance.resize();
  }
}, 200);
const handleClickLabelEvent = () => {
  chartInstance.on("click", (params) => {
    console.log("图表点击", params);
    let name = "";
    if (props.direction === "horizontal") {
      if (params.componentType === "xAxis") {
        console.log("单击了x轴文字");
        name = params.value;
      } else if (params.componentType === "series") {
        name = params.name;
        console.log("单击了柱子", params.name);
      }
      if (props.isHideTriggerHigh) {
        emits("clickLabelEvent", { name: name, obj: params.data });
        return;
      }
      let xAxis = props.opsObj.xAxis;
      let series = props.opsObj.series;
      if (xAxis && series) {
        if (props.xLabelInAxis) {
          // X轴文字是否显示在坐标轴内部，需series添加一个bar作为文字系列
          series[0].label.rich = {
            a: {
              color: "#526AE7",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          };
          series[0].label.formatter = (params) => {
            let value = params.data.name;
            let strLable = "";
            if (!params.data.name) return "";
            if (value.length > props.xLabelInAxisLen) {
              strLable =
                value.slice(0, props.xLabelInAxisLen).split("").join("\n") +
                "\n" +
                "...";
            } else {
              strLable = value.split("").join("\n");
            }
            if (props.selectedData.includes(value)) {
              return `{a|${strLable}}`;
            } else {
              return `{b|${strLable}}`;
            }
          };
        } else if (props.xLabelVertical) {
          // X轴文字是否竖直显示
          xAxis.axisLabel.formatter = (value, index) => {
            // console.log("value", value, index);
            let strLable = "";
            if (value.length > 7) {
              strLable = value.slice(0, 7).split("").join("\n") + "\n" + "...";
            } else {
              strLable = value.split("").join("\n");
            }
            if (props.selectedData.includes(value)) {
              return `{a|${strLable}}`;
            } else {
              return `{b|${strLable}}`;
            }
          };
        } else {
          xAxis.axisLabel.rich = {
            a: {
              color: "#526AE7",
              fontSize: rem2px(px2rem(10)),
              fontWeight: "bold",
            },
            b: {
              fontSize: rem2px(px2rem(10)),
              color: "#73757E",
            },
          };
          xAxis.axisLabel.formatter = (value) => {
            // console.log("value", value);
            if (value === name) {
              return `{a|${value}}`;
            } else {
              return `{b|${value}}`;
            }
          };
        }
      }
      emits("clickLabelEvent", { name: name });
      chartInstance.setOption(props.opsObj);
    }
  });
};
const hideTipEvent = () => {
  // chartInstance.getZr().on("click", (params) => {
  //   console.log("params", params);
  //   let containPixel = [params.offsetX, params.offsetY];
  //   // containPixel() 判断点击的点是否在指定的坐标系或者系列上。
  //   // 目前支持在这些坐标系和系列上进行判断：grid, polar, geo, series-map, series-graph, series-pie。
  //   // 我这里是柱状图，所以用 grid 判断是否在坐标系里
  //   if (chartInstance.containPixel("grid", containPixel)) {
  //     console.log('aaa');
  //     // 执行你的代码
  //   }
  // });

  // chartInstance.on("mouseout", (params) => {
  //   // alert("mouseout");
  //   // chartInstance.dispatchAction({
  //   //   type: "hideTip",
  //   // });
  // });
  // chartInstance.on("mousedown", (params) => {
  //   // alert("mousedown");
  // });
  // chartInstance.on("mousedown", (params) => {
  //   // alert("mousedown");
  // });

  chartInstance.on("mouseup", (params) => {
    // alert("mouseup");
    hideTip();
  });

  chartInstance.on("click", (params) => {
    // alert("click");
    hideTip();
  });
};

const initChart = () => {
  chartInstance && chartInstance.setOption(props.opsObj);
  // 饼图回显数据
  // props.selectedData &&
  //   chartInstance.dispatchAction({
  //     type: "select",
  //     name: props.selectedData,
  //   });
};

onMounted(() => {
  // alert(111)
  chartInstance = echarts.init(echartsDom.value);
  initChart();

  // 监听外部元素的点击事件，例如整个页面的点击
  document.body.addEventListener("click", __clickHandler);
  document.body.addEventListener("touchend", __touchHandler);
  // 监听窗口变化
  window.addEventListener("resize", __resizeHandler);

  if (chartInstance) {
    // 图表点击事件触发
    if (props.isTriggerEvent) {
      handleClickLabelEvent();
    }
    // 图表隐藏tooltip事件触发
    if (props.isHideTipEvent) {
      hideTipEvent();
    }
  }
});

onUnmounted(() => {
  chartInstance && chartInstance.dispose();
  chartInstance = null;
  document.body.removeEventListener("click", __clickHandler);
  document.body.removeEventListener("touchend", __touchHandler);
  window.removeEventListener("resize", __resizeHandler);
});

watch(
  () => props.opsObj,
  (newOpsObj) => {
    if (chartInstance && Object.keys(newOpsObj).length > 0) {
      nextTick(() => {
        initChart();
        chartInstance.resize();
      });
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
.echarts-box {
  width: 100%;
  margin-bottom: 10px;
  .echart-title {
    font-size: 12px;
    color: #1d252f;
    line-height: 19px;
  }
  /deep/.sys-tooltip {
    z-index: 99 !important;
    border: none !important;
    // background: #f4f8fb !important;
    // color: #656565 !important;
    .tooltip-sys-box {
      font-size: 12px;
      color: rgb(29, 33, 41);
      .tooltip-sys-total {
        font-weight: 700;
      }
      .tooltip-sys-txt {
        height: 20px;
        line-height: 20px;
        font-weight: 700;
      }
      .tooltip-sys-item {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e8e8ed;
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        width: 150px;
        &:last-child {
          border-bottom: none;
        }
        .tooltip-sys-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tooltip-sys-val {
          color: #526ae7;
          font-weight: 700;
          margin: 0 7px 0 7px;
        }
        .tooltip-arrow {
          width: 15px;
          height: 15px;
        }
      }
    }
    .tooltip-sys-more {
      font-size: 12px;
      height: 24px;
      line-height: 24px;
    }
    .tooltip-sys-nodata {
      font-size: 12px;
      height: 24px;
      line-height: 24px;
    }
  }
  /deep/.tooltip-box {
    z-index: 99 !important;
    border: none !important;
    max-width: 250px !important;
    .server-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .server-name {
        flex: 1;
        margin-right: 2px;
      }
    }
    .line-box {
      height: 1px;
      background-color: #e9eff3;
      margin: 5px 0;
    }
    .circle-tool {
      display: inline-block;
      margin-right: 4px;
      border-radius: 10px;
      width: 10px;
      height: 10px;
    }
    .server-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
/deep/ .van-popover__wrapper {
  .tip-img {
    cursor: pointer;
    transform: translateY(3px);
    width: 12px;
    height: 12px;
  }
}
</style>
