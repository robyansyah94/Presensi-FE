<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">

    <!-- Header -->
    <div class="px-6 pt-8 pb-4">
      <AppHeader />
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-800">Helpdesk</h1>
        <p class="text-sm text-gray-400 mt-1">Laporkan kendala absensi Anda</p>
      </div>
    </div>

    <!-- Tombol buat tiket -->
    <div class="px-6 mb-5">
      <button
        @click="showForm = true"
        class="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all"
      >
        <PlusCircleIcon :size="20" />
        Laporkan Kendala
      </button>
    </div>

    <!-- List Tiket -->
    <div class="px-6 flex flex-col gap-3">

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-3">
        <div v-for="n in 3" :key="n" class="bg-white rounded-3xl h-28 animate-pulse border border-gray-100"></div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="list.length === 0"
        class="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm"
      >
        <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <HeadphonesIcon :size="28" class="text-gray-300" />
        </div>
        <p class="text-sm font-semibold text-gray-400">Belum ada laporan kendala</p>
        <p class="text-xs text-gray-300 mt-1">Tap tombol di atas untuk melaporkan</p>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="item in list"
        :key="item.id"
        @click="$router.push('/helpdesk/' + item.id)"
        class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
      >
        <div class="flex items-stretch">
          <!-- Accent kiri berdasarkan status -->
          <div
            class="w-2 flex-shrink-0"
            :class="{
              'bg-gray-300':  item.status === 'open',
              'bg-blue-400':  item.status === 'in_progress',
              'bg-green-400': item.status === 'closed',
            }"
          ></div>

          <div class="flex-1 px-4 py-4">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex-1 min-w-0">
                <!-- Kategori -->
                <span class="text-xs font-bold uppercase tracking-wider" :style="{ color: catColor(item.category) }">
                  {{ item.category_label }}
                </span>
                <!-- Subject -->
                <p class="text-sm font-bold text-gray-800 mt-0.5 line-clamp-1">{{ item.subject }}</p>
              </div>

              <!-- Badge status -->
              <span
                class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border"
                :class="{
                  'bg-gray-50  text-gray-500  border-gray-100':  item.status === 'open',
                  'bg-blue-50  text-blue-600  border-blue-100':  item.status === 'in_progress',
                  'bg-green-50 text-green-600 border-green-100': item.status === 'closed',
                }"
              >
                {{ statusLabel(item.status) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <!-- Balasan -->
              <span class="flex items-center gap-1 text-[11px] text-gray-400">
                <MessageSquareIcon :size="12" />
                {{ item.reply_count }} balasan
              </span>

              <!-- Rating jika sudah closed -->
              <span v-if="item.has_rating" class="text-[11px] text-amber-500 font-semibold">⭐ Sudah dinilai</span>
              <span v-else-if="item.status === 'closed'" class="text-[11px] text-primary font-semibold">Beri Rating →</span>

              <!-- Waktu -->
              <span class="text-[10px] text-gray-300">{{ item.created_human }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL FORM BUAT TIKET ─────────────────────────────────────────────── -->
    <Transition name="modal">
      <div
        v-if="showForm"
        class="fixed inset-0 z-[200] flex items-end justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeForm"></div>

        <!-- Sheet -->
        <div class="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[94vh] overflow-y-auto z-10 pb-10">

          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-gray-200"></div>
          </div>

          <!-- Title -->
          <div class="px-6 py-4 border-b border-gray-50">
            <h2 class="text-lg font-bold text-gray-800">Laporkan Kendala</h2>
            <p class="text-xs text-gray-400 mt-0.5">Isi form berikut dengan jelas</p>
          </div>

          <!-- Form -->
          <div class="px-6 py-5 flex flex-col gap-5">

            <!-- Kategori -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Jenis Kendala <span class="text-red-400">*</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  @click="selectCategory(cat.value)"
                  class="flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold border-2 transition-all text-left"
                  :class="
                    form.category === cat.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  "
                >
                  <span class="text-base">{{ cat.emoji }}</span>
                  <span>{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Prioritas -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Prioritas
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="p in priorities"
                  :key="p.value"
                  @click="form.priority = p.value"
                  class="py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                  :class="form.priority === p.value ? p.activeClass : 'border-gray-100 bg-gray-50 text-gray-400'"
                >
                  {{ p.emoji }} {{ p.label }}
                </button>
              </div>
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Judul Laporan <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.subject"
                @input="debouncedSearch"
                type="text"
                placeholder="Ringkasan singkat kendala Anda..."
                class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary"
              />
            </div>

            <!-- ── Anti-Duplikasi: Tiket Serupa ── -->
            <Transition name="fade">
              <div v-if="similarTickets.length > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p class="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                  <AlertTriangleIcon :size="13" />
                  Ditemukan laporan serupa — cek dulu sebelum membuat baru:
                </p>
                <div class="flex flex-col gap-2">
                  <div
                    v-for="sim in similarTickets"
                    :key="sim.id"
                    class="bg-white rounded-xl px-3 py-2.5 border border-amber-100"
                  >
                    <p class="text-xs font-semibold text-gray-700 line-clamp-1">{{ sim.subject }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] text-amber-600 font-semibold">{{ sim.category }}</span>
                      <span class="text-[10px] text-gray-300">•</span>
                      <span class="text-[10px] text-green-600 font-semibold">✅ Sudah ada solusi</span>
                      <span class="text-[10px] text-gray-300">•</span>
                      <span class="text-[10px] text-gray-400">{{ sim.created_at }}</span>
                    </div>
                  </div>
                </div>
                <p class="text-[10px] text-amber-600 mt-2">Jika masalah Anda berbeda, tetap lanjutkan pengisian.</p>
              </div>
            </Transition>

            <!-- Deskripsi -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Deskripsi Detail <span class="text-red-400">*</span>
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Jelaskan kendala Anda secara detail: kapan terjadi, apa yang muncul di layar, dll."
                class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <!-- Error -->
            <div
              v-if="errorMsg"
              class="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-xs font-semibold text-red-500 flex items-center gap-2"
            >
              <AlertTriangleIcon :size="14" />
              {{ errorMsg }}
            </div>

            <!-- Submit -->
            <button
              @click="submitForm"
              :disabled="submitting"
              class="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </button>

          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import api from '@/plugins/axios'
import {
  PlusCircle as PlusCircleIcon,
  Headphones as HeadphonesIcon,
  MessageSquare as MessageSquareIcon,
  AlertTriangle as AlertTriangleIcon,
} from 'lucide-vue-next'

const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────────────
const loading       = ref(false)
const list          = ref([])
const showForm      = ref(false)
const submitting    = ref(false)
const errorMsg      = ref('')
const similarTickets = ref([])
let   searchTimeout  = null

const form = ref({
  category:    '',
  priority:    'mid',
  subject:     '',
  description: '',
})

// ── Konstanta ─────────────────────────────────────────────────────────────────
const categories = [
  { value: 'gagal_scan_qr',           label: 'Gagal Scan QR',        emoji: '📷' },
  { value: 'lokasi_tidak_terdeteksi', label: 'Lokasi Tidak Terdeteksi', emoji: '📍' },
  { value: 'lupa_absen',              label: 'Lupa Absen',           emoji: '⏰' },
  { value: 'data_presensi_salah',     label: 'Data Presensi Salah',  emoji: '📅' },
  { value: 'masalah_aplikasi',        label: 'Masalah Aplikasi',     emoji: '🐛' },
  { value: 'lainnya',                 label: 'Lainnya',              emoji: '💬' },
]

const priorities = [
  { value: 'low',  label: 'Rendah', emoji: '🟢', activeClass: 'border-green-400 bg-green-50 text-green-600' },
  { value: 'mid',  label: 'Sedang', emoji: '🟡', activeClass: 'border-amber-400 bg-amber-50 text-amber-600' },
  { value: 'high', label: 'Tinggi', emoji: '🔴', activeClass: 'border-red-400 bg-red-50 text-red-600' },
]

// ── Fetch list tiket milik user ───────────────────────────────────────────────
const fetchList = async () => {
  loading.value = true
  try {
    const res = await api.get('/tickets')
    list.value = res.data.data ?? []
  } catch (e) {
    console.error('Gagal fetch tiket:', e)
  } finally {
    loading.value = false
  }
}

// ── Anti-duplikasi: search tiket serupa ───────────────────────────────────────
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  if (form.value.subject.length < 5) {
    similarTickets.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get('/tickets/search-similar', {
        params: { q: form.value.subject },
      })
      similarTickets.value = res.data.data ?? []
    } catch {
      similarTickets.value = []
    }
  }, 500) // debounce 500ms agar tidak spam request
}

// ── Pilih kategori ────────────────────────────────────────────────────────────
const selectCategory = (val) => {
  form.value.category = val
}

// ── Submit buat tiket ─────────────────────────────────────────────────────────
const submitForm = async () => {
  errorMsg.value = ''

  if (!form.value.category)    { errorMsg.value = 'Pilih jenis kendala.'; return }
  if (!form.value.subject)     { errorMsg.value = 'Judul laporan wajib diisi.'; return }
  if (!form.value.description) { errorMsg.value = 'Deskripsi detail wajib diisi.'; return }

  submitting.value = true
  try {
    await api.post('/tickets', {
      category:    form.value.category,
      priority:    form.value.priority,
      subject:     form.value.subject,
      description: form.value.description,
    })

    closeForm()
    await fetchList()
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? 'Gagal mengirim laporan. Coba lagi.'
  } finally {
    submitting.value = false
  }
}

// ── Close & reset form ────────────────────────────────────────────────────────
const closeForm = () => {
  showForm.value = false
  errorMsg.value = ''
  similarTickets.value = []
  form.value = { category: '', priority: 'mid', subject: '', description: '' }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusLabel = (s) => ({
  open:        'Menunggu',
  in_progress: 'Diproses',
  closed:      'Selesai',
})[s] ?? s

const catColor = (cat) => ({
  gagal_scan_qr:           '#7c3aed',
  lokasi_tidak_terdeteksi: '#ea580c',
  lupa_absen:              '#dc2626',
  data_presensi_salah:     '#2563eb',
  masalah_aplikasi:        '#db2777',
  lainnya:                 '#6b7280',
})[cat] ?? '#6b7280'

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(fetchList)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-from .relative,
.modal-leave-to .relative                { transform: translateY(100%); }

.fade-enter-active, .fade-leave-active   { transition: all 0.25s ease; }
.fade-enter-from, .fade-leave-to         { opacity: 0; transform: translateY(-6px); }
</style>