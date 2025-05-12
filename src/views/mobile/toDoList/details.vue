<template>
  <div>
    <Loading :visible="data.visibleLoading" />
    <div class="content" v-show="!data.visibleLoading">
      <div class="headers">
        <NavBar title="详情" :rightBtn="false" class="navbar" />
        <div class="title-name">
          <h3>
            <span>{{data.reviewDetailData.name}}</span>
          </h3>
          <p>项目 | {{ data.reviewDetailData.projectName }}</p>
        </div>
      </div>
      <div class="public">
        <van-cell-group inset>
          <van-field
            class="field"
            label="评审名称"
            :model-value="data.reviewDetailData.reviewName"
            readonly
            :border="false"
          />
          <van-field
            class="field"
            label="评审类型"
            :model-value="data.reviewDetailData.reviewTypeName"
            readonly
            :border="false"
          />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
            "
            class="field"
            label="评审时间"
            :model-value="data.reviewDetailData.reviewTime"
            readonly
            :border="false"
          />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
            "
            class="field"
            label="评审地点"
            autosize
            rows="1"
            type="textarea"
            :model-value="data.reviewDetailData.reviewPlace"
            readonly
            :border="false"
          />
          <hr class="hr" v-if="data.reviewDetailData.reviewTypeCode === 'project_plan_change'" />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'deployment_review'
            "
            class="field"
            label="发版类型"
            :model-value="versionType(data.reviewDetailData.envVersionCode)"
            readonly
            :border="false"
          />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'deployment_review'
            "
            class="field"
            label="发版时间"
            :model-value="time(data.reviewDetailData.releaseStartTime, 'YYYY-MM-DD HH:mm') + ' 至 ' + time(data.reviewDetailData.releaseEndTime, 'YYYY-MM-DD HH:mm')"
            readonly
            :border="false"
          />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'deployment_review'
            "
            class="field"
            label="版本号"
            :model-value="data.reviewDetailData.version"
            readonly
            :border="false"
          />
          <van-field
            label="发起人"
            :model-value="data.reviewDetailData.createEmpName"
            readonly
            :border="false"
            v-show="
              data.reviewDetailData.reviewTypeCode !== 'project_plan_change'
            "
          />
          <van-divider
            :hairline="false"
            v-if="data.reviewDetailData.reviewTypeCode === 'deployment_review'"
          />
          <van-field
            v-show="
              data.reviewDetailData.reviewTypeCode === 'deployment_review'
            "
            label="上线内容"
            :model-value="data.reviewDetailData.releaseContent"
            type="textarea"
            rows="4"
            readonly
            :border="false"
          />
          <div
            v-show="
              data.reviewDetailData.reviewTypeCode === 'deployment_review'
            "
            class="deployment_btn"
            @click="previewCon(data.reviewDetailData.releaseContent)"
          >
            <span>查看全部发版内容>></span>
          </div>
          <van-field
            class="field"
            label="变更说明"
            type="textarea"
            v-if="data.reviewDetailData.reviewTypeCode === 'project_plan_change'"
            :model-value="data.reviewDetailData.releaseContent"
            readonly
          />
        </van-cell-group>
      </div>
      <CardWrap
        title="变更内容"
        remarks="(备注：最新项目计划详情请移步至PC端查看）"
        v-if="data.reviewDetailData.reviewTypeCode === 'project_plan_change'"
        >
        <changeTable :list="data.reviewDetailData.planChangeList" />
      </CardWrap>
      <div class="public" v-if="data.reviewDetailData.reviewTypeCode !== 'project_plan_change'">
        <h3>评审材料</h3>
        <div class="file" v-for="item in data.fileListData" :key="item.id">
          <van-image
            width="24"
            height="24"
            :src="fileIcon(item.materialName)"
            cover
          />
          <span @click="hanldPreview(item.fileId)">{{
            item.materialName
          }}</span>
        </div>
        <div
          v-show="
            data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
          "
        >
          <van-divider :hairline="false" />
          <div class="file-title">
            <van-image width="24" height="24" :src="data.fileIcons" cover />
            <span class="file-other"
              >项目归档交付件<span class="file-pc"
                >(请移步至PC端查看)</span
              ></span
            >
          </div>
        </div>
      </div>
      <div
        class="public"
        v-show="data.reviewDetailData.reviewTypeCode === 'deployment_review'"
      >
        <div class="title">
          <h3>发版环境</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.envShow = !data.envShow"
              :class="data.envShow ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.envShow" class="box">
          <div
            class="env"
            v-for="item in data.reviewDetailData.reviewEnvList"
            :key="item.appId"
          >
            <div class="env-name">{{ item.envName }}</div>
            <div class="dt-base">
              <div class="dt-base-label">数据库:</div>
              <div class="dt-base-value">
                <template v-if="item.reviewSqlList && item.reviewSqlList.length > 0">
                  <span
                    class="tag-item"
                    v-for="item in item.reviewSqlList"
                    :key="item"
                    >{{ item.groupName }}
                  </span>
                </template>
                <span v-else class="tag-item">--</span>
              </div>
            </div>
            <van-field
              class="field env-field"
              label="发版人员: "
              :model-value="realName(item.users)"
              readonly
            />
          </div>
          <div class="env">
            <div class="env-name">受影响系统</div>
            <span
              class="version"
              v-for="item in data.reviewDetailData.reviewerAppList"
              :key="item"
              >{{ item.applicationName }}</span
            >
          </div>
        </div>
      </div>
      <div
        class="public"
        v-show="data.reviewDetailData.reviewTypeCode === 'deployment_review'"
      >
        <div class="title">
          <h3>checklist</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              :class="data.checklistShow ? '' : 'image'"
              @click="data.checklistShow = !data.checklistShow"
            />
          </div>
        </div>
        <div v-show="data.checklistShow" class="box">
          <table
            border="0"
            class="mytable"
            cellspacing="0"
            aria-describedby=" mydesc "
          >
            <thead class="thead">
              <tr>
                <th v-for="item in data.columns" :key="item">
                  {{ item }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, indx) in data.reviewDetailData.checkList"
                :key="item.index"
                :class="indx % 2 == 0 ? 'tr1' : 'tr2'"
              >
                <td>
                  {{ item.name }}
                </td>
                <td>
                  {{ item.value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        class="public"
        v-show="data.reviewDetailData.reviewTypeCode === 'deployment_review'"
      >
        <div class="title">
          <h3>接口自动化测试结果</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              :class="data.cloudListShow ? '' : 'image'"
              @click="data.cloudListShow = !data.cloudListShow"
            />
          </div>
        </div>
        <div v-show="data.cloudListShow" class="box">
          <table
            border="0"
            class="mytable"
            cellspacing="0"
            aria-describedby=" mydesc "
          >
            <thead class="thead">
              <tr>
                <th v-for="item in data.cloudColumns" :key="item.label" :style="{minWidth: item.width}">
                  {{ item.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="data.reviewDetailData.cloudList && data.reviewDetailData.cloudList.length > 0">
                <tr
                  v-for="(item, indx) in data.reviewDetailData.cloudList"
                  :key="item.index"
                  :class="indx % 2 == 0 ? 'tr1' : 'tr2'"
                >
                  <td>
                    {{ item.steamCloudId }}
                  </td>
                  <td>
                    {{ item.name }}
                  </td>
                  <td>
                    {{ item.creator }}
                  </td>
                  <td>
                    {{ item.steamCloudCreateTime }}
                  </td>
                  <td>
                    {{ getColudLevel(item.level, 'val') }}
                  </td>
                  <td>
                    {{ item.taskExcTime }}
                  </td>
                  <td>
                    {{ item.userExc }}
                  </td>
                  <td>
                    {{ getColudStatus(item.taskStatus, 'statusVal') }}
                  </td>
                </tr>
              </template>
              <tr v-else class="idea-file">
                <td colspan="8">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        class="public"
        v-show="
          data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
        "
      >
        <div class="title">
          <h3>评审专家</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.expert = !data.expert"
              :class="data.expert ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.expert">
          <van-cell-group inset>
            <van-field
              v-for="item in data.reviewDetailData.expertList"
              label-width="130"
              :key="item.id"
              rows="1"
              autosize
              type="textarea"
              class="field"
              :label="item.expertTypeName"
              :model-value="expertName(item.expertAccountList || [])"
              readonly
            />
          </van-cell-group>
        </div>
      </div>
      <div
        class="public"
        v-show="
          data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
        "
      >
        <div class="title">
          <h3>其他参会人</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.otherAttendeeShow = !data.otherAttendeeShow"
              :class="data.otherAttendeeShow ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.otherAttendeeShow">
          <van-cell-group inset>
            <van-field
              label-width="0"
              rows="1"
              autosize
              type="textarea"
              class="field"
              :model-value="otherName((data.reviewDetailData && data.reviewDetailData.otherAttendeeList) || [])"
              readonly
            />
          </van-cell-group>
        </div>
      </div>
      <!-- <div
        class="public"
        v-show="data.is_show_report"
      >
        <div class="title">
          <h3>后评价报告</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.reportListShow = !data.reportListShow"
              :class="data.reportListShow ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.reportListShow">
          <div
            v-if="
              data.reviewDetailData.reportList &&
              data.reviewDetailData.reportList.length > 0
            "
          >
            <div
              class="file"
              v-for="item in data.reviewDetailData.reportList"
              :key="item.id"
            >
              <van-image
                width="24"
                height="24"
                :src="fileIcon(item.materialName)"
                cover
              />
              <span @click="hanldPreview(item.fileId)">{{
                item.materialName
              }}</span>
            </div>
          </div>
          <div v-else class="idea-file">暂无数据</div>
        </div>
      </div> -->
      <div
        class="public"
        v-show="
          data.reviewDetailData.attachmentList &&
          data.reviewDetailData.attachmentList.length > 0
        "
      >
        <div class="title">
          <h3>意见附件</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.iedaListShow = !data.iedaListShow"
              :class="data.iedaListShow ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.iedaListShow">
          <div
            v-if="
              data.reviewDetailData.attachmentList &&
              data.reviewDetailData.attachmentList.length > 0
            "
          >
            <div
              class="file"
              v-for="item in data.reviewDetailData.attachmentList"
              :key="item.id"
            >
              <van-image
                width="24"
                height="24"
                :src="fileIcon(item.attachmentName)"
                cover
              />
              <span @click="hanldPreview(item.attachmentPath)">{{
                item.attachmentName
              }}</span>
            </div>
          </div>
          <div v-else class="idea-file">暂无数据</div>
        </div>
      </div>
      <div
        class="public"
        v-show="
          data.reviewDetailData.reviewTypeCode !== 'project_evaluation_review' &&
          data.reviewDetailData.reviewTypeCode !== 'deployment_review' &&
          data.reviewDetailData.reviewTypeCode !== 'project_plan_change'
        "
      >
        <div class="title">
          <h3>参会代表</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.participantShow = !data.participantShow"
              :class="data.participantShow ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.participantShow" class="notify-name-box part-box">
          <template v-if="data.participantsList && data.participantsList.length > 0">
            <span
              v-for="item in data.participantsList"
              :key="item.participantsCode"
              :class="['notify-name', 'part-name', item.isEnable === 0 ? 'no-choose-name' : 'choose-name']"
            >
              <span>{{ item.participantsName }}</span>
              <span v-if="item.participantsCode === 'review_participants_other'"> {{ item.customName ? ('：' + item.customName) : '' }}</span>
              <van-image
                v-if="item.isEnable === 1"
                class="part-choose-img"
                width="11"
                height="12"
                fit="cover"
                :src="data.chooseImg"
              />
            </span>
            <!-- <span v-if="data.participantsList[data.participantsList.length - 1].participantsCode === 'review_participants_other'" class="customName">
              {{ data.participantsList[data.participantsList.length - 1].customName || '' }}
            </span> -->
            <div v-if="data.participantsList && data.participantsList.length > 0" @click="data.showPartDescDia = true" class="tip-box">
              <van-image
                class="tip-img"
                width="14"
                height="14"
                fit="cover"
                :src="data.tipImg"
              />
              <span class="tip-title">参会代表要求说明</span>
            </div>
          </template>
          <span v-else class="notify-name">暂无</span>
        </div>
      </div>
      <!-- <div class="public" v-show="data.reviewDetailData.reviewStatus !== 'end'"> -->
      <div class="public" v-show="data.is_show_informant">
        <div class="title">
          <h3>被知会人</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              @click="data.notifyUserList = !data.notifyUserList"
              :class="data.notifyUserList ? '' : 'image'"
            />
          </div>
        </div>
        <div v-show="data.notifyUserList" class="notify-name-box">
          <template v-if="data.noticeUserList && data.noticeUserList.length > 0">
            <span
              v-for="item in data.noticeUserList"
              :key="item.id"
              class="notify-name"
              >{{ item.realName }}</span
            >
          </template>
          <span v-else class="notify-name">暂无</span>
        </div>
      </div>
      <div class="public" v-show="data.reviewDetailData.userPermission === 2">
        <h3>评审意见<span class="required">*</span></h3>
        <van-divider :hairline="false" />
        <van-cell-group inset>
          <van-field
            v-model="data.reviewDetailData.reviewComment"
            rows="4"
            autosize
            type="textarea"
            maxlength="400"
            show-word-limit
            placeholder="请输入..."
          />
        </van-cell-group>
      </div>
      <div class="public">
        <div class="title">
          <h3>流程信息</h3>
          <div class="unfold">
            <van-image
              width="12"
              height="7"
              :src="data.unfoldIcon"
              :class="data.unfoldShow ? '' : 'image'"
              @click="data.unfoldShow = !data.unfoldShow"
            />
          </div>
        </div>
        <div v-show="data.unfoldShow" class="box">
          <div class="btn">
            <div
              :class="data.reviewList ? 'review' : 'info'"
              @click="checkRecord('review')"
            >
              评审记录
            </div>
            <div
              :class="data.flowList ? 'flow' : 'info'"
              @click="checkRecord('flow')"
            >
              流转记录
            </div>
            <div
              :class="data.notifyList ? 'notify' : 'info'"
              @click="checkRecord('notify')"
            >
              知会记录
            </div>
          </div>
          <div class="process" v-if="data.reviewList">
            <div
              class="process-box"
              v-for="item in data.reviewDetailData.reviewRecords"
              :key="item.id"
            >
              <div class="step-log"></div>
              <div>
                <span class="name">{{ item.reviewerAccountName }}</span>
                <span class="role" v-show="item.roleName">{{
                  item.roleName
                }}</span>
                <span class="step">{{ item.action }}</span>
              </div>
              <div class="idea">{{ item.opinions }}</div>
              <div class="time">{{ time(item.updateTime) }}</div>
            </div>
          </div>
          <div class="process" v-else-if="data.flowList">
            <div
              class="process-box"
              v-for="(item, index) in data.reviewDetailData
                .currentReviewerResponses"
              :key="index"
            >
              <div class="step-log"></div>
              <div>
                <span class="name">{{ item.reviewerName }}</span>
                <span class="role" v-show="item.roleName">{{
                  item.roleName
                }}</span>
              </div>
            </div>
          </div>
          <div
            :class="
              data.reviewDetailData.reviewTypeCode ===
                'project_evaluation_review' ||
              data.reviewDetailData.reviewStatus === 'end'
                ? 'process'
                : ''
            "
            v-else
          >
            <div
              v-if="
                (data.reviewDetailData.reviewTypeCode ===
                  'project_evaluation_review' ||
                  data.reviewDetailData.reviewStatus === 'end') &&
                data.reviewDetailData.reviewStatus !== 'cancelled'
              "
            >
              <div
                class="process-box"
                v-for="item in data.reviewDetailData.reviewInformList"
                :key="item.id"
              >
                <div class="step-log"></div>
                <div class="notify-list">
                  <div class="notify-box">
                    <span class="notify-item">被知会人</span>
                    <span class="notify-user">{{ item.realName }}</span>
                  </div>
                  <div class="notify-box-bt">
                    <div>
                      <span class="notify-item">知会人</span
                      ><span class="notify-item-name">{{
                        item.promoterRealName
                      }}</span>
                    </div>
                    <div class="notify-time">{{ time(item.informTime) }}</div>
                  </div>
                  <div :class="item.isRead ? 'is-read' : 'no-read'">
                    {{ item.isRead ? '已阅' : '待阅' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="not-data">
              <van-image
                width="178"
                height="150"
                fit="cover"
                :src="data.notData"
              />
            </div>
          </div>
        </div>
      </div>
      <Nothing />
      <div class="sumbit">
        <van-button class="cencel" @click="cencel" :disabled="data.disabledBtn"
          >关闭</van-button
        >
        <van-button
          class="nopass"
          @click="sumbit('noPass')"
          :loading="data.noPassLoading"
          loading-text="提交中..."
          :disabled="data.disabledBtn"
          v-show="showAuthApprove(data)"
          >
          驳回
        </van-button>
        <!-- v-show="data.reviewDetailData.userPermission === 2" -->
        <van-button
          class="pass"
          @click="sumbit('pass')"
          :loading="data.passLoading"
          loading-text="提交中..."
          :disabled="data.disabledBtn"
          v-show="showAuthApprove(data)"
          >
          <!-- v-show="data.reviewDetailData.userPermission === 2" -->
          通过
        </van-button>
        <div class="trans-pc-box" v-show="showTransPc(data)">
          <van-icon name="warning" />
          <span class="trans-txt">请移步至PC端提交评分</span>
        </div>
      </div>
      <van-popup
        v-model:show="data.showPopup"
        :overlay="false"
        round
        :style="{
          width: '150px',
          textAlign: 'center',
          padding: '30px 0',
          fontSize: '12px'
        }"
        >{{ data.popuptext }}</van-popup
      >
    </div>
    <van-overlay :show="data.showOverlay" :class="isIphone ? 'overlay' : ''">
      <div class="wrapper" @click.stop>
        <div class="block">
          <div class="closeIcon" @click="closeOverlay">
            <van-image width="24" height="24" :src="data.closeIcon" />
          </div>
          <iframe
            title=""
            :src="data.previewUrl"
            :llowTransparency="true"
            width="100%"
            height="100%"
            class="iframe_style"
          ></iframe>
        </div>
      </div>
    </van-overlay>
    <van-dialog
      v-model:show="data.showPartDescDia"
      title="参会代表说明"
      :showCancelButton="true"
      :showConfirmButton="false"
      className="partDescDia"
      overlayClass="partDescOverlay"
    >
      <part-desc-tableVue></part-desc-tableVue>
      <!-- <div class="partDesc">
        <div>1、启动会评审：需要部门内组会评审，智数部负责人、智数部分管领导、业务部门（如有）、项目总监、数据、技术、安全、PMO参会；</div>
        <div>2、方案设计评审：需要部门内组会评审，智数部负责人、智数部分管领导、业务部门（如有）、项目总监、数据、技术、安全、PMO参会；</div>
        <div>3、系统上线评审：需要部门内组会评审，业务部门（如有）、项目总监、数据、技术参会；</div>
        <div>4、阶段验收：项目组内组会评审，项目总监参会；</div>
        <div>5、项目验收：项目组内组会评审，业务部门（如有）、项目总监、数据、技术参会；</div>
        <div>6、项目后评价评审：需要部门内组会评审，xxxxxxxxx</div>
      </div> -->
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, computed } from 'vue'
import NavBar from '@/components/NavBar'
import Nothing from '@/components/Nothing'
import Loading from '@/components/Loading'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { deepClone, exitApp } from '@/common/utils/comm'
import { dayjs } from 'element-plus'
import CardWrap from '@/components/CardWrap'
import changeTable from './components/changeTable.vue'
import partDescTableVue from './components/partDescTable.vue'
import { showDialog } from 'vant';
import {
  getReviewDetail,
  reviewSubmit,
  filePreview,
  getUpdateReadStatus
} from '@/common/api/user'

const { proxy } = getCurrentInstance()
const isIphone = /iphone/gi.test(window.navigator.userAgent)
const route = useRoute()
const router = useRouter()
const store = useStore()
const data = reactive({
  activeKey: store.state.user.active,
  doc: require('@/assets/images/icon-doc.png'),
  pdf: require('@/assets/images/icon-pdf.png'),
  ppt: require('@/assets/images/icon-ppt.png'),
  txt: require('@/assets/images/icon-txt.png'),
  video: require('@/assets/images/icon-video.png'),
  xls: require('@/assets/images/icon-xls.png'),
  audio: require('@/assets/images/icon-audio.png'),
  other: require('@/assets/images/icon-other.png'),
  img: require('@/assets/images/icon-img.png'),
  zip: require('@/assets/images/icon-zip.png'),
  unfoldIcon: require('@/assets/images/icon/unfold.png'),
  closeIcon: require('@/assets/images/icon/icon_close.png'),
  fileIcons: require('@/assets/images/icon-file.png'),
  notData: require('@/assets/images/not-data.png'),
  chooseImg: require('@/assets/images/choose.png'),
  tipImg: require('@/assets/images/tip.png'),
  reviewDetailData: {},
  fileListData: [],
  noticeUserList: [],
  columns: ['检查项', '描述'],
  cloudColumns: [
    {
      label: 'ID',
      width: '60px'
    },
    {
      label: '用例集名称',
      width: '80px'
    },
    {
      label: '创建人',
      width: '80px'
    },
    {
      label: '创建时间',
      width: '120px'
    },
    {
      label: '等级',
      width: '80px'
    },
    {
      label: '最后执行时间',
      width: '120px'
    },
    {
      label: '最后执行人',
      width: '80px'
    },
    {
      label: '状态',
      width: '80px'
    }
  ],
  envShow: true,
  expert: true,
  checklistShow: true,
  cloudListShow: true,
  unfoldShow: true,
  iedaListShow: false,
  otherAttendeeShow: true,
  participantShow: true,
  reportListShow: true,
  reviewList: true,
  flowList: false,
  notifyList: false,
  notifyUserList: true,
  showPopup: false,
  popuptext: '',
  visibleLoading: true,
  showOverlay: false,
  previewUrl: '',
  noPassLoading: false,
  passLoading: false,
  disabledBtn: false,
  userInfo: proxy.$runWorkH5.user,
  is_show_report: false, // 是否展示后评价报告
  is_show_informant: false, // 是否显示知会人
  showPartDescDia: false, // 是否显示参会代表说明对话框
  participantsList: [] // 参会代表
})

const getColudLevel = computed(() => {
  return (level, type) => {
    const levelList = [
      {
        level: 1,
        levelVal: 'P1',
        bgColor: '#FAE5E1',
        color: '#FF5733'
      },
      {
        level: 2,
        levelVal: 'P2',
        bgColor: '#FFDBEB',
        color: '#FC358F'
      },
      {
        level: 3,
        levelVal: 'P3',
        bgColor: '#FCF1CA',
        color: '#FF8D1A'
      },
      {
        level: 4,
        levelVal: 'P4',
        bgColor: '#D4F6FF',
        color: '#0DCBFF'
      },
      {
        level: 5,
        levelVal: 'P5',
        bgColor: '#D1FFE7',
        color: '#00BF5C'
      }
    ]
    const curObj = levelList.find(item => item.level === level) || {}
    if (type === 'style') {
      return { 'background-color': curObj.bgColor || '', color: curObj.color || '' }
    } else if (type === 'val') {
      return curObj.levelVal || ''
    }
  }
})
const getColudStatus = computed(() => {
  return (status, type) => {
    const statusList = [
      {
        status: 'unexecuted',
        statusVal: '未执行',
        bgColor: '#B0B0B0'
      },
      {
        status: 'true',
        statusVal: '成功',
        bgColor: '#95C72A'
      },
      {
        status: 'false',
        statusVal: '失败',
        bgColor: '#FF5E5E'
      },
      {
        status: 'misinformation',
        statusVal: '误报',
        bgColor: '#FFBB00'
      }
    ]
    const curObj = statusList.find(item => item.status === status)
    if (!curObj) return ''
    return curObj[type] ? curObj[type] : ''
  }
})

onMounted(() => {
  reviewDetail()
})
// 获取评审详情
const reviewDetail = () => {
  const parms = {
    id: route.query.id
  }
  if (route.query.reviewInformId) {
    parms.reviewInformId = route.query.reviewInformId
  }
  getReviewDetail(parms).then((res) => {
    if (res.code === 200) {
      let resObj = res.data.processReviewResponse || {}
      data.reviewDetailData = resObj
      const fileList = []
      resObj.materialList.map((item) => {
        if (item.childList.length > 0) {
          item.childList.map((items) => fileList.push(items))
        }
      })
      if (resObj.reviewTypeCode === 'project_evaluation_review') {
        const leaderList = []
        const expertList = []
        resObj.expertList.map((item) => {
          if (item.expertTypeCode === 'REVIEW_EXPERT_GROUP_LEADER') {
            leaderList.push(item)
          } else {
            expertList.push(item)
          }
        })
        data.reviewDetailData.expertList = deepClone(
          leaderList.concat(expertList)
        )
        let reviewStartTime = resObj.reviewStartTime
        let reviewEndTime = resObj.reviewEndTime
        if (reviewStartTime && reviewEndTime) {
          reviewStartTime = reviewStartTime.replace(/-/g,'/')
          reviewStartTime = reviewStartTime.replace(/T/g,' ')
          reviewEndTime = reviewEndTime.replace(/-/g,'/')
          reviewEndTime = reviewEndTime.replace(/T/g,' ')
          reviewStartTime = dayjs(reviewStartTime).format('YYYY-MM-DD HH:mm')
          reviewEndTime = dayjs(reviewEndTime).format('YYYY-MM-DD HH:mm')
          data.reviewDetailData.reviewTime =  `${reviewStartTime} 至 ${reviewEndTime}`
        } else {
          data.reviewDetailData.reviewTime =  '--'
        }
        data.reviewDetailData.reviewPlace = resObj.reviewPlace || '--'
      }
      if (data.reviewDetailData.reviewStatus !== 'end') {
        data.noticeUserList = resObj.reviewInformList.filter(
          (items) => items.type === 1
        )
        data.reviewDetailData.reviewInformList.filter((item) => item.informTime)
        // data.reviewDetailData.reviewInformList =
        //   resObj.reviewInformList.filter((items) => items.type === 2)
      }
      if (resObj.reviewStatus === 'draft') {
        data.reviewDetailData.currentReviewerResponses.push(
          resObj.reviewRecords[0]
        )
      }
      if (resObj.isRead === 0) {
        parms.reviewInformId = resObj.reviewInformId
        getUpdateReadStatus(parms).then((res) => {
          if (res.code === 200) {
            console.log('待阅转已阅')
          }
        })
      }
      
      data.fileListData = fileList
      data.visibleLoading = false
      data.participantsList = resObj.participantsList
      console.log('data.reviewDetailData', data.reviewDetailData)

      const isRead = route.query.type == 2 || route.query.type == 3 // 待阅、已阅
      // 是否显示后评价报告: 项目后评价且 除开(非发起人且非评审人且 后评价专家/参会人 且流程未结束)
      data.is_show_report = (
        is_pro_review() &&
        !(!is_initiator() && !is_reviewer() && (is_expert() || is_other_attendee()) && resObj.reviewStatus !== 'end')
      )

      // 是否显示知会人: 除开(已结束 || 发起人且驳回 || 项目后评价且发起人且未开始且未提交报告 || 项目后评价且非发起人且非评审人且后评价专家/参会人)
      data.is_show_informant =
        !(
          (resObj.reviewStatus === 'end') ||
          (is_initiator() && resObj.reviewStatus === 'rejected') ||
          (is_pro_review() && is_initiator() && resObj.reviewStatus === 'not_started' && resObj.reviewerList.length <= 0) ||
          (is_pro_review() && !is_initiator() && !is_reviewer() && (is_expert() || is_other_attendee()))
        )
    }
  })
}

// 是否项目后评价
const is_pro_review = () => {
  return data.reviewDetailData.reviewTypeCode === 'project_evaluation_review'
}

// 是否发起人
const is_initiator = () => {
  const loginNameUser = data.userInfo.user_id ? data.userInfo.user_id.toUpperCase() : ''
  return data.reviewDetailData.createBy === loginNameUser
}

// 是否评审人
const is_reviewer = () => {
  const loginNameUser = data.userInfo.user_id ? data.userInfo.user_id.toUpperCase() : ''
  const obj = data.reviewDetailData && data.reviewDetailData.reviewerList.find(item => item.loginName === loginNameUser)
  return obj && Object.keys(obj).length > 0
}

// 是否后评价专家
const is_expert = () => {
  const loginNameUser = data.userInfo.user_id ? data.userInfo.user_id.toUpperCase() : ''
  const expertList = (data.reviewDetailData && data.reviewDetailData.expertList.reduce((prev, cur, index) => {
    return Array.from(new Set(prev.concat(cur.loginName)))
  }, [])) || []
  console.log('评审专家列表', expertList)
  return loginNameUser === expertList.find(item => item === loginNameUser)
}

// 是否其他参会人
const is_other_attendee = () => {
  const loginNameUser = data.userInfo.user_id ? data.userInfo.user_id.toUpperCase() : ''
  const obj = data.reviewDetailData && data.reviewDetailData.otherAttendeeList.find(item => item.loginName === loginNameUser)
  return obj && Object.keys(obj).length > 0
}

// 时间转换
const time = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(time).format(format)
}
// 发版人员拼接
const realName = (realNames) => {
  const str = realNames.map((item) => item.realName)
  if (str.length > 1) {
    return str.join('、')
  } else {
    return str.join('')
  }
}
// 通过/驳回权限
const showAuthApprove = (data) => {
  if (data.reviewDetailData.userPermission === 2) {
    if (data.reviewDetailData.reviewTypeCode === 'project_evaluation_review') {
      if (data.reviewDetailData.isScoreEnd === 1) {
        return true
      }
      // // 兼容旧数据---上传了报告说明是老数据
      // if (data.reviewDetailData.reportList && data.reviewDetailData.reportList.length > 0) {
      //   // isScoreEnd 打分已结束且上传了报告
      //   if (data.reviewDetailData.isScoreEnd === 1) {
      //     return true
      //   }
      //   return true
      // }
    } else {
      return true
    }
  }
  return false
}
// 项目后评价未打分提示
const showTransPc = (data) => {
  return data.reviewDetailData.reviewTypeCode === 'project_evaluation_review' && data.reviewDetailData.isScore === 1
  // if (data.reviewDetailData.reviewTypeCode === 'project_evaluation_review') {
  //   // 兼容旧数据---上传了报告说明是老数据
  //   if (data.reviewDetailData.reportList && data.reviewDetailData.reportList.length > 0) {
  //     return false
  //   }
  //   // 能够打分
  //   if (data.reviewDetailData.isScore === 1) {
  //     return true
  //   }
  // }
  // return false
}

// 评审专家
const expertName = (expertNames = []) => {
  const str = expertNames.map((item) => item.realName)
  if (str.length === 0) {
    return '--'
  }
  if (str.length > 1) {
    return str.join('、')
  } else {
    return str.join('')
  }
}
// 其他参会人回显
const otherName = (expertNames = []) => {
  const str = expertNames.map((item) => item.realName)
  if (str.length === 0) {
    return '暂无'
  }
  if (str.length > 1) {
    return str.join('、')
  } else {
    return str.join('')
  }
}
// 返回列表
const cencel = () => {
  trackBtnClick('关闭')
  exitApp()
}

// 记录切换
const checkRecord = (type) => {
  if (type === 'review') {
    data.reviewList = true
    data.flowList = false
    data.notifyList = false
  } else if (type === 'flow') {
    data.flowList = true
    data.reviewList = false
    data.notifyList = false
  } else {
    data.notifyList = true
    data.reviewList = false
    data.flowList = false
  }
}
// 提交评审
const sumbit = (type) => {
  trackBtnClick(type === 'pass' ? '通过' : '驳回')
  data.disabledBtn = true
  data.noPassLoading = type !== 'pass'
  data.passLoading = type === 'pass'
  const parms = {
    id: data.reviewDetailData.id,
    reviewComment: data.reviewDetailData.reviewComment,
    isPass: type === 'pass'
  }
  if (!data.reviewDetailData.reviewComment) {
    data.showPopup = true
    data.noPassLoading = false
    data.passLoading = false
    data.disabledBtn = false
    data.popuptext = '请输入评审意见'
    setTimeout(() => {
      data.showPopup = false
    }, 1500)
  } else {
    reviewSubmit(parms).then((res) => {
      if (res.code === 200) {
        data.noPassLoading = false
        data.passLoading = false
        data.disabledBtn = false
        exitApp()
      } else if (res.code === 40153) {
        data.showPopup = true
        data.noPassLoading = false
        data.passLoading = false
        data.disabledBtn = false
        data.popuptext = res.message
        setTimeout(() => {
          data.showPopup = false
        }, 2000)
      } else {
        data.showPopup = true
        data.noPassLoading = false
        data.passLoading = false
        data.disabledBtn = false
        data.popuptext = '提交失败'
        setTimeout(() => {
          data.showPopup = false
        }, 1000)
      }
    })
  }
}
// 上传材料预览
const hanldPreview = (fileId) => {
  if (fileId) {
    data.showOverlay = true
    const parms = {
      fileId
    }
    filePreview(parms).then((res) => {
      data.previewUrl = res.previewUrl
    })
  } else {
    data.showPopup = true
    data.popuptext = '文件id错误'
    setTimeout(() => {
      data.showPopup = false
    }, 2000)
  }
}
// 关闭在线预览
const closeOverlay = () => {
  data.showOverlay = false
  data.previewUrl = ''
}
// 文件icon图标
const fileIcon = (fileName) => {
  const fileArr = fileName.split('.')
  const suffix = fileArr[fileArr.length - 1].toLowerCase()
  if (suffix === 'doc' || suffix === 'docx') {
    return data.doc
  } else if (suffix === 'txt') {
    return data.txt
  } else if (suffix === 'pdf') {
    return data.pdf
  } else if (suffix === 'ppt' || suffix === 'pptx') {
    return data.ppt
  } else if (suffix === 'xls' || suffix === 'xlsx') {
    return data.xls
  } else if (suffix === 'zip' || suffix === '7z' || suffix === 'rar') {
    return data.zip
  } else if (
    suffix === 'log' ||
    suffix === 'gif' ||
    suffix === 'jpg' ||
    suffix === 'jpeg' ||
    suffix === 'png'
  ) {
    return data.img
  } else if (suffix === 'mp3' || suffix === 'wav' || suffix === 'wma') {
    return data.audio
  } else if (
    suffix === 'wmv' ||
    suffix === ' rmvb' ||
    suffix === 'mp4' ||
    suffix === 'm4v' ||
    suffix === 'avi'
  ) {
    return data.video
  } else {
    return data.other
  }
}
// 版本类型
const versionType = (str) => {
  switch (str) {
    case 'ENV_SMALL_VERSION':
      return '小版本'
    case 'ENV_LARGE_VERSION':
      return '大版本'
    case 'ENV_URGENT':
      return '紧急版本'
    default:
      return '--'
  }
}

const previewCon = (content) => {
  showDialog({
    title: '发版内容',
    message: content,
    className: 'release-dialog-wrapper',
    confirmButtonText: '关闭'
  }).then(() => {
  });
}

const trackBtnClick = (fieldName) => {
  proxy.$trackWay.trackCustomEv('mobile_release_initiate_page_click', { mobile_approval_page_btn_name: fieldName })
}
</script>

<style lang="less" scoped>
@import '@/assets/css/details.less';
</style>

<style>
.partDescDia {
  background-color: rgb(255, 255, 255) !important;
}
.partDescDia .partDesc {
  color: rgb(69, 84, 103);
  padding: 12px 24px;
  font-size: 13px;
}
.partDescDia  .van-dialog__header {
  font-size: 14px;
}
.partDescDia  .van-dialog__content {
  padding: 0 10px;
  overflow: auto;
  box-sizing: border-box;
}
.partDescDia  .van-dialog__footer {
  font-size: 14px;
}
.partDescOverlay {
  backdrop-filter: none;
}
.hr{
  border: none;
  height: 1px;
  background-color: #F1F3F7;
}
.release-dialog-wrapper {
  top: 50%;
  transform: translateY(-50%);
}
.release-dialog-wrapper .van-dialog__message {
  text-align: unset;
}
</style>
