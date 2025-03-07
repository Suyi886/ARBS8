// stores/user.ts
import { defineStore } from 'pinia'
import apiService from '@/utils/api'

interface UserState {
  token: string | null
  userInfo: {
    id?: number
    username?: string
    role?: string
    status?: string
    balance?: number
    createdAt?: string
  } | null
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token'),
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    loading: false,
    error: null
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
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
    },

    // 新增登录操作
    async login(username: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const result = await apiService.login({ username, password })
        this.setToken(result.token)
        this.setUserInfo(result.user)
        return result
      } catch (error: any) {
        this.error = error.response?.data?.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 新增注册操作
    async register(username: string, password: string, role?: string) {
      this.loading = true
      this.error = null
      
      try {
        const result = await apiService.register({ username, password, role })
        return result
      } catch (error: any) {
        this.error = error.response?.data?.message || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 新增退出登录操作
    logout() {
      this.clearToken()
      this.setUserInfo(null)
    },
    
    // 新增获取用户信息
    async fetchUserInfo(userId?: number) {
      this.loading = true
      this.error = null
      
      try {
        const id = userId || this.userInfo?.id
        if (!id) throw new Error('用户ID不存在')
        
        const userInfo = await apiService.getUserInfo(id)
        this.setUserInfo(userInfo)
        return userInfo
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 迁移本地用户数据到MySQL
    async migrateLocalUsers() {
      this.loading = true
      this.error = null
      
      try {
        // 获取本地存储的用户数据
        const usersData = localStorage.getItem('users')
        if (!usersData) {
          throw new Error('没有找到本地用户数据')
        }
        
        const users = JSON.parse(usersData)
        if (!Array.isArray(users) || users.length === 0) {
          throw new Error('无效的用户数据')
        }
        
        // 调用API迁移用户
        const result = await apiService.migrateUsers(users)
        return result
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || '迁移用户失败'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
