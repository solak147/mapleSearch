<template>
  <div class="search-page">
    <header class="page-header">
      <h1 class="title">搜尋條件</h1>
      <p class="subtitle">從 store 的 area key 選擇要查詢的區域</p>
    </header>

    <section class="card">
      <h2 class="section-title">區域</h2>
      <p v-if="areaKeys.length === 0" class="hint">
        尚未載入區域資料，請先回首頁載入 API。
      </p>

      <div v-else class="checkbox-grid">
        <label v-for="key in areaKeys" :key="key" class="checkbox-item">
          <input v-model="selectedAreas" type="checkbox" :value="key" />
          <span>{{ key }}</span>
        </label>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">目前選取</h2>
      <p v-if="selectedAreas.length === 0" class="hint">尚未選擇任何區域</p>
      <ul v-else class="selected-list">
        <li v-for="key in selectedAreas" :key="key">{{ key }}</li>
      </ul>
    </section>

    <section class="card">
      <h2 class="section-title">出現怪物</h2>
      <p v-if="selectMonsters.length === 0" class="hint">尚未符合任何怪物</p>
      <div v-else class="monster-grid">
        <figure v-for="name in selectMonsters" :key="name" class="monster-card">
          <img
            class="monster-image"
            :src="`https://artaledrop.com/image/${name}.png`"
            :alt="name"
            loading="lazy"
          />
          <figcaption class="monster-name">{{ name }}</figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useApiStore, type AreaMap } from "~/stores/api";

const apiStore = useApiStore();
const { map, area, monster } = storeToRefs(apiStore);

const selectedAreas = computed<string[]>({
  get: () => {
    if (!area.value || typeof area.value !== "object") {
      return [];
    }
    return Object.entries(area.value as AreaMap)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  },
  set: (next) => {
    if (!area.value || typeof area.value !== "object") {
      return;
    }
    const current = area.value as AreaMap;
    const updated: AreaMap = {};

    Object.keys(current).forEach((key) => {
      updated[key] = 0;
    });

    next.forEach((key) => {
      if (key in updated) {
        updated[key] = 1;
      }
    });

    apiStore.setAreaData(updated);
  },
});

const selectMonsters = computed(() => {
  let returnMonsters: string[] = [];
  if (!area.value || typeof area.value !== "object") {
    return [];
  }

  const monsterKeys =
    monster.value && typeof monster.value === "object"
      ? Object.keys(monster.value as Record<string, unknown>)
      : [];

  for (const key in monsterKeys) {
    const item = monsterKeys[key];
    if (item === undefined) {
      console.log(`undefined key: ${item}`);
      continue;
    }

    //怪物出現區域
    // var monsterInMap : Record<string, unknown>;
    const monsterInMap = map.value[item];

    if (!monsterInMap) {
      console.log(`Invalid monster area for key ${item}:`, monsterInMap);
      continue;
    } else {
      console.log(`Checking monster key:`, Object.keys(monsterInMap));
    }

    selectedAreas.value.forEach((areaKey) => {
      // console.log(`Selected area: ${areaKey}, value: ${area.value?.[areaKey]}`);

      if (returnMonsters.includes(item)) {
        return;
      }

      if (Object.keys(monsterInMap).join(",").includes(areaKey)) {
        returnMonsters.push(item);
      }
    });
  }

  return returnMonsters;
});

const areaKeys = computed(() => {
  if (!area.value || typeof area.value !== "object") {
    return [];
  }
  return Object.keys(area.value as Record<string, unknown>);
});

onMounted(() => {
  // const monsterKeys =
  //   monster.value && typeof monster.value === "object"
  //     ? Object.keys(monster.value as Record<string, unknown>)
  //     : [];
  // console.log("area:", area.value);
  // console.log("monster:", monster.value);
  // console.log("monster keys:", monsterKeys);
  // console.log("map:", map.value);
  // for (const key in monsterKeys) {
  //   const item = monsterKeys[key];
  //   if (item === undefined) {
  //     console.log(`undefined key: ${item}`);
  //     return;
  //   }
  //   //怪物出現區域
  //   const monsterInMap = map.value[item];
  //   console.log(`Checking monster key:`, monsterInMap);
  // }
  // console.log(selectedAreas);
});
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  padding: 32px 8vw 64px;
  background: #f6f2ea;
  color: #0f1b2d;
  font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
}

.page-header {
  display: grid;
  gap: 8px;
  margin-bottom: 24px;
}

.title {
  font-size: 32px;
  margin: 0;
}

.subtitle {
  margin: 0;
  color: #2c4158;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 14px 30px rgba(28, 61, 90, 0.12);
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 18px;
}

.hint {
  color: #2c4158;
  margin: 0;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1c3d5a;
}

.selected-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.selected-list li {
  background: #ffe9c6;
  color: #1c3d5a;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
}

.monster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px 16px;
}

.monster-card {
  margin: 0;
  padding: 12px;
  border-radius: 16px;
  background: #f8f4ee;
  display: grid;
  justify-items: center;
  gap: 8px;
  box-shadow: inset 0 0 0 1px rgba(28, 61, 90, 0.08);
}

.monster-image {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 12px;
  background: #ffffff;
}

.monster-name {
  font-weight: 600;
  color: #1c3d5a;
  text-align: center;
  font-size: 14px;
}
</style>
