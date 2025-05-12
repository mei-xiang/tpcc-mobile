import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/dashBoard'
  },
  {
    // 待办列表页面
    path: "/toDoList",
    name: "toDoList",
    component: () => import("@/views/mobile/toDoList/index"),
  },
  // 评审审批、详情页面
  {
    path: "/details",
    name: "details",
    component: () => import("@/views/mobile/toDoList/details"),
  },
  // 运维看板页面
  {
    path: "/dashBoard",
    name: "dashBoard",
    meta: {
      title: "运维看板首页",
      first_level: "系统画像",
      sec_level: "运维看板首页",
      keepAlive: true
    },
    component: () => import("@/views/mobile/dashBoard/index"),
  },
  // 运维看板单系统页面
  {
    path: "/dashBoard/sysDetails",
    name: "sysDetails",
    meta: {
      title: "系统运维看板详情",
      first_level: "系统画像",
      sec_level: "系统运维看板详情",
    },
    component: () => import("@/views/mobile/dashBoard/sysDetails"),
  },
  // sql页面
  {
    path: "/sqlPage",
    name: "sqlPage",
    meta: {
      title: "SQL审核",
      first_level: "SQL审核",
    },
    component: () => import("@/views/mobile/sqlPage/index"),
  },
  // 工时登记页面
  {
    path: "/Tsheets",
    name: "Tsheets",
    meta: {
      title: "工时登记",
      first_level: "工时管理",
      sec_level: "工时登记",
    },
    component: () => import("@/views/mobile/tsheets/index"),
  },
  // 工时审批页面
  {
    path: "/Tsheets/approval",
    name: "approval",
    meta: {
      title: "工时审批",
      first_level: "工时管理",
      sec_level: "工时审批",
    },
    component: () => import("@/views/mobile/tsheets/approval"),
  },
];

// 初始化路由
const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
  // 刷新浏览器滚动条置顶
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 前置路由守卫
router.beforeEach((to, from, next) => {
  console.log("to:", to);
  console.log("from:", from);
  if (to?.meta?.title) {
    document.title = to.meta.title || '项目管理系统'
  }
  next();
});

export default router;
