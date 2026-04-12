import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const isLoggedIn = ref(false);

  const setUser = (userData: any) => {
    user.value = userData;
    isLoggedIn.value = !!userData;
  };

  const clearUser = () => {
    user.value = null;
    isLoggedIn.value = false;
  };

  return {
    user,
    isLoggedIn,
    setUser,
    clearUser
  };
});
