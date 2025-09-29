import axios from 'axios';
function useAxios() {
    const BASE_URL = '/api';
    // const BASE_URL = 'http://8.137.145.5:9010';

    // Ensure a persistent client id exists (generated once per browser)
    const CLIENT_KEY = 'client_id'
    if (!localStorage.getItem(CLIENT_KEY)) {
      const token = 'cid_' + Date.now() + '_' + Math.random().toString(36).slice(2,10)
      try {
        localStorage.setItem(CLIENT_KEY, token)
      } catch (err) {
        // localStorage may be unavailable in some environments; ignore
        console.error('Failed to save client_id to localStorage', err)
      }
    }

    const instance = axios.create({
      timeout:10000,
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'token' : '',
        // X-Client-ID will be injected per-request in the interceptor to ensure it's freshest
      },
    });

    // 设备检测：返回 true 表示移动端（phone 或 tablet），false 表示桌面
    function detectIsMobile() {
      try {
        // 优先使用 User Agent Client Hints
        if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
          return !!navigator.userAgentData.mobile
        }
      } catch {
        // ignore
      }

      const ua = navigator.userAgent || ''
      const isMobileUA = /Mobi|Android|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(ua)
      const isTabletUA = /iPad|Tablet|PlayBook|Silk/i.test(ua)
      if (isMobileUA || isTabletUA) return true

      // 触摸点和屏宽作为辅助判断
      const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || false
      const w = Math.min(window.screen.width || Infinity, window.innerWidth || Infinity)
      if (hasTouch && w <= 1024) return true

      return false
    }
    const isMobileFlag = detectIsMobile()

    // 请求拦截器：添加 JWT 令牌到请求头
    instance.interceptors.request.use(
      (config) => {
        // 保留 JWT token 行为
        const token = localStorage.getItem('token'); // 假设 JWT 令牌存储在 localStorage
        if (token) {
          config.headers = config.headers || {}
          config.headers['token'] = token; // 将令牌附加到每个请求的请求头中
        }

        // 注入 X-Client-ID，若 localStorage 中没有则生成并保存
        try {
          let clientId = localStorage.getItem(CLIENT_KEY)
          if (!clientId) {
            clientId = 'cid_' + Date.now() + '_' + Math.random().toString(36).slice(2,10)
            localStorage.setItem(CLIENT_KEY, clientId)
          }
          config.headers = config.headers || {}
          config.headers['X-Client-ID'] = clientId
          // 注入 isMobile（后端可按需解析 'true'/'false'）
          config.headers['isMobile'] = isMobileFlag ? 'true' : 'false'
        } catch (err) {
          // 如果 localStorage 不可用，则在内存中回退（不可持久）
          console.warn('localStorage unavailable, using fallback client id', err)
          config.headers = config.headers || {}
          config.headers['X-Client-ID'] = 'cid_fallback_' + Date.now()
          config.headers['isMobile'] = isMobileFlag ? 'true' : 'false'
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器：全局错误处理
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.data.code === 0 && error.response.data.msg === "NOT_LOGIN") {
          // 如果检测到用户未登录，跳转到登录页面
          window.location.href = '/login'; // 根据你的路由配置修改
        }
        return Promise.reject(error);
      }
    );
    return instance;
}
export default useAxios;