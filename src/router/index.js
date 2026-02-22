import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Presensi from "../views/Presensi.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/presensi",
    name: "Presensi",
    component: Presensi,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// PROTEKSI ROUTE
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // kalau belum login dan mau ke presensi → paksa ke login
  if (to.path === "/presensi" && !token) {
    next("/");
  }
  // kalau sudah login dan buka login → paksa ke presensi
  else if (to.path === "/" && token) {
    next("/presensi");
  } else {
    next();
  }
});

export default router;
