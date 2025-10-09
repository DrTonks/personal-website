<template>
    <!-- 示例：蓝紫色区间 + 较低阈值，仅作快速体验，生产可按需调整 -->
    <SplashCursor
      v-if="experimental && !isMobile()"
      :SIM_RESOLUTION="228"
      :DYE_RESOLUTION="140"
      :CAPTURE_RESOLUTION="512"
      :DENSITY_DISSIPATION="4.5"
      :VELOCITY_DISSIPATION="2"
      :PRESSURE="0.1"
      :PRESSURE_ITERATIONS="20"
      :CURL="3"
      :SPLAT_RADIUS="0.2"
      :SPLAT_FORCE="9000"
      :SHADING="true"
      :COLOR_UPDATE_SPEED="10"
      :BACK_COLOR="{ r: 0.5, g: 0, b: 0 }"
      :TRANSPARENT="true"
      :HUE_MIN="0.45"
      :HUE_MAX="1"
      :COLOR_INTENSITY="0.22"
      :MIN_SPLAT_SPEED="0.01"
      :DISABLE_CLICK_SPLAT="true"
    />
    <div
    class="relative min-h-screen flex items-center justify-center transition-all duration-500"
  >
  <StaggeredMenu
    ref="staggeredMenuRef"
    class="absolute"
     position="left"
     :items="menuItems"
     :social-items="socialItems"
     :display-socials="false"
     :display-item-numbering="false"
     menu-button-color="#fff"
     open-menu-button-color="#fff"
     :change-menu-color-on-open="true"
     :colors="['#ADD8E6', '#87CEFA']"
     accent-color="#87CEFA"
     :experimental="experimental"
     @update:experimental="(val) => (experimental = val)"
     @menu-open="handleMenuOpen"
     @menu-close="handleMenuClose"
     @item-click="handleMenuItemClick"
   />
    <!-- 电脑端背景：CSS 渐变 + OrbBg 同时展示 -->
    <template v-if="!isMobile()">
      <div class="absolute inset-0 z-0 halo-bg" />
      <OrbBg class="absolute inset-0 z-0" />
    </template>
    <!-- 移动端图片背景 -->
    <div v-else class="absolute inset-0 z-0 mobile-bg" style="background-image: url('/assets/ph-bg.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; min-height: 100vh;"></div>
    
    <!-- 状态展示卡片 -->
  <transition name="card-up" appear mode="out-in">
    <el-card
      class="absolute w-full max-w-md mx-2 shadow-2xl glass-card transition-all duration-500"
      ref="cardRef"
      v-show="currentView === 'mystatus'"
    >
      <!-- 刷新按钮 -->
      <el-button
        class="!absolute right-6 top-6 z-10 cursor-pointer"
        type="primary"
        circle
        size="large"
        @click="handleRefresh"
        :icon="Refresh"
        :loading="refreshing"
        title="刷新状态"
      />
      <!-- 开关课表控件 -->
        <el-switch
          v-model="showSchedule"
          active-color="#D6EEFF"
          inactive-color="#E6D8FF"
          active-text="今日课表"
        />
      <div class="flex flex-col items-center py-8  content-to-fade" >
      <el-avatar :size="100" src="/assets/avatar.gif" class="mb-4 shadow-lg" />
        <h2 class="text-xl font-bold mb-2 text-gray-800 tracking-wide text-center">
          {{ appNameDisplay=== 'Windows 终端' || appNameDisplay === '睡眠状态' || appNameDisplay === '锁屏' ? '似了？' : '当前使用的应用：'}}
        </h2>
        <transition name="fade">
        <div v-if="!error"
             :class="[
               'text-2xl font-semibold mb-2 text-center',
               idleDesc ? '' : 'animate-bounce',
               appNameDisplay === 'Windows 终端'
                 ? 'text-red-600'
                 : appNameDisplay === '未登记应用'
                   ? 'text-gray-500'
                   : 'text-blue-600'
              ]"
             key="app">
          {{ appNameDisplay === 'Windows 终端'
              ? '关机中...'
              : appNameDisplay }}
        </div>
          <div v-else key="off" class="text-center text-2xl font-semibold text-red-500 mb-2 animate-pulse">
            服务器关闭!<br>也许是似了，快去尝试联系他
          </div>
        </transition>
        <div class="text-gray-700 mb-4 min-h-[2rem]">
          {{ appDescDisplay }}
        </div>
        <!-- <div class="text-sm text-gray-500 mb-2">
          {{ timeDisplay }}
        </div> -->
        <div class="text-xs text-gray-400 mb-1">
          {{ timeTip }}
        </div>
        <div class="text-xs text-indigo-500 font-semibold min-h-[1.5em]">
          <template v-if="classStatusObj">
            当前课程：
            <span class="font-bold text-blue-700">{{ classStatusObj.name }}</span>
          </template>
          <template v-else>
            {{ classStatusDisplay }}
          </template>
        </div>
        <div v-if="classStatusObj" class="text-xs text-gray-500 mt-1">
          {{ classStatusObj.desc }}
        </div>
    
        <!-- 今日课表小注释（可切换显示，带下拉动效与外框） -->
        <transition name="slide-down" appear>
          <div v-if="showSchedule" class="w-full mt-4 text-left text-sm text-gray-600">
            <div class="schedule-frame p-3 rounded-md">
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs text-gray-400">今日课表</div>
              </div>
              <div>
                <div v-if="todaySchedule && todaySchedule.length" class="space-y-1">
                  <div v-for="(item, idx) in todaySchedule" :key="idx" class="flex justify-between items-center">
                    <div class="text-xs text-gray-500">{{ item.time }}</div>
                    <div class="text-sm font-medium text-gray-800">{{ item.course || '——' }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500">今天没有课程✌好耶</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
  </el-card>
  </transition>
    
    <!-- 笔记展示卡片 -->
  <transition name="card-down" appear mode="out-in">
    <NotesBoard 
      v-show="currentView === 'mytasks'"
      class="w-full max-w-md mx-2 shadow-2xl glass-card transition-all duration-500"
      :notes="notes"
      :loading="notesLoading"
      @refresh="fetchNotes"
    />
    </transition>
  </div>
</template>

<script setup>
// ------------------------- Imports -------------------------
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import { Refresh } from '@element-plus/icons-vue'
// Vanta / THREE not needed after switching to OrbBg
import SplashCursor from '../SplashCursor/SplashCursor.vue'
import StaggeredMenu from '@/StaggeredMenu/StaggeredMenu.vue'
import NotesBoard from '@/components/Index/NotesBoard.vue'
import useAxios from '@/composables/useAxios'
import OrbBg from '@/components/animation/OrbBg.vue'
import { ElMessage } from 'element-plus'

// ------------------------- 3rd-party / instance init -------------------------
const axios = useAxios()

// ------------------------- Refs and simple reactive state -------------------------
// removed Vanta refs after switching to OrbBg
const timeNow = ref(new Date())
const updateTime = () => { timeNow.value = new Date() }
setInterval(updateTime, 1000)

// 检测是否空闲
const lastAppName = ref('');
const lastChangeTime = ref(Date.now());
const idleDesc = ref(false);

// 菜单项/UI 控件引用
const experimental = ref(true); // 是否开启实验性功能
const staggeredMenuRef = ref(null); // StaggeredMenu 组件的引用
// 根据是否移动端决定是否显示外部 Calculator 链接（移动端不显示）
const menuItems = (() => {
  const base = [
    { label: '我的状态', ariaLabel: 'my status', link: 'mystatus' },
    { label: '我的待办', ariaLabel: 'my tasks', link: 'mytasks' }
  ]
  if (!isMobile()) {
    base.push({ label: '我的博客', ariaLabel: 'my blog', link: 'https://blog.tonks.top/' })
  }
  base.push({ label: '联系', ariaLabel: 'contact', link: 'contact' })
  return base
})()

const socialItems = [// 之后再改
 { label: 'Twitter', link: 'https://twitter.com' },
 { label: 'GitHub', link: 'https://github.com' },
 { label: 'LinkedIn', link: 'https://linkedin.com' }
]

// 当前显示的视图类型
const currentView = ref('mystatus') // 'mystatus' 或 'mytasks'

// 本地存储key
const STORAGE_KEY = 'app_status_persist';

// showSchedule 开关，默认 false（关闭），不从 localStorage 恢复
const showSchedule = ref(false)

// card ref
const cardRef = ref(null)

// ------------------------- Static maps / constants -------------------------
const appDescMap = {
  "Electron应用开发": "在开发exe应用中...很可能是综设任务！",
  "操作菜单": "在查看电脑菜单",
  "系统设置":"在编辑电脑的设置",
  "记事本":"可能在修改什么配置文件...",
  "打开方式": "在选择用什么软件打开文件",
  "Microsoft Store": "在浏览应用商店",
  "开始菜单":"在查找什么文件？",
  "FileZilla": "正在管理服务器文件，可能是在更新网站。",
  "睡眠状态": "电脑处于睡眠状态，人也可能处于睡眠状态",
  "锁屏": "暂时离开",
  "电脑-手机助手": "正在看手机？",
  "照片查看器": "浏览照片中...",
  "Windows 终端": "电脑关机了，也许是似了。",
  "命令提示符": "命令行操作中！",
  "视频": "正在刷视频~",
  "Word 文档": "正在编辑Word文档，可能在赶综设报告？",
  "Excel表格": "数据分析师！",
  "PPT演示文稿": "在学习，或者在学习使用ppt",
  "OneNote": "笔记时间",
  "Typora编辑器": "正在编辑Markdown文件，在记笔记吗？",
  "Edge浏览器": "查询资料中...（逛b站的概率大于50%）",
  "VSCode 编辑器": "敲代码中...可能是在写综设项目？",
  "Clash": "正在配置科学上网...",
  "任务管理器": "在查看资源占用情况...",
  "Steam": "正在逛Steam库...在物色新游戏吗？",
  "微信": "与朋友畅聊中...",
  "QQ": "QQ在线中（也可能睡着了）",
  "文件资源管理器": "在整理电脑文件...",
  "QQ音乐": "享受音乐...",
  "XMind思维导图": "头脑风暴...",
  "WPS办公": "WPS办公，效率工具。",
  "WPS PDF": "阅读或编辑PDF文档",
  "WPS文字": "文字编辑",
  "WPS演示": "演示文稿",
  "WPS表格": "表格处理",
  "百度网盘": "龟速下载文件中...",
  "OneDrive": "龟速浏览共享文档中...",
  "Notion": "Notion笔记，知识管理。",
  "Postman": "API测试中...",
  "GitHub Desktop": "正在使用GitHub...",
  "OBS Studio": "录屏/直播中...",
}

// 课程描述
const classDescMap = {
  "软件工程": "学习编写软工文档中",
  "计算机组成原理": "和剑鱼一起学习计组中",
  "综合设计": "坐牢时间",
  "概率论": "和剑鱼一起学概率中",
  "编译原理": "坐牢时间",
  "金融学基础": "坐牢时间",
  "网球": "正在成为电科大网球王",
  "舞蹈鉴赏": "和剑鱼一起在水课享受生活中",
  "形势与政策": "水课"
}

// 学期开始日期（可根据实际调整）
const termStart = new Date(2025, 8, 2) // 2025年9月2日，注意月份0起，9月是8

// 新课表结构，带周次范围
const classTable = [
  // 周一
  {
    2: "软件工程 1-13",
    3: "计算机组成原理 1-14",
    5: "综合设计 1-17"
  },
  // 周二
  {
    1: "概率论 1-15",
    3: "编译原理 1-9",
    5: "金融学基础 1-16"
  },
  // 周三
  {
    2: "网球 1-11",
    3: "软件工程 1-13",
    5: "计算机组成原理 1-14"
  },
  // 周四
  {
    2: "概率论 1-15",
    3: "编译原理 1-8",
    5: "编译原理 9-12"
  },
  // 周五
  {
    3: "舞蹈鉴赏 1-16"
  },
  // 周六
  {
    2: "形势与政策 14-14",
  },
]

// 节次时间段
const classTimeList = [
  { start: "08:30", end: "10:05" }, // 1
  { start: "10:20", end: "11:55" }, // 2
  { start: "14:30", end: "16:05" }, // 3
  { start: "16:20", end: "17:55" }, // 4
  { start: "19:30", end: "21:55" }  // 5
]

// ------------------------- Helper / pure functions -------------------------
// 移动端检测
function isMobile() {
  return /Android|webOS|iPhone|iPod|iPad|BlackBerry|Mobile/i.test(navigator.userAgent)
}

// 解析课程字符串，返回 {name, startWeek, endWeek}
function parseClass(str) {
  if (!str) return null
  const match = str.match(/^(.+?)\s+(\d+)-(\d+)$/)
  if (!match) return { name: str, startWeek: 1, endWeek: 30 }
  return {
    name: match[1],
    startWeek: parseInt(match[2]),
    endWeek: parseInt(match[3])
  }
}

// 计算当前是第几周
function getWeekNumber(date = new Date()) {
  // 获取本周周一
  const day = date.getDay() || 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - day + 1)
  // 距离开学周一的天数
  const diff = monday - termStart
  return diff >= 0 ? Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1 : 1
}

// 工具函数：判断当前节次
function getCurrentClassIndex(now) {
  const pad = n => n.toString().padStart(2, '0')
  const cur = pad(now.getHours()) + ':' + pad(now.getMinutes())
  for (let i = 0; i < classTimeList.length; i++) {
    if (cur >= classTimeList[i].start && cur <= classTimeList[i].end) {
      return i + 1 // 节次从1开始
    }
  }
  return 0
}

// 工具函数：获取当前课程（考虑周次）
function getCurrentClass(now) {
  const day = now.getDay() // 0-6，0为周日
  if (day === 0 || day > 5) return null // 周末无课
  const classIdx = getCurrentClassIndex(now)
  if (!classIdx) return null
  const table = classTable[day - 1]
  const raw = table && table[classIdx]
  if (!raw) return null
  const { name, startWeek, endWeek } = parseClass(raw)
  const week = getWeekNumber(now)
  if (week < startWeek || week > endWeek) return null
  return {
    name,
    desc: classDescMap[name] || '',
    week
  }
}

// ------------------------- Computed / derived state -------------------------
const classStatusObj = computed(() => {
  const c = getCurrentClass(timeNow.value)
  if (c) return c
  return null
})

const appName = ref('')
const appDesc = ref('')
const error = ref(false)
const refreshing = ref(false)

// 笔记相关状态
const notes = ref([])
const notesLoading = ref(false)

// 课表提示
const classStatus = computed(() => {
  const c = getCurrentClass(timeNow.value)
  if (c) {
    return `${c.name}：${c.desc}`
  }
  return ''
})

const classStatusDisplay = computed(() => {
  if (classStatus.value) return `当前课程：${classStatus.value}`
  // 非上课时间段
  const h = timeNow.value.getHours()
  if (h >= 12 && h < 14) return '午休时间'
  if (h >= 18 && h < 19) return '晚餐时间'
  if (h >= 22 || h < 6) return '休息时间'
  return ''
})

// 构造今天的课表供小注释显示
const todaySchedule = computed(() => {
  const now = new Date()
  const day = now.getDay()
  // 周末显示空
  if (day === 0 || day > 5) return []
  const table = classTable[day - 1] || {}
  const week = getWeekNumber(now)
  const result = []
  for (let i = 0; i < classTimeList.length; i++) {
    const slot = classTimeList[i]
    const raw = table[i + 1]
    if (!raw) continue
    const parsed = parseClass(raw)
    if (!parsed) continue
    if (week < parsed.startWeek || week > parsed.endWeek) continue
    // 只添加今天实际有课的时段
    result.push({ time: `${slot.start} - ${slot.end}`, course: parsed.name })
  }
  return result
})

// 课表时间段提示
const timeTip = computed(() => {
  const h = timeNow.value.getHours()
  if (h >= 0 && h < 6) return '夜深了，注意休息'
  if (h >= 6 && h < 8) return '如果不在就是还没起床XD'
  if (h >= 8 && h < 12) return '学习时间'
  if (h >= 12 && h < 14) return '最好在写作业'
  if (h >= 14 && h < 18) return 'Zzz'
  if (h >= 18 && h < 19) return '傍晚放风中...'
  if (h >= 19 && h < 23) return '有可能在写作业'
  return '早点休息'
})

// ------------------------- API / methods -------------------------
// 获取笔记列表（使用正常请求，允许缓存）
const fetchNotes = async () => {
  notesLoading.value = true
  try {
    const res = await axios.get('/getNotes')
    if (res.data.success && res.data.notes) {
      // 按优先级和时间排序
      notes.value = sortNotes(res.data.notes)
    } else {
      notes.value = []
    }
  } catch (error) {
    console.error('获取笔记失败:', error)
    notes.value = []
  }
  notesLoading.value = false
}

// 笔记排序函数
const sortNotes = (notesList) => {
  const priorityMap = { high: 3, medium: 2, low: 1 }
  return notesList.sort((a, b) => {
    // 先按优先级排序（高优先级在前）
    const priorityDiff = (priorityMap[b.importance] || 1) - (priorityMap[a.importance] || 1)
    if (priorityDiff !== 0) return priorityDiff
    // 相同优先级按时间排序（新的在前）
    return (b.date || 0) - (a.date || 0)
  })
}

const fetchAppStatus = async () => {
  refreshing.value = true;
  try {
    const res = await axios.get('/query');
    const data = res.data;
    let currentName = data.success && data.info && data.info.name ? (appDescMap[data.info.name] ? data.info.name : '未登记应用') : '';
    if (currentName !== lastAppName.value) {
      lastAppName.value = currentName;
      lastChangeTime.value = Date.now();
      idleDesc.value = false;
      // 状态变化时写入localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lastAppName: lastAppName.value,
        lastChangeTime: lastChangeTime.value
      }));
    } else if (Date.now() - lastChangeTime.value > 400000) {
      idleDesc.value = true;
    }
    appName.value = currentName;
    appDesc.value = appDescMap[data.info.name] || '在使用没有登记在库的应用，也许在忙别的事';
    error.value = false;
  } catch (_e) {
    console.error('fetchAppStatus error', _e);
    appName.value = '';
    appDesc.value = '可能是似了';
    error.value = true;
  }
  refreshing.value = false;
};

const handleRefresh = async () => {
  fetchAppStatus()
  await nextTick()
  if (cardRef.value && cardRef.value.$el) {
    gsap.fromTo(
      cardRef.value.$el,
      { scale: 0.95 },
      { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }
    )
  }
}

// 菜单 handlers / router
const router = useRouter()
const handleMenuOpen = () => console.log('Menu opened')
const handleMenuClose = () => console.log('Menu closed')
const handleMenuItemClick = (payload) => {
  // payload: { link, item, index }
  const link = payload && payload.link ? payload.link : ''
  if (!link) return

  // 自动关闭菜单
  if (staggeredMenuRef.value && staggeredMenuRef.value.closeMenu) {
    staggeredMenuRef.value.closeMenu();
  }

  // 外部链接：以 http(s):// 开头 或 以 '//' 开头，直接在新标签打开
  if (/^https?:\/\//i.test(link) || link.startsWith('//')) {
    window.open(link, '_blank', 'noopener');
    return
  }

  // 兼容误传 '/https://...' 这种情况：去掉前导斜杠后按外链处理
  if (link.startsWith('/https://') || link.startsWith('/http://')) {
    const fixed = link.replace(/^\//, '')
    window.open(fixed, '_blank', 'noopener');
    return
  }

  // 简单规则：以 '/' 开头使用路由跳转；否则根据link类型切换视图
  if (link.startsWith('/')) {
    router.push(link).catch(() => {})
    return
  } else if (link === 'mystatus' || link === 'mytasks') {
    currentView.value = link
    // 切换到笔记视图时刷新数据
    if (link === 'mytasks') {
      fetchNotes()
    }
    console.log('视图切换到:', link)
  } else {
    ElMessage.info('暂时还没有实现喔')
    console.log('menu item clicked, link:', link)
  }

}

// ------------------------- Lifecycle -------------------------
onMounted(async () => {
  // 检查URL参数来决定初始视图
  const route = useRoute()
  if (route.query.view === 'mytasks') {
    currentView.value = 'mytasks'
  }
  
  // 首次挂载时按正常逻辑读取（允许缓存），随后启动定时轮询
  try {
    await fetchAppStatus()
  } catch {
    console.error('首次获取状态失败')
  }
  try {
    await fetchNotes()
  } catch {
    console.error('首次获取笔记失败')
  }
  // 后续每5秒轮询状态（正常请求），保存 interval id 以便卸载时清除
  // eslint-disable-next-line no-undef
  window.__statusIntervalId = setInterval(() => fetchAppStatus(), 5000)
  await nextTick()
})
onBeforeUnmount(() => {
  // 清除轮询定时器
  try {
    if (window.__statusIntervalId) {
      clearInterval(window.__statusIntervalId)
      window.__statusIntervalId = null
    }
  } catch {
    // ignore
  }
})

// ------------------------- Display computed helpers -------------------------
const appNameDisplay = computed(() => appName.value || '没有打开应用')
const appDescDisplay = computed(() => {
  const h = timeNow.value.getHours()
  if (idleDesc.value) {
      switch (appName.value) {
      case '锁屏':
        return '长时间离开'
      case '电脑-手机助手':
        return '在听网课'
      case 'Windows 终端':
        return h >= 23 || h < 6 ? '睡觉中ZzZ' : appDesc.value
      case '睡眠状态':
        return appDesc.value
      case 'Word 文档':
        return h >= 22 || h < 6 ? '可能在熬夜写报告' : "长时间停留在文档中"
      case 'Excel表格':
        return h >= 22 || h < 6 ? '可能在熬夜做数据分析' : "长时间未操作，大概是在发呆"
      case 'PPT演示文稿':
        return h >= 22 || h < 6 ? '可能在熬夜做演示文稿' : "长时间使用PPT中，也许是在看课件"
      case 'Edge浏览器':
        return h >= 22 || h < 6 ? '长时间一动不动，可能在熬夜看网课' : "很久没有进行任何操作了，可能暂时离开了"
      case 'VSCode 编辑器':
        return h >= 22 || h < 6 ? '可能在熬夜敲代码' : "已经连续敲了很久代码了..."
      case 'QQ':
        return h >= 18 || h < 6 ? '长时间没有任何操作，可能在洗澡？' : "很久没进行任何操作，可能暂时离开了"
      case '未登记应用':
        return '使用该应用已经较长时间'
      default:
        break
    }
    return "这个人很久没动过电脑了，可能暂时离开了"
  }
  return appDesc.value
})

</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 磨砂玻璃风格卡片 */

.glass-card {
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1.5px solid rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  box-sizing: border-box;
  border-radius: 12px; /* increase card corner radius */
}

/* 移动端限制卡片最大宽度，桌面端保留原有 max-w-md */
@media (max-width: 640px) {
  .glass-card {
    max-width: 95vw !important;
  }
}

.el-button[title="刷新状态"],
.el-button[title="刷新待办"],
.refresh-btn {
  z-index: 50 !important;
  cursor: pointer !important;
}

/* 桌面端背景：光圈渐变层，与 OrbBg 叠加 */
.halo-bg {
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0; top: 0;
  background: radial-gradient(circle at 0% 0%, #fff7 0%, #b4aee8 40%, #6fa8dc 70%, #95fbf48e 100%);
  animation: halo-pulse 4s ease-in-out infinite alternate;
  z-index: 0;
}
@keyframes halo-pulse {
  0% { filter: blur(0px) brightness(1); }
  100% { filter: blur(8px) brightness(1.08); }
}
/* 卡片过渡：状态卡从下往上进入（card-up），笔记卡从上往下进入（card-down） */

/* 卡片过渡：enter 更快，leave 更慢
   card-up: 状态卡从下往上进入（向上移动进入）
   card-down: 笔记卡从上往下进入（向下移动进入） */
.card-up-enter-active, .card-down-enter-active {
  transition: opacity 0.22s cubic-bezier(.2,.8,.2,1), transform 0.22s cubic-bezier(.2,.8,.2,1);
}
.card-up-leave-active, .card-down-leave-active {
  transition: opacity 0.44s cubic-bezier(.2,.8,.2,1), transform 0.44s cubic-bezier(.2,.8,.2,1);
}

/* card-up: 初始位于下方（向上移动进入） */
.card-up-enter-from, .card-up-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
.card-up-enter-to, .card-up-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* card-down: 初始位于上方（向下移动进入） */
.card-down-enter-from, .card-down-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}
.card-down-enter-to, .card-down-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 课表下拉动画 */
.slide-down-enter-active {
  /* 课表展开比卡片展开慢 */
  transition: max-height 0.44s cubic-bezier(.2,.8,.2,1), opacity 0.36s ease-in-out;
}
.slide-down-leave-active {
  /* 课表收起比卡片收起快 */
  transition: max-height 0.28s cubic-bezier(.2,.8,.2,1), opacity 0.2s ease-in-out;
}
.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to {
  opacity: 1;
  max-height: 360px; /* enough for several items */
}
.slide-down-leave-from {
  opacity: 1;
  max-height: 360px;
}
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 课表外框，保持磨砂风但边框更明显 */
.schedule-frame {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1.8px solid rgba(99,102,241,0.12); /* subtle colored border */
  box-shadow: 0 6px 18px rgba(2,6,23,0.06);
  overflow: hidden;
}

/* Ensure el-switch shows the intended inactive/active background colors.
   Element Plus sets styles on .el-switch__core and toggles .is-checked on the root.
   Use specific selectors and !important to override theme or utility styles. */
.el-switch .el-switch__core {
  background-color: #BFA1FF !important; /* inactive: 稍深的淡蓝 */
  border-color: rgba(0,0,0,0.06) !important;
}
.el-switch.is-checked .el-switch__core {
  background-color: #80BFFF !important; /* active: 稍深的淡紫 */
}
.el-switch .el-switch__button {
  background-color: #FFFFFF !important;
}
</style>