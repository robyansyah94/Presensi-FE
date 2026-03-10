<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">
    <!-- ── Hero Section (full-width, rounded bawah, sesuai referensi) ── -->
    <div
      class="bg-primary pt-7 pb-5 px-6 flex flex-col items-center rounded-b-[2.5rem] shadow-lg shadow-primary/20 mb-5"
    >
      <!-- Judul halaman -->
      <h1 class="text-white text-lg font-bold text-center mb-6 tracking-wide">
        Profil Karyawan
      </h1>

      <!-- Avatar -->
      <div class="relative mb-5">
        <div
          class="w-28 h-28 rounded-full border-4 border-white/30 overflow-hidden shadow-lg"
        >
          <img
            :src="profileImage"
            alt="Foto Profil"
            class="w-full h-full object-cover"
          />
        </div>
        <!-- Camera badge -->
        <div
          class="absolute bottom-1 right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-2 border-primary shadow-md"
        >
          <CameraIcon :size="15" class="text-white" />
        </div>
      </div>

      <!-- Nama -->
      <h2
        class="text-white text-xl font-semibold uppercase tracking-wide text-center mb-3"
      >
        {{ user?.name ?? "—" }}
      </h2>

      <!-- Badge NIP & Jabatan -->
      <div
        class="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
      >
        <span class="text-white/90 text-xs font-semibold">{{
          user?.nip ?? "NIP -"
        }}</span>
        <span class="text-white/90 text-xs">•</span>
        <span class="text-white/90 text-xs font-semibold">{{
          user?.jabatan ?? "Jabatan -"
        }}</span>
      </div>
    </div>

    <!-- ── Biodata Karyawan ── -->
    <div
      class="mx-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
    >
      <p
        class="px-5 pt-5 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
      >
        Biodata Karyawan
      </p>

      <div
        v-for="(item, i) in biodataItems"
        :key="i"
        class="flex items-center gap-4 px-5 py-4"
        :class="i < biodataItems.length - 1 ? 'border-b border-gray-50' : ''"
      >
        <!-- Icon -->
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ background: item.iconBg }"
        >
          <component
            :is="item.icon"
            :size="18"
            :style="{ color: item.iconColor }"
          />
        </div>

        <!-- Text -->
        <div class="flex flex-col min-w-0">
          <span class="text-[11px] font-semibold text-gray-400">{{
            item.label
          }}</span>
          <span class="text-sm font-bold text-gray-800 truncate">{{
            item.value || "—"
          }}</span>
        </div>
      </div>
    </div>

    <!-- ── Logout Button ── -->
    <div class="mx-6 mt-5">
      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-sm py-4 rounded-2xl shadow-md shadow-rose-200 transition-all active:scale-95"
      >
        <LogOutIcon :size="18" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/plugins/axios";
import { BASE_URL } from "@/config";
import Swal from "sweetalert2";
import {
  Camera as CameraIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
  IdCard as IdCardIcon,
  Briefcase as BriefcaseIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  CalendarDays as CalendarIcon,
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

const logout = async () => {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Apakah kamu yakin ingin keluar dari aplikasi?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    localStorage.removeItem("token");

    await Swal.fire({
      icon: "success",
      title: "Berhasil Logout",
      text: "Kamu telah keluar dari aplikasi",
      timer: 1500,
      showConfirmButton: false,
    });

    router.push("/");
  }
};

const profileImage = computed(() => {
  if (!user.value) return "";
  if (user.value.foto) return `${BASE_URL}/storage/${user.value.foto}`;
  return `https://ui-avatars.com/api/?name=${user.value?.name}&background=007770&color=fff`;
});

const formatTanggal = (tanggal) => {
  if (!tanggal) return null;

  // Handle format "YYYY-MM-DD" dari Laravel/MySQL
  const normalized = tanggal.includes("T")
    ? tanggal
    : tanggal.replace(" ", "T");
  const date = new Date(normalized);

  if (isNaN(date.getTime())) return tanggal; // fallback tampilkan raw value

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const biodataItems = computed(() => [
  {
    label: "Nama Lengkap",
    value: user.value?.name,
    icon: UserIcon,
    iconBg: "#e8f5f4",
    iconColor: "#007770",
  },
  {
    label: "NIP",
    value: user.value?.nip,
    icon: IdCardIcon,
    iconBg: "#e8f5f4",
    iconColor: "#007770",
  },
  {
    label: "Jabatan",
    value: user.value?.jabatan,
    icon: BriefcaseIcon,
    iconBg: "#edf6ee",
    iconColor: "#2d9e4f",
  },
  {
    label: "No. Telepon",
    value: user.value?.no_hp,
    icon: PhoneIcon,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
  },
  {
    label: "Email",
    value: user.value?.email,
    icon: MailIcon,
    iconBg: "#fdf2ff",
    iconColor: "#9333ea",
  },
  {
    label: "Tanggal Bergabung",
    value: formatTanggal(user.value?.tanggal_bergabung),
    icon: CalendarIcon,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
  },
  {
    label: "Alamat",
    value: user.value?.alamat,
    icon: MapPinIcon,
    iconBg: "#fef9c3",
    iconColor: "#ca8a04",
  },
]);
</script>
