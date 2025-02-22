import { defineStore } from 'pinia';

export const useModuleStore = defineStore('module', {
  state: () => ({
    modules: [] as string[] // 根据实际类型调整
  })
}); 