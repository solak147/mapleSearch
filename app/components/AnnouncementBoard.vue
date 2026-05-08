<template>
  <section class="announcement-board">
    <div class="board-heading">
      <h2 class="board-title">公告</h2>
    </div>

    <div class="board-tabs" role="tablist" aria-label="公告分類">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="['board-tab', { active: activeTab === tab.value }]"
        @click="setActiveTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="board-list">
      <article
        v-for="item in pagedAnnouncements"
        :key="item.id"
        class="board-item"
      >
        <div class="board-item-main">
          <span :class="['board-badge', item.type]">{{ item.typeLabel }}</span>
          <span class="board-item-title">{{ item.title }}</span>
          <span v-if="item.isNew" class="board-new">N</span>
        </div>
        <time class="board-time" :datetime="item.datetime">{{ item.displayTime }}</time>
      </article>
    </div>

    <div class="board-pagination">
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        &lt;
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        type="button"
        :class="['page-number', { active: currentPage === page }]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        &gt;
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const tabs = [
  { label: "全部", value: "all" },
  { label: "公告", value: "notice" },
  { label: "維護", value: "maintenance" },
];

const announcements = [
  {
    id: 1,
    type: "notice",
    typeLabel: "公告",
    title: "關於「陌生冒險家」減益效果系統說明及 5/14 優化調整預告",
    displayTime: "2026.05.08 14:26",
    datetime: "2026-05-08T14:26:00+08:00",
    isNew: true,
  },
  {
    id: 2,
    type: "notice",
    typeLabel: "公告",
    title: "【已完成】5 月 8 日 已知問題公告",
    displayTime: "2026.05.08 02:21",
    datetime: "2026-05-08T02:21:00+08:00",
    isNew: true,
  },
  {
    id: 3,
    type: "notice",
    typeLabel: "公告",
    title: "關於遊戲內異常遊玩對應之信賴度機制說明",
    displayTime: "2026.05.07 14:41",
    datetime: "2026-05-07T14:41:00+08:00",
    isNew: true,
  },
  {
    id: 4,
    type: "notice",
    typeLabel: "公告",
    title: "5 月 7 日(四) 無維護更新內容公告",
    displayTime: "2026.05.07 11:30",
    datetime: "2026-05-07T11:30:00+08:00",
    isNew: true,
  },
  {
    id: 5,
    type: "notice",
    typeLabel: "公告",
    title: "已知問題公告",
    displayTime: "2026.05.07 10:28",
    datetime: "2026-05-07T10:28:00+08:00",
    isNew: true,
  },
  {
    id: 6,
    type: "notice",
    typeLabel: "公告",
    title: "違反營運政策的冒險家懲處公告",
    displayTime: "2026.05.07 09:34",
    datetime: "2026-05-07T09:34:00+08:00",
    isNew: true,
  },
  {
    id: 7,
    type: "maintenance",
    typeLabel: "維護",
    title: "【已完成】5 月 7 日(四) 維護公告",
    displayTime: "2026.05.06 10:08",
    datetime: "2026-05-06T10:08:00+08:00",
    isNew: false,
  },
  {
    id: 8,
    type: "notice",
    typeLabel: "公告",
    title: "5 月 3 日(日) 職業聊天室暫時關閉",
    displayTime: "2026.05.03 12:49",
    datetime: "2026-05-03T12:49:00+08:00",
    isNew: false,
  },
  {
    id: 9,
    type: "notice",
    typeLabel: "公告",
    title: "違反營運政策的冒險家懲處公告",
    displayTime: "2026.05.03 07:41",
    datetime: "2026-05-03T07:41:00+08:00",
    isNew: false,
  },
  {
    id: 10,
    type: "maintenance",
    typeLabel: "維護",
    title: "【已完成】5 月 3 日(日) 臨時維護公告",
    displayTime: "2026.05.03 01:18",
    datetime: "2026-05-03T01:18:00+08:00",
    isNew: false,
  },
];

const pageSize = 5;
const activeTab = ref("all");
const currentPage = ref(1);

const filteredAnnouncements = computed(() => {
  if (activeTab.value === "all") return announcements;

  return announcements.filter((item) => item.type === activeTab.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAnnouncements.value.length / pageSize))
);

const pagedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;

  return filteredAnnouncements.value.slice(start, end);
});

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

watch(activeTab, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.announcement-board {
  padding: 32px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 50px var(--shadow);
  backdrop-filter: blur(10px);
}

.board-heading {
  margin-bottom: 14px;
}

.board-title {
  margin: 0;
  font-size: 36px;
  color: #101c2f;
  letter-spacing: -0.02em;
}

.board-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #cfd8e4;
  border-bottom: none;
  background: rgba(247, 249, 252, 0.88);
}

.board-tab {
  border: none;
  border-right: 1px solid #cfd8e4;
  border-top: 3px solid transparent;
  padding: 16px 20px;
  background: transparent;
  color: #44566c;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.board-tab:last-child {
  border-right: none;
}

.board-tab.active {
  background: #ffffff;
  color: #2158ff;
  border-top-color: #2158ff;
}

.board-list {
  border-top: 1px solid #cfd8e4;
}

.board-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 16px;
  border-bottom: 1px solid #d7dee8;
}

.board-item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.board-badge {
  flex-shrink: 0;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.board-badge.notice {
  color: #1d68ff;
}

.board-badge.maintenance {
  color: #ff3f86;
}

.board-item-title {
  min-width: 0;
  color: #18253a;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.board-new {
  flex-shrink: 0;
  border-radius: 6px;
  padding: 2px 6px;
  background: #bea8ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.board-time {
  flex-shrink: 0;
  color: #68778d;
  font-size: 14px;
  font-weight: 600;
}

.board-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 26px;
}

.page-btn,
.page-number {
  min-width: 32px;
  height: 32px;
  border: 1px solid #ccd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #425268;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.page-number.active {
  border-color: #2158ff;
  color: #2158ff;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .announcement-board {
    padding: 24px;
  }

  .board-title {
    font-size: 30px;
  }

  .board-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .board-item-main {
    flex-wrap: wrap;
  }

  .board-item-title {
    white-space: normal;
  }
}

@media (max-width: 640px) {
  .announcement-board {
    padding: 20px;
    border-radius: 22px;
  }

  .board-tab {
    padding: 14px 10px;
    font-size: 14px;
  }

  .board-title {
    font-size: 28px;
  }

  .board-item {
    padding: 16px 0;
  }

  .board-item-title {
    font-size: 16px;
  }

  .board-time {
    font-size: 13px;
  }
}
</style>
