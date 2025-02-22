import { defineStore } from 'pinia'

interface UserState {
  token: string | null
  userInfo: {
    id?: number
    username?: string
    role?: string
  } | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token'),
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin'
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    clearToken() {
      this.token = null
      localStorage.removeItem('token')
    },

    setUserInfo(userInfo: UserState['userInfo']) {
      this.userInfo = userInfo
    }
  }
})
