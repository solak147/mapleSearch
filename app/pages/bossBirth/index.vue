<template>
  <div class="bossbirth-page">
    <div class="bossbirth-shell">
      <div class="bossbirth-header">
        <h1>怪物重生</h1>
        <NuxtLink to="/" class="back-link">返回首頁</NuxtLink>
      </div>
      <p class="bossbirth-copy">記錄各個 Boss 的頻道與重生時間。</p>

      <form class="bossbirth-form" @submit.prevent="addRow">
        <label class="field">
          <span>boss</span>
          <input v-model="newRow.boss" type="text" placeholder="輸入 Boss 名稱">
        </label>
        <label class="field">
          <span>頻道</span>
          <input v-model="newRow.channel" type="text" placeholder="例如 CH 01">
        </label>
        <label class="field">
          <span>最早重生</span>
          <input v-model="newRow.earliestRespawn" type="time" step="1">
        </label>
        <label class="field">
          <span>最晚重生</span>
          <input v-model="newRow.latestRespawn" type="time" step="1">
        </label>
        <button type="submit" class="add-row-btn" :disabled="isSaving">
          {{ isSaving ? "儲存中..." : "新增列" }}
        </button>
      </form>

      <p v-if="saveError" class="save-error">{{ saveError }}</p>
      <p v-if="loadError" class="save-error">{{ loadError }}</p>

      <div class="filter-bar">
        <label class="field filter-field">
          <span>過濾 boss 名稱</span>
          <input
            v-model="bossFilter"
            type="text"
            placeholder="輸入 boss 關鍵字"
          >
        </label>
      </div>

      <div class="table-wrap">
        <table class="bossbirth-table">
          <thead>
            <tr>
              <th>boss</th>
              <th>頻道</th>
              <th>最早重生</th>
              <th>最晚重生</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredBossRows" :key="row.id">
              <td>{{ row.boss }}</td>
              <td>{{ row.channel }}</td>
              <td>{{ formatCountdown(row.earliestRespawnSeconds) }}</td>
              <td>{{ formatCountdown(row.latestRespawnSeconds) }}</td>
              <td>
                <button
                  type="button"
                  class="delete-row-btn"
                  @click="deleteRow(row)"
                >
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!isLoadingRows && filteredBossRows.length === 0" class="empty-state">
          目前沒有 boss 資料。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { getFirebaseDb } from "~/utils/firebase";

const parseTimeToSeconds = (timeText) => {
  if (!timeText) return 0;

  const [hours = "0", minutes = "0", seconds = "0"] = timeText.split(":");

  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  );
};

const formatCountdown = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const createBossRow = (id, boss, channel, earliestRespawn, latestRespawn) => ({
  id,
  boss,
  channel,
  earliestRespawnSeconds: parseTimeToSeconds(earliestRespawn),
  latestRespawnSeconds: parseTimeToSeconds(latestRespawn),
});

const bossRows = ref([]);

const newRow = reactive({
  boss: "",
  channel: "",
  earliestRespawn: "",
  latestRespawn: "",
});
const bossFilter = ref("");
const saveError = ref("");
const loadError = ref("");
const isSaving = ref(false);
const isLoadingRows = ref(false);
const authStore = useAuthStore();

let countdownTimer = null;

const filteredBossRows = computed(() => {
  const keyword = bossFilter.value.trim().toLowerCase();

  if (!keyword) return bossRows.value;

  return bossRows.value.filter((row) =>
    row.boss.toLowerCase().includes(keyword)
  );
});

const tickCountdown = () => {
  bossRows.value.forEach((row) => {
    if (row.earliestRespawnSeconds > 0) {
      row.earliestRespawnSeconds -= 1;
    }

    if (row.latestRespawnSeconds > 0) {
      row.latestRespawnSeconds -= 1;
    }
  });
};

const loadBossRows = async () => {
  loadError.value = "";
  isLoadingRows.value = true;

  try {
    const db = getFirebaseDb();
    const bossRowsQuery = query(
      collection(db, "bossBirthRows"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(bossRowsQuery);

    bossRows.value = snapshot.docs.map((doc) => {
      const data = doc.data();

      return createBossRow(
        doc.id,
        data.boss || "",
        data.channel || "",
        data.earliestRespawn || "00:00:00",
        data.latestRespawn || "00:00:00"
      );
    });
  } catch (error) {
    console.error("讀取 boss 資料失敗:", error);
    loadError.value =
      error?.code === "permission-denied"
        ? "Firebase 權限不足，請檢查 Firestore rules 是否允許讀取 bossBirthRows。"
        : "讀取 Firebase 資料失敗，請稍後再試。";
  } finally {
    isLoadingRows.value = false;
  }
};

const addRow = async () => {
  const boss = newRow.boss.trim();
  const channel = newRow.channel.trim();
  const earliestRespawn = newRow.earliestRespawn.trim();
  const latestRespawn = newRow.latestRespawn.trim();

  if (!boss || !channel || !earliestRespawn || !latestRespawn) return;

  if (!authStore.isLoggedIn) {
    saveError.value = "請先登入，再新增 boss 資料。";
    return;
  }

  saveError.value = "";
  isSaving.value = true;

  try {
    const db = getFirebaseDb();

    const docRef = await addDoc(collection(db, "bossBirthRows"), {
      boss,
      channel,
      earliestRespawn,
      latestRespawn,
      createdAt: serverTimestamp(),
      createdByUid: authStore.user?.uid || null,
      createdByName: authStore.user?.displayName || null,
    });

    bossRows.value.unshift(
      createBossRow(docRef.id, boss, channel, earliestRespawn, latestRespawn)
    );

    newRow.boss = "";
    newRow.channel = "";
    newRow.earliestRespawn = "";
    newRow.latestRespawn = "";
  } catch (error) {
    console.error("新增 boss 資料失敗:", error);
    saveError.value =
      error?.code === "permission-denied"
        ? "Firebase 權限不足，請檢查 Firestore rules 是否允許已登入使用者寫入 bossBirthRows。"
        : "寫入 Firebase 失敗，請稍後再試。";
  } finally {
    isSaving.value = false;
  }
};

const deleteRow = (targetRow) => {
  bossRows.value = bossRows.value.filter((row) => row !== targetRow);
};

onMounted(() => {
  countdownTimer = window.setInterval(tickCountdown, 1000);
  loadBossRows();
});

onBeforeUnmount(() => {
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.bossbirth-page {
  min-height: 100vh;
  padding: 32px;
  background: #f6f2ea;
}

.bossbirth-shell {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 32px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(28, 61, 90, 0.12);
}

.bossbirth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

h1 {
  margin: 0;
  color: #1c3d5a;
}

.bossbirth-copy {
  margin: 20px 0 0;
  color: #2c4158;
  font-size: 16px;
}

.bossbirth-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 16px;
  margin-top: 24px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1c3d5a;
  font-size: 14px;
  font-weight: 600;
}

.field input {
  border: 1px solid #c9d6e3;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #2c4158;
  background: #ffffff;
}

.field input:focus {
  outline: 2px solid rgba(28, 61, 90, 0.18);
  border-color: #1c3d5a;
}

.add-row-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  background: #1c3d5a;
  color: #fff4dc;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.add-row-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.save-error {
  margin: 12px 0 0;
  color: #d94c3d;
  font-size: 14px;
  font-weight: 600;
}

.delete-row-btn {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  background: #d94c3d;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.filter-bar {
  margin-top: 20px;
}

.filter-field {
  max-width: 320px;
}

.table-wrap {
  margin-top: 24px;
  overflow-x: auto;
}

.bossbirth-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}

.bossbirth-table th,
.bossbirth-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #d8e0ea;
  text-align: left;
}

.bossbirth-table th {
  background: #1c3d5a;
  color: #fff4dc;
  font-size: 14px;
  font-weight: 700;
}

.bossbirth-table td {
  color: #2c4158;
  background: #ffffff;
}

.bossbirth-table tbody tr:nth-child(even) td {
  background: #f8fbff;
}

.empty-state {
  margin: 16px 0 0;
  color: #60758b;
  font-size: 14px;
}

.back-link {
  color: #1c3d5a;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 900px) {
  .bossbirth-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .bossbirth-page {
    padding: 20px;
  }

  .bossbirth-shell {
    padding: 24px;
  }

  .bossbirth-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .bossbirth-form {
    grid-template-columns: 1fr;
  }
}
</style>
