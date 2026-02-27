<template>
  <div class="px-6 pt-8 pb-4">
    <!-- Profile Header/Card -->
    <div
      class="bg-primary rounded-3xl p-8 text-white relative overflow-hidden mb-8 shadow-xl shadow-primary/20"
    >
      <div class="relative z-10 flex flex-col items-center">
        <div
          class="w-24 h-24 rounded-3xl bg-white/20 p-1 backdrop-blur-md mb-4 border border-white/30 overflow-hidden"
        >
          <img
            :src="profileImage"
            alt="Profile"
            class="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <h2 class="text-xl font-bold">{{ user?.name }}</h2>
        <p class="text-primary-light/80 text-sm font-medium mb-4">
          {{ user?.nip ?? "NIP tidak tersedia" }} - {{ user?.jabatan ?? "Jabatan tidak tersedia" }}
        </p>

        <div class="flex gap-3 w-full">
          <button
            class="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Edit Profil
          </button>
          <button
            @click="logout"
            class="flex-1 bg-rose-500/80 hover:bg-rose-500 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <!-- Decorative circle -->
      <div
        class="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
      ></div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-3 mb-8">
      <div
        class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center"
      >
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1"
          >Hadir</span
        >
        <span class="text-lg font-black text-primary">22</span>
      </div>
      <div
        class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center"
      >
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1"
          >Izin</span
        >
        <span class="text-lg font-black text-amber-500">2</span>
      </div>
      <div
        class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center"
      >
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1"
          >Sakit</span
        >
        <span class="text-lg font-black text-rose-500">1</span>
      </div>
    </div>

    <!-- Menu List -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group active:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            :class="`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`"
          >
            <component :is="item.icon" :size="20" :class="item.color" />
          </div>
          <div class="text-sm font-bold text-gray-700">{{ item.label }}</div>
        </div>
        <ChevronRightIcon
          :size="18"
          class="text-gray-300 group-hover:text-primary transition-colors"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import api from "@/plugins/axios";
import { BASE_URL } from "@/config";
import {
  ChevronRight as ChevronRightIcon,
  User as UserIcon,
  ShieldCheck as ShieldIcon,
  Settings as SettingsIcon,
  HelpCircle as HelpIcon,
  Info as InfoIcon,
} from "lucide-vue-next";

const router = useRouter();
const user = ref(null);

const fetchUser = async () => {
  try {
    const response = await api.get("/me");
    user.value = response.data;
  } catch (error) {
    console.error("Gagal ambil user", error);
  }
};

onMounted(() => {
  fetchUser();
});

const logout = () => {
  localStorage.removeItem("token");
  router.push("/");
};

const profileImage = computed(() => {
  if (!user.value) return "";

  if (user.value.foto) {
    return `${BASE_URL}/storage/${user.value.foto}`;
  }

  return `https://ui-avatars.com/api/?name=${user.value?.name}&background=007770&color=fff`;
});

const menuItems = [
  {
    label: "Informasi Pribadi",
    icon: UserIcon,
    bg: "bg-primary/5",
    color: "text-primary",
  },
  {
    label: "Keamanan Akun",
    icon: ShieldIcon,
    bg: "bg-emerald-50",
    color: "text-emerald-500",
  },
  {
    label: "Pengaturan Aplikasi",
    icon: SettingsIcon,
    bg: "bg-gray-50",
    color: "text-gray-500",
  },
  {
    label: "Pusat Bantuan",
    icon: HelpIcon,
    bg: "bg-blue-50",
    color: "text-blue-500",
  },
  {
    label: "Tentang Aplikasi",
    icon: InfoIcon,
    bg: "bg-purple-50",
    color: "text-purple-500",
  },
];
</script>
