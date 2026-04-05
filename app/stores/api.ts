import { defineStore } from "pinia";
import { ref } from "vue";

export type AreaMap = Record<string, number>;

export const useApiStore = defineStore("api", () => {
  const map = ref<any | null>(null);
  const apiData = ref<unknown | null>(null);
  const area = ref<AreaMap | null>(null);
  const monster = ref<unknown | null>(null);
  const apiError = ref("");
  const isLoading = ref(false);

  const setMapData = (data: unknown) => {
    map.value = data;
  };

  const setApiData = (data: unknown) => {
    apiData.value = data;
  };

  const setAreaData = (data: AreaMap) => {
    area.value = data;
  };

  const setMonsterData = (data: unknown) => {
    monster.value = data;
  };

  const setApiError = (message: string) => {
    apiError.value = message;
  };

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  return {
    map,
    apiData,
    area,
    monster,
    apiError,
    isLoading,
    setMapData,
    setApiData,
    setApiError,
    setLoading,
    setAreaData,
    setMonsterData,
  };
});
