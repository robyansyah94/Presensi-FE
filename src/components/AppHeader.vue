<template>
  <div class="flex justify-between items-center mb-8">
    <div v-if="user" class="flex items-center gap-3">
      <div
        class="w-12 h-12 rounded-full bg-primary/10 overflow-hidden border-2 border-white shadow-sm"
      >
        <img
          :src="profileImage"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
      </div>

      <div>
        <h2 class="font-bold text-gray-800 text-sm leading-tight">
          {{ user.name }}
        </h2>
        <p class="text-xs text-gray-500">
          {{ user.nip ?? "Belum ada NIP" }}
          <span class="text-gray-500 text-xs">-</span>
          {{ user.jabatan ?? "Belum ada jabatan" }}
        </p>
      </div>
    </div>

    <!-- Slot untuk tombol kanan -->
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/plugins/axios";
import { BASE_URL } from "@/config";

const user = ref(null);

const fetchUser = async () => {
  try {
    const response = await api.get("/me");
    user.value = response.data;
  } catch (error) {
    console.error("Gagal ambil user", error);
  }
};

const profileImage = computed(() => {
  if (!user.value) return "";

  if (user.value.foto) {
    return `${BASE_URL}/storage/${user.value.foto}`;
  }

  return `https://ui-avatars.com/api/?name=${user.value?.name}&background=007770&color=fff`;
});

onMounted(() => {
  fetchUser();
});
</script>
