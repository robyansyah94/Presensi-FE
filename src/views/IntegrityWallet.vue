<template>
  <div class="min-h-screen bg-gray-50 pb-24">

    <!-- ── Hero: Saldo Poin (E-Wallet Style) ─────────────────────────────── -->
    <div class="relative bg-gradient-to-br from-indigo-600 to-purple-700 pt-12 pb-20 px-6 text-white">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden opacity-10">
        <div class="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white"></div>
        <div class="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white"></div>
      </div>

      <div class="relative z-10">
        <!-- User Info -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-white/70 text-sm">Dompet Integritas</p>
            <p class="font-semibold text-lg leading-tight">{{ wallet.user?.name }}</p>
          </div>
        </div>

        <!-- Saldo Utama -->
        <div class="text-center mb-4">
          <p class="text-white/60 text-sm mb-1">Saldo Poin Anda</p>
          <transition name="count" mode="out-in">
            <p :key="wallet.balance" class="text-6xl font-black tracking-tight">
              {{ wallet.balance?.toLocaleString('id-ID') ?? '—' }}
            </p>
          </transition>
          <p class="text-white/60 text-sm mt-1">POIN INTEGRITAS</p>
        </div>

        <!-- Level Badge -->
        <div v-if="wallet.level" class="flex justify-center">
          <span class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold">
            {{ wallet.level.name }}
          </span>
        </div>

        <!-- Level Progress Bar -->
        <div v-if="wallet.level?.next" class="mt-4">
          <div class="flex justify-between text-xs text-white/60 mb-1">
            <span>{{ wallet.balance }} poin</span>
            <span>{{ wallet.level.next }} poin → naik level</span>
          </div>
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-700"
                 :style="{ width: levelProgress + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab Navigation ─────────────────────────────────────────────────── -->
    <div class="sticky top-0 z-20 bg-white shadow-sm -mt-6 mx-4 rounded-2xl overflow-hidden">
      <div class="flex">
        <button v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-3.5 text-sm font-semibold transition-colors"
          :class="activeTab === tab.id
            ? 'bg-indigo-600 text-white'
            : 'text-gray-500 hover:text-indigo-600'">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ── Tab Content ────────────────────────────────────────────────────── -->
    <div class="px-4 mt-4">

      <!-- Tab 1: Riwayat Mutasi -->
      <div v-show="activeTab === 'history'">
        <div v-if="loadingHistory" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat riwayat...</p>
        </div>

        <div v-else-if="history.data?.length === 0" class="py-12 text-center text-gray-400">
          <div class="text-4xl mb-2">📋</div>
          <p class="text-sm">Belum ada riwayat transaksi poin.</p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="item in history.data" :key="item.id"
               class="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">

            <!-- Icon -->
            <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                 :class="item.type === 'EARN' ? 'bg-green-100' : 'bg-red-100'">
              {{ item.icon }}
            </div>

            <!-- Keterangan -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.description }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.created_at }}</p>
            </div>

            <!-- Delta Poin -->
            <div class="text-right flex-shrink-0">
              <p class="font-bold text-base"
                 :class="item.delta > 0 ? 'text-green-600' : 'text-red-600'">
                {{ item.delta > 0 ? '+' : '' }}{{ item.delta }}
              </p>
              <p class="text-xs text-gray-400">{{ item.current_balance }} saldo</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="history.last_page > 1" class="flex justify-center gap-2 pt-2 pb-4">
            <button v-for="page in history.last_page" :key="page"
              @click="fetchHistory(page)"
              class="w-8 h-8 rounded-full text-sm font-medium transition"
              :class="history.current_page === page
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 hover:bg-indigo-50'">
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 2: Marketplace -->
      <div v-show="activeTab === 'marketplace'">
        <div v-if="loadingMarket" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat marketplace...</p>
        </div>

        <div v-else-if="marketItems.length === 0" class="py-12 text-center text-gray-400">
          <div class="text-4xl mb-2">🛍️</div>
          <p class="text-sm">Marketplace masih kosong.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3">
          <div v-for="item in marketItems" :key="item.id"
               class="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2"
               :class="{ 'opacity-60': !item.can_redeem }">

            <!-- Icon & Nama -->
            <div class="text-3xl">{{ item.icon }}</div>
            <div>
              <p class="font-semibold text-gray-800 text-sm leading-tight">{{ item.item_name }}</p>
              <p v-if="item.tolerance_minutes" class="text-xs text-orange-500 mt-0.5">
                ⏱ {{ item.tolerance_minutes }} menit toleransi
              </p>
              <p v-if="item.stock_limit" class="text-xs text-gray-400 mt-0.5">
                {{ item.purchased_this_month }}/{{ item.stock_limit }} bulan ini
              </p>
            </div>

            <!-- Harga -->
            <div class="mt-auto pt-2 border-t border-gray-50">
              <p class="text-indigo-600 font-bold text-base">{{ item.point_cost }}
                <span class="text-xs font-normal text-gray-400">poin</span>
              </p>
            </div>

            <!-- Tombol Tukar -->
            <button @click="redeemItem(item)"
              :disabled="!item.can_redeem || redeeming === item.id"
              class="w-full py-2 rounded-xl text-sm font-semibold transition"
              :class="item.can_redeem
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
              <span v-if="redeeming === item.id">⏳</span>
              <span v-else-if="!item.can_afford">Poin Kurang</span>
              <span v-else-if="!item.stock_available">Limit Tercapai</span>
              <span v-else>Tukar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 3: Inventory Token -->
      <div v-show="activeTab === 'inventory'">
        <div v-if="loadingTokens" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat inventory...</p>
        </div>

        <div v-else>
          <!-- Summary -->
          <div class="bg-indigo-50 rounded-xl p-4 mb-4 flex items-center gap-3">
            <div class="text-3xl">🎫</div>
            <div>
              <p class="font-bold text-indigo-700">{{ tokenSummary.available }} Token Tersedia</p>
              <p class="text-xs text-indigo-500">dari total {{ tokenSummary.total }} token</p>
            </div>
          </div>

          <div v-if="tokens.length === 0" class="py-8 text-center text-gray-400">
            <div class="text-4xl mb-2">📦</div>
            <p class="text-sm">Anda belum memiliki token. Tukar di Marketplace!</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="token in tokens" :key="token.id"
                 class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">

              <!-- Icon -->
              <div class="text-3xl w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                {{ token.item.icon }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 text-sm">{{ token.item.item_name }}</p>
                <p class="text-xs text-gray-400">{{ token.item.token_type_label }}</p>
                <p v-if="token.item.tolerance_minutes" class="text-xs text-orange-500">
                  ⏱ Max {{ token.item.tolerance_minutes }} menit terlambat
                </p>
                <p v-if="token.used_at" class="text-xs text-gray-400 mt-0.5">
                  Dipakai: {{ token.used_at }}
                </p>
              </div>

              <!-- Status Badge -->
              <div class="flex-shrink-0">
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': token.status === 'AVAILABLE',
                    'bg-gray-100 text-gray-500':   token.status === 'USED',
                    'bg-red-100 text-red-500':     token.status === 'EXPIRED',
                  }">
                  {{ token.status_label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Toast Notifikasi ───────────────────────────────────────────────── -->
    <transition name="toast">
      <div v-if="toast.show"
           class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                  px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg text-white"
           :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

export default {
  name: 'IntegrityWallet',

  setup() {
    // ── State ──────────────────────────────────────────────────────────────
    const wallet       = ref({})
    const history      = ref({ data: [], last_page: 1, current_page: 1 })
    const marketItems  = ref([])
    const tokens       = ref([])
    const tokenSummary = ref({ available: 0, total: 0 })
    const activeTab    = ref('history')
    const redeeming    = ref(null)

    const loadingHistory = ref(false)
    const loadingMarket  = ref(false)
    const loadingTokens  = ref(false)

    const toast = ref({ show: false, message: '', type: 'success' })

    const tabs = [
      { id: 'history',     label: '📋 Mutasi' },
      { id: 'marketplace', label: '🛍️ Market' },
      { id: 'inventory',   label: '🎫 Token' },
    ]

    // ── Computed ───────────────────────────────────────────────────────────
    const userInitial = computed(() =>
      (wallet.value.user?.name ?? 'U').charAt(0).toUpperCase()
    )

    const levelProgress = computed(() => {
      const lvl = wallet.value.level
      if (!lvl?.next) return 100
      const range = lvl.next - lvl.min
      const done  = wallet.value.balance - lvl.min
      return Math.min(100, Math.round((done / range) * 100))
    })

    // ── Fetch helpers ──────────────────────────────────────────────────────
    async function fetchWallet() {
      const { data } = await axios.get('/api/wallet')
      wallet.value = data
    }

    async function fetchHistory(page = 1) {
      loadingHistory.value = true
      try {
        const { data } = await axios.get(`/api/wallet/history?page=${page}`)
        history.value = data
      } finally {
        loadingHistory.value = false
      }
    }

    async function fetchMarket() {
      loadingMarket.value = true
      try {
        const { data } = await axios.get('/api/marketplace')
        marketItems.value = data.items
      } finally {
        loadingMarket.value = false
      }
    }

    async function fetchTokens() {
      loadingTokens.value = true
      try {
        const { data } = await axios.get('/api/tokens')
        tokens.value       = data.tokens
        tokenSummary.value = { available: data.available, total: data.total }
      } finally {
        loadingTokens.value = false
      }
    }

    // ── Actions ────────────────────────────────────────────────────────────
    async function redeemItem(item) {
      if (!item.can_redeem || redeeming.value) return
      redeeming.value = item.id
      try {
        const { data } = await axios.post(`/api/marketplace/${item.id}/redeem`)
        showToast(data.message, 'success')
        await fetchWallet()
        await fetchMarket()
        // Reload inventory agar token baru muncul
        if (activeTab.value === 'inventory') await fetchTokens()
      } catch (err) {
        showToast(err.response?.data?.message ?? 'Gagal menukar item.', 'error')
      } finally {
        redeeming.value = null
      }
    }

    function showToast(message, type = 'success') {
      toast.value = { show: true, message, type }
      setTimeout(() => (toast.value.show = false), 3000)
    }

    // ── Watch tab changes ──────────────────────────────────────────────────
    watch(activeTab, (tab) => {
      if (tab === 'history'     && history.value.data.length === 0)    fetchHistory()
      if (tab === 'marketplace' && marketItems.value.length === 0)      fetchMarket()
      if (tab === 'inventory'   && tokens.value.length === 0)           fetchTokens()
    })

    // ── Lifecycle ──────────────────────────────────────────────────────────
    onMounted(async () => {
      await fetchWallet()
      await fetchHistory()  // Default tab aktif
    })

    return {
      wallet, history, marketItems, tokens, tokenSummary,
      activeTab, tabs, redeeming, toast,
      loadingHistory, loadingMarket, loadingTokens,
      userInitial, levelProgress,
      fetchHistory, redeemItem,
    }
  }
}
</script>

<style scoped>
/* Toast animation */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* Count animation */
.count-enter-active, .count-leave-active { transition: all 0.3s ease; }
.count-enter-from                        { opacity: 0; transform: translateY(-10px); }
.count-leave-to                          { opacity: 0; transform: translateY(10px); }
</style>
