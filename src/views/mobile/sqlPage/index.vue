<template>
  <div class="page-wrap">
    <!-- SQL审批页 -->
    <Loading :visible="pageLoading" v-if="pageLoading" />

    <template v-else>
      <div class="page-header">
        <NavBar title="详情" :rightBtn="false" class="navbar" />
        <div class="title-name">
          <h3>
            <span>{{ pageInfo.showTitle }}</span>
          </h3>
        </div>
      </div>

      <div class="page-content">
        <van-cell-group class="page-content-item">
          <van-field
            label="工单名称"
            :model-value="pageInfo.workflowTitle"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
          <van-field
            label="组"
            :model-value="pageInfo.groupName"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
          <!-- <van-field
            label="目标实例"
            :model-value="pageInfo.prop4"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          /> -->
          <van-field
            label="数据库"
            :model-value="pageInfo.dbName"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
          <van-field
            label="发起人"
            :model-value="pageInfo.createUserDisplay"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
          <van-field
            label="发起时间"
            :model-value="pageInfo.createTime"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
          <van-field
            :class="[getStatusType(pageInfo.status, 'class'), 'label-work']"
            label="工单状态"
            :model-value="getStatusType(pageInfo.status, 'status')"
            readonly
            autosize
            rows="1"
            type="textarea"
            :border="false"
          />
        </van-cell-group>

        <div class="page-content-item sql-content">
          <div class="card-header" @click="checklistShow = !checklistShow">
            <h3>SQL详情</h3>
            <div class="unfold">
              <van-image
                width="12"
                height="7"
                :src="srcImg.unfoldIcon"
                :class="checklistShow ? '' : 'rotate-icon'"
              />
            </div>
          </div>
          <div v-show="checklistShow" class="card-body">
            <div
              class="info-item"
              v-for="(item, index) in pageInfo.sqlContentList"
              :key="index"
            >
              <van-divider :hairline="false" class="divider-line" />
              <div
                class="info-item-head"
                @click="item.isExpand = !item.isExpand"
              >
                <div class="info-item-title">序号{{ index + 1 }}</div>
                <div class="info-item-status">
                  <!-- <span>审核/执行状态：</span>
                  <span
                    :class="[
                      'info-status-circle',
                      { 'pass-status': item.prop1 === 'pass' },
                      { 'error-status': item.prop1 === 'error' },
                      { 'warning-status': item.prop1 === 'warning' },
                    ]"
                  ></span>
                  <span class="info-status-txt">{{ item.prop1 }}</span> -->
                  <van-image
                    width="12"
                    height="7"
                    :src="srcImg.arrowIcon"
                    :class="[item.isExpand ? '' : 'rotate-icon', 'arrow-img']"
                  />
                </div>
              </div>
              <!-- <div class="info-item-content" v-show="item.isExpand">
                <div class="info-clock">
                  <span>当前阶段：{{ item.prop2 }}</span>
                </div>
                <div class="info-clock">
                  <span>审核/执行信息：{{ item.prop3 }}</span>
                </div>
                <div class="info-clock info-flex">
                  <span>扫描/影响行数: {{ item.prop4 }}</span>
                  <span>执行耗时: {{ item.prop5 }}</span>
                  <span>备份耗时: {{ item.prop6 }}</span>
                </div>
              </div> -->
              <div class="info-item-desc" v-show="item.isExpand">
                {{ item.content }}
              </div>
            </div>
            <div class="sql-tip" v-if="pageInfo.is_sql_all === 0">
              ...更多SQL详情请登录PC端查看
            </div>
          </div>
        </div>

        <div
          class="page-content-item page-review"
          ref="pageReview"
          v-if="pageInfo.status === 'workflow_manreviewing'"
        >
          <h3>评审意见<span class="required">*</span></h3>
          <van-divider :hairline="false" />
          <van-field
            v-model="pageInfo.reviewComment"
            rows="4"
            autosize
            show-word-limit
            type="textarea"
            maxlength="100"
            placeholder="请输入..."
          />
        </div>
        <van-divider class="no-more-divider">没有更多内容了</van-divider>
      </div>

      <div class="page-footer">
        <van-button
          class="cencel"
          :disabled="btnData.disabledBtn"
          @click="cencel"
        >
          取消
        </van-button>
        <van-button
          v-if="pageInfo.status === 'workflow_manreviewing'"
          class="nopass"
          loading-text="提交中..."
          :loading="btnData.noPassLoading"
          :disabled="btnData.disabledBtn"
          @click="operateBtn('cancel')"
        >
          终止流程
        </van-button>
        <van-button
          v-if="pageInfo.status === 'workflow_manreviewing'"
          class="pass"
          loading-text="提交中..."
          :loading="btnData.passLoading"
          :disabled="btnData.disabledBtn"
          @click="operateBtn('pass')"
        >
          审核通过
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import Loading from "@/components/Loading";
import NavBar from "@/components/NavBar";
import { ref, reactive, onMounted, getCurrentInstance, nextTick } from "vue";
import { getReviewDetail, reviewSubmit } from "@/common/api/user";
import { showSuccessToast, showFailToast, showDialog } from "vant";
import { useRouter, useRoute } from "vue-router";
import { dayjs } from "element-plus";
import { exitApp } from "@/common/utils/comm";

const router = useRouter();
const route = useRoute();
let pageLoading = ref(false); // 页面loading
let pageInfo = ref({}); // 页面详情
let btnData = reactive({
  disabledBtn: false,
  noPassLoading: false,
  passLoading: false,
}); // 按钮状态
let srcImg = ref({
  unfoldIcon: require("@/assets/images/icon/unfold.png"),
  arrowIcon: require("@/assets/images/icon/arrow.png"),
});
let checklistShow = ref(true);
let pageReview = ref(null);

onMounted(() => {
  console.log("route", route);
  getInfo();
});
const getInfo = () => {
  pageLoading.value = true;
  let params = {
    workFlowId: route.query.workflowId,
    reviewTicketType: "dbm",
  };
  getReviewDetail(params)
    .then((res) => {
      pageLoading.value = false;
      if (res.code === 200) {
        let workflow = res.data.workflow || {};
        let createTime = workflow.createTime;
        let sqlData = workflow.sqlContentList || [];
        sqlData = sqlData.map((item) => {
          return {
            isExpand: true,
            content: item,
          };
        });
        workflow.sqlContentList = sqlData;
        pageInfo.value = workflow;
        if (createTime) {
          pageInfo.value.createTime = dayjs(createTime).format(
            "YYYY-MM-DD HH:mm:ss"
          );
        }
      } else {
        showFailToast(res.message);
      }
    })
    .catch((err) => {
      showFailToast(err.message || "操作失败!");
      pageLoading.value = false;
    });
};

// 返回列表
const cencel = () => {
  exitApp();
};
// 初始化按钮状态
const initBtnStatus = () => {
  btnData.noPassLoading = false;
  btnData.passLoading = false;
  btnData.disabledBtn = false;
};
// status工单状态
const getStatusType = (status, type) => {
  let statusNmae = "";
  let className = "";
  switch (status) {
    case "workflow_finish":
      statusNmae = "已正常结束";
      className = "label-success";
      break;
    case "workflow_abort":
      statusNmae = "人工终止流程";
      className = "label-default";
      break;
    case "workflow_manreviewing":
      statusNmae = "等待审核人审核";
      className = "label-info";
      break;
    case "workflow_review_pass":
      statusNmae = "审核通过";
      className = "label-warning";
      break;
    case "workflow_timingtask":
      statusNmae = "定时执行";
      className = "label-warning";
      break;
    case "workflow_executing":
      statusNmae = "执行中";
      className = "label-primary";
      break;
    case "workflow_autoreviewwrong":
      statusNmae = "自动审核不通过";
      className = "label-danger";
      break;
    case "workflow_exception":
      statusNmae = "执行有异常";
      className = "label-danger";
      break;
    case "workflow_queuing":
      statusNmae = "排队中";
      className = "label-info";
      break;
  }
  if (type === "status") {
    return statusNmae;
  }
  if (type === "class") {
    return className;
  }
};

const operateBtn = (auditType) => {
  pageReview.value.scrollIntoView();
  if (!pageInfo.value.reviewComment) {
    showDialog({
      message: `请输入评审意见`,
      confirmButtonColor: "#526AE7",
    });
    return;
  }

  btnData.disabledBtn = true;
  if (auditType === "cancel") {
    btnData.noPassLoading = true;
  } else if (auditType === "pass") {
    btnData.passLoading = true;
  }
  let params = {
    reviewTicketType: "dbm", //（审核工单类别）
    workFlowId: route.query.workflowId, //（审核工单Id）
    workflowType: route.query.workflowType, //（审核工单类型）
    reviewComment: pageInfo.value.reviewComment, //（评审语句）
    auditType, //（评审结果：pass—通过，cancel –终止流程）
  };
  console.log("params", params);
  reviewSubmit(params)
    .then((res) => {
      initBtnStatus();
      if (res.code === 200) {
        showSuccessToast("操作成功!");
        exitApp();
      } else {
        showFailToast(res.message || "操作失败!");
      }
    })
    .catch((err) => {
      showFailToast(err.message || "操作失败!");
      initBtnStatus();
    });
};
</script>

<style lang="less" scoped>
.page-wrap {
  width: 100%;
  height: 100%;
  font-size: 12px;
  position: relative;

  .page-header {
    width: 100%;
    background-image: url("~@/assets/images/img-bg.png");
    background-repeat: repeat;
    background-size: contain;
    .navbar {
      background-color: rgba(255, 255, 255, 0);
    }
    .van-hairline--bottom:after {
      border-bottom: 0;
    }
    .title-name {
      width: 100%;
      padding: 16px;
      h3 {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  .page-content {
    .page-content-item {
      width: 100%;
      overflow: hidden;
      margin-bottom: 7px;
      border-radius: 10px;
      background-color: #fff;
      padding: 16px;
      &.sql-content {
        padding: 0;
      }
      /deep/ .van-field {
        padding: 0 0 13px 0;
        &:last-child {
          padding: 0;
        }
        .van-field__label {
          width: 70px;
          color: #818d99;
          // line-height: normal;
        }
        .van-field__value {
          // line-height: normal;
        }
      }
      h3 {
        color: #1d252f;
        font-size: 16px;
        font-weight: 600;
      }
      .required {
        color: #ff5733;
      }

      .card-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        .unfold {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          text-align: center;
          background-color: #f1f3f7;
          display: flex;
          justify-content: center;
          align-items: center;
          .rotate-icon {
            transform: rotate(-90deg);
          }
        }
      }
      .card-body {
        font-size: 12px;
        color: #44566c;
        .info-item {
          margin-bottom: 8px;
          .divider-line {
            padding: 0 16px;
            margin: 0;
          }
          .info-item-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            .info-item-title {
              font-size: 16px;
              font-weight: 700;
            }
            .info-item-status {
              .info-status-circle {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin: 0 6px;

                &.pass-status {
                  background: #84b519;
                  box-shadow: 0px 2px 4px #84b519;
                }
                &.error-status {
                  background: #f05f5f;
                  box-shadow: 0px 2px 4px #f05f5f;
                }
                &.warning-status {
                  background: #ffab1a;
                  box-shadow: 0px 2px 4px #ff8d1a;
                }
              }
              .info-status-txt {
                color: #1d252f;
              }
              .arrow-img {
                margin-left: 30px;
              }
              .rotate-icon {
                transform: rotate(-90deg);
              }
            }
          }
          .info-item-content {
            padding: 0 16px;
            .info-clock {
              line-height: 25px;
            }
            .info-flex {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          }
          .info-item-desc {
            font-size: 12px;
            color: #6f7e8c;
            background-color: rgba(241, 242, 249, 0.57);
            padding: 12px 16px;
          }
        }
        .sql-tip {
          color: #1d252f;
          font-size: 16px;
          font-weight: 700;
          text-align: center;
          line-height: 35px;
        }
      }
    }
  }
  .no-more-divider {
    border-color: #c4c4c4;
    margin: 10px 16px;
    padding-bottom: 60px;
    color: #8d9eae;
    font-size: 12px;
  }
  .page-footer {
    width: 100%;
    background-color: #fff;
    padding: 10px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    .cencel {
      width: 92px;
      height: 40px;
      text-align: center;
      font-size: 14px;
      border-radius: 10px;
      color: rgb(68, 86, 108);
      background-color: rgb(241, 242, 249);
    }
    .nopass {
      width: 92px;
      height: 40px;
      text-align: center;
      font-size: 14px;
      padding: 8px 0px;
      margin: 0 30px;
      border-radius: 10px;
      color: rgb(255, 87, 51);
      background-color: #ffe6e1;
    }
    .pass {
      width: 118px;
      height: 40px;
      text-align: center;
      font-size: 14px;
      border-radius: 10px;
      color: #fff;
      background-color: rgb(82, 106, 231);
    }
  }
}
</style>

<style lang="less">
.label-work {
  .van-field__control {
    width: auto;
    text-align: center;
    color: #fff;
    border-radius: 7px;
  }
  .van-field__control:disabled {
    color: #323233;
  }
}
.label-default {
  .van-field__control {
    background-color: #777777;
  }
}
.label-success {
  .van-field__control {
    background-color: #5cb85c;
  }
}
.label-info {
  .van-field__control {
    background-color: #5bc0de;
  }
}
.label-warning {
  .van-field__control {
    background-color: #f0ad4e;
  }
}
.label-primary {
  .van-field__control {
    background-color: #337ab7;
  }
}
.label-danger {
  .van-field__control {
    background-color: #d9534f;
  }
}
</style>
