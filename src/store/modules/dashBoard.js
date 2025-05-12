import { getPublicBusiness } from "@/common/api/publicBusiness";
import { showFailToast } from "vant";

export default {
  namespaced: true,
  state: {
    isFinish: false, // 是否完成加载

    staticTime: "", // 统计日期
    pageLoading: true, // 页面loading
    showTabBar: false, // 是否显示tabBar
    pageTitle: "运维看板", // 看板标题
    dataStatus: null, // 1-有权限查看 2-无权限查看
    echartData: {}, // 图表数据
    commandStatus: 1 // 1全部 2关注
  },
  mutations: {
    SET_BOARD_DATA: (state, obj) => {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(state, key)) {
          state[key] = obj[key];
        }
      }
    },
  },
  actions: {
    getBoardList({ commit }, payload) {
      return new Promise((resolve, reject) => {
        getPublicBusiness(payload)
          .then((res) => {
            console.log("getBoardList", res);
            if (res.code === 200) {
              commit("SET_BOARD_DATA", {
                echartData: res?.data || {},
                dataStatus: res?.data?.status,
              });
              resolve(true);
            } else {
              showFailToast(res.message || "接口异常");
              resolve(false);
            }
          })
          .catch((err) => {
            console.log("err", err);
            resolve(false);
          });
      });
    },
  },
};
