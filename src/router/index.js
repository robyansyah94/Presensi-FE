import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import History from "../views/History.vue";
import Presensi from "../views/Presensi.vue";
import Submission from "../views/Submission.vue";
import Profile from "../views/Profile.vue";
import MainLayout from "../components/MainLayout.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "home",
        name: "Home",
        component: Home,
      },
      {
        path: "history",
        name: "History",
        component: History,
      },
      {
        path: "presensi",
        name: "Presensi",
        component: Presensi,
      },
      {
        path: "submission",
        name: "Submission",
        component: Submission,
      },
      {
        path: "profile",
        name: "Profile",
        component: Profile,
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// PROTEKSI ROUTE
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // kalau belum login dan mau ke halaman berproteksi → paksa ke login
  if (to.path !== "/" && !token) {
    next("/");
  }
  // kalau sudah login dan buka login → paksa ke home
  else if (to.path === "/" && token) {
    next("/home");
  } else {
    next();
  }
});

export default router;
