import { formatDate, getUrlParams } from "@/common/utils/comm";
import store from "@/store/index.js";

// 预加载运维看板数据
// 1-查询全部系统的数据  2-查询白名单系统的数据
export const preData = (queryType = 1) => {
  return new Promise((resolve) => {
    let staticTime = getUrlParams(location.href).dateTime;
    let boardData = {};
    if (staticTime) {
      boardData.showTabBar = false;
      boardData.staticTime = staticTime;
      boardData.pageTitle = `${formatDate(staticTime)}运维看板`;
    } else {
      var previousDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      boardData.showTabBar = true;
      boardData.staticTime = formatDate(previousDate, "-");
      boardData.pageTitle = `${formatDate(previousDate)}运维看板`;
    }
    store.commit("dashBoard/SET_BOARD_DATA", {
      isFinish: false,
      pageLoading: true,
      showTabBar: boardData.showTabBar,
      staticTime: boardData.staticTime,
      pageTitle: boardData.pageTitle,
    });
    store
      .dispatch("dashBoard/getBoardList", {
        businessType: "operationMetrics",
        dateStr: boardData.staticTime,
        queryType,
      })
      .then(() => {
        store.commit("dashBoard/SET_BOARD_DATA", {
          isFinish: true,
          pageLoading: false,
        });
        console.log("dashBoard", store.state.dashBoard);
        resolve(true);
      })
  });
};
