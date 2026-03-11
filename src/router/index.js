import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import History from "../views/History.vue";
import Presensi from "../views/Presensi.vue";
import Submission from "../views/Submission.vue";
import Profile from "../views/Profile.vue";
import Scanner from "../views/Scanner.vue";
import Assessment from "../views/Assessment.vue";
import MainLayout from "../components/MainLayout.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: { guestOnly: true }, // hanya untuk yang belum login
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true }, // semua child wajib login
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
      {
        path: "assessment",
        name: "Assessment",
        component: Assessment,
      },
    ],
  },
  {
    path: "/scanner",
    name: "Scanner",
    component: Scanner,
    meta: { requiresAuth: true }, // wajib login
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 ROUTE GUARD CLEAN VERSION
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // kalau butuh login tapi tidak ada token
  if (to.meta.requiresAuth && !token) {
    return next("/");
  }

  // kalau halaman khusus guest tapi sudah login
  if (to.meta.guestOnly && token) {
    return next("/home");
  }

  next();
});

export default router;
