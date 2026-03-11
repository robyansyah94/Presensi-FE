<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4">
      <AppHeader />
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-800">Pengajuan</h1>
        <p class="text-sm text-gray-400 mt-1">Izin, sakit, atau cuti</p>
      </div>
    </div>

    <!-- Tombol buat pengajuan -->
    <div class="px-6 mb-5">
      <button
        @click="showForm = true"
        class="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all"
      >
        <PlusCircleIcon :size="20" />
        Buat Pengajuan Baru
      </button>
    </div>

    <!-- List Pengajuan -->
    <div class="px-6 flex flex-col gap-3">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-3xl h-24 animate-pulse border border-gray-100"
        ></div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="list.length === 0"
        class="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm"
      >
        <div
          class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"
        >
          <FileTextIcon :size="28" class="text-gray-300" />
        </div>
        <p class="text-sm font-semibold text-gray-400">Belum ada pengajuan</p>
        <p class="text-xs text-gray-300 mt-1">
          Tap tombol di atas untuk membuat pengajuan
        </p>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="item in list"
        :key="item.id"
        class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="flex items-stretch">
          <!-- Accent block kiri -->
          <div
            class="w-2 flex-shrink-0"
            :class="{
              'bg-blue-400': item.jenis === 'izin',
              'bg-red-400': item.jenis === 'sakit',
              'bg-purple-400': item.jenis === 'cuti',
            }"
          ></div>

          <div class="flex-1 px-4 py-4">
            <div class="flex items-start justify-between gap-2 mb-2">
              <!-- Jenis & tanggal -->
              <div>
                <span
                  class="text-xs font-black uppercase tracking-wider"
                  :class="{
                    'text-blue-500': item.jenis === 'izin',
                    'text-red-500': item.jenis === 'sakit',
                    'text-purple-500': item.jenis === 'cuti',
                  }"
                >
                  {{ item.jenis }}
                </span>
                <p class="text-sm font-bold text-gray-800 mt-0.5">
                  {{
                    formatTanggalRange(item.tanggal_mulai, item.tanggal_selesai)
                  }}
                </p>
              </div>

              <!-- Badge status -->
              <span
                class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border"
                :class="{
                  'bg-amber-50 text-amber-600 border-amber-100':
                    item.status === 'pending',
                  'bg-green-50 text-green-600 border-green-100':
                    item.status === 'disetujui',
                  'bg-red-50   text-red-500   border-red-100':
                    item.status === 'ditolak',
                }"
              >
                {{ item.status }}
              </span>
            </div>

            <!-- Keterangan -->
            <p
              v-if="item.keterangan"
              class="text-xs text-gray-400 line-clamp-2"
            >
              {{ item.keterangan }}
            </p>

            <!-- Bukti -->
            <div v-if="item.bukti_url" class="mt-2">
              <a
                :href="item.bukti_url"
                target="_blank"
                class="inline-flex items-center gap-1 text-[11px] text-primary font-semibold"
              >
                <PaperclipIcon :size="12" />
                Lihat Bukti
              </a>
            </div>

            <p class="text-[10px] text-gray-300 mt-2">{{ item.created_at }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL FORM PENGAJUAN ───────────────────────────────────────────── -->
    <Transition name="modal">
      <div
        v-if="showForm"
        class="fixed inset-0 z-[200] flex items-end justify-center"
        @click.self="closeForm"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeForm"
        ></div>

        <!-- Sheet -->
        <div
          class="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto z-10 pb-10"
        >
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-gray-200"></div>
          </div>

          <!-- Title -->
          <div class="px-6 py-4 border-b border-gray-50">
            <h2 class="text-lg font-bold text-gray-800">Buat Pengajuan</h2>
            <p class="text-xs text-gray-400 mt-0.5">
              Isi form berikut dengan lengkap
            </p>
          </div>

          <!-- Form -->
          <div class="px-6 py-5 flex flex-col gap-5">
            <!-- Jenis -->
            <div>
              <label
                class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
              >
                Jenis Pengajuan <span class="text-red-400">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="j in ['izin', 'sakit', 'cuti']"
                  :key="j"
                  @click="form.jenis = j"
                  class="py-3 rounded-2xl text-sm font-bold border-2 transition-all"
                  :class="
                    form.jenis === j
                      ? jenisActiveClass(j)
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  "
                >
                  {{ jenisEmoji(j) }}
                  {{ j.charAt(0).toUpperCase() + j.slice(1) }}
                </button>
              </div>
            </div>

            <!-- Tanggal -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                >
                  Tanggal Mulai <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.tanggal_mulai"
                  type="date"
                  class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                >
                  Tanggal Selesai <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.tanggal_selesai"
                  type="date"
                  :min="form.tanggal_mulai"
                  class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <!-- Keterangan -->
            <div>
              <label
                class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
              >
                Alasan / Keterangan
              </label>
              <textarea
                v-model="form.keterangan"
                rows="3"
                placeholder="Tuliskan alasan pengajuan..."
                class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-primary"
              >
              </textarea>
            </div>

            <!-- Upload Bukti -->
            <div>
              <label
                class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
              >
                Upload Bukti
                <span class="text-gray-300 font-normal ml-1"
                  >(opsional, jpg/png/pdf, maks 5MB)</span
                >
              </label>
              <label
                class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <UploadCloudIcon :size="28" class="text-gray-300" />
                <span class="text-xs font-semibold text-gray-400">
                  {{ form.buktiNama ?? "Tap untuk pilih file" }}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  class="hidden"
                  @change="onFileChange"
                />
              </label>
            </div>

            <!-- Error -->
            <div
              v-if="errorMsg"
              class="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-xs font-semibold text-red-500"
            >
              {{ errorMsg }}
            </div>

            <!-- Submit -->
            <button
              @click="submitForm"
              :disabled="submitting"
              class="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? "Mengirim..." : "Kirim Pengajuan" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import api from "@/plugins/axios";
import {
  PlusCircle as PlusCircleIcon,
  FileText as FileTextIcon,
  Paperclip as PaperclipIcon,
  UploadCloud as UploadCloudIcon,
} from "lucide-vue-next";

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false);
const list = ref([]);
const showForm = ref(false);
const submitting = ref(false);
const errorMsg = ref("");

const form = ref({
  jenis: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  keterangan: "",
  buktiFile: null,
  buktiNama: "",
});

// ── Fetch list ────────────────────────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true;
  try {
    const res = await api.get("/pengajuan");
    list.value = res.data.data ?? [];
  } catch (e) {
    console.error("Gagal fetch pengajuan:", e);
  } finally {
    loading.value = false;
  }
};

// ── Submit ────────────────────────────────────────────────────────────────────
const submitForm = async () => {
  errorMsg.value = "";

  if (!form.value.jenis) {
    errorMsg.value = "Pilih jenis pengajuan.";
    return;
  }
  if (!form.value.tanggal_mulai) {
    errorMsg.value = "Tanggal mulai wajib diisi.";
    return;
  }
  if (!form.value.tanggal_selesai) {
    errorMsg.value = "Tanggal selesai wajib diisi.";
    return;
  }

  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append("jenis", form.value.jenis);
    fd.append("tanggal_mulai", form.value.tanggal_mulai);
    fd.append("tanggal_selesai", form.value.tanggal_selesai);
    if (form.value.keterangan) fd.append("keterangan", form.value.keterangan);
    if (form.value.buktiFile) fd.append("bukti", form.value.buktiFile);

    await api.post("/pengajuan", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    closeForm();
    await fetchList();
  } catch (e) {
    errorMsg.value =
      e.response?.data?.message ?? "Gagal mengirim pengajuan. Coba lagi.";
  } finally {
    submitting.value = false;
  }
};

// ── File upload ───────────────────────────────────────────────────────────────
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.buktiFile = file;
  form.value.buktiNama = file.name;
};

// ── Close form ────────────────────────────────────────────────────────────────
const closeForm = () => {
  showForm.value = false;
  errorMsg.value = "";
  form.value = {
    jenis: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    keterangan: "",
    buktiFile: null,
    buktiNama: "",
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTanggalRange = (mulai, selesai) => {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const m = new Date(mulai).toLocaleDateString("id-ID", opts);
  const s = new Date(selesai).toLocaleDateString("id-ID", opts);
  return mulai === selesai ? m : `${m} – ${s}`;
};

const jenisEmoji = (j) => ({ izin: "📋", sakit: "🤒", cuti: "🌴" })[j] ?? "";

const jenisActiveClass = (j) =>
  ({
    izin: "border-blue-400 bg-blue-50 text-blue-600",
    sakit: "border-red-400 bg-red-50 text-red-600",
    cuti: "border-purple-400 bg-purple-50 text-purple-600",
  })[j];

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(fetchList);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(100%);
}
</style>
