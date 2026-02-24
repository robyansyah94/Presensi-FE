<template>
  <div class="min-h-[100dvh] bg-gray-50 flex justify-center items-center p-0 sm:p-4">
    <div class="w-full max-w-md bg-white min-h-[100dvh] sm:min-h-0 sm:h-auto sm:rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col px-8 py-12 justify-center">
    <!-- Decorative background blobs -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-10 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
    
    <!-- Login Form -->
    <div class="flex-1 max-w-sm mx-auto w-full">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
        <p class="text-gray-500 text-sm">Silahkan login untuk masuk ke aplikasi presensi Anda.</p>
      </div>

      <div class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
          <div class="relative group">
            <MailIcon :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="nama@perusahaan.com" 
              class="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
          <div class="relative group">
            <LockIcon :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              class="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button class="text-xs font-bold text-primary hover:underline">Lupa Password?</button>
        </div>

        <button 
          @click="login" 
          :disabled="loading"
          class="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>Masuk Sekarang</span>
        </button>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="mt-auto text-center">
      <p class="text-xs text-gray-400 font-medium">
        &copy; 2024 Perusahaan IT. Semua Hak Dilindungi.
      </p>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail as MailIcon, Lock as LockIcon, ScanLine as ScanLineIcon } from 'lucide-vue-next';

const email = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) {
    alert("Email dan password harus diisi");
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(
      "https://braydon-plausive-malaya.ngrok-free.dev/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/home");
    } else {
      alert(data.message || "Login gagal");
    }
  } catch (error) {
    alert("Gagal menghubungi server");
  } finally {
    loading.value = false;
  }
};
</script>
