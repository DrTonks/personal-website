<template>
  <div
    ref="vantaRef"
    class="min-h-screen flex items-center justify-center transition-all duration-500 relative"
  >

    <!-- 背景设置（与IndexPage一致） -->
    <template v-if="!isMobile()">
      <div v-if="showWavesBg" ref="wavesBgRef" class="absolute inset-0 z-0"></div>
      <HaloBg v-else class="absolute inset-0 z-0" />
    </template>
    <!-- 移动端图片背景 -->
    <div v-else class="absolute inset-0 z-0 mobile-bg" style="background-image: url('/assets/ph-bg.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; min-height: 100vh;"></div>
    
    <!-- 实验性背景 -->
    <SplashCursor
      v-if="experimental"
      :SIM_RESOLUTION="128"
      :DYE_RESOLUTION="1440"
      :CAPTURE_RESOLUTION="512"
      :DENSITY_DISSIPATION="3.5"
      :VELOCITY_DISSIPATION="2"
      :PRESSURE="0.1"
      :PRESSURE_ITERATIONS="20"
      :CURL="3"
      :SPLAT_RADIUS="0.2"
      :SPLAT_FORCE="6000"
      :SHADING="true"
      :COLOR_UPDATE_SPEED="10"
      :BACK_COLOR="{ r: 0.5, g: 0, b: 0 }"
      :TRANSPARENT="true"
    />
    <el-card class="w-full max-w-lg mx-4 shadow-2xl glass-card relative">
      <div class="flex flex-col gap-6">
        <!-- 顶部展示所有笔记 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <el-button
            type="warning"
            size="large"
            :loading="sleepingReporting"
            @click="reportSleep"
            >
            编辑
            </el-button>
          <CountPage />
          <el-button type="success" @click="startAdd" :icon="Plus" size="large">新增</el-button>
          </div>
          <div v-if="notesLoading" class="flex justify-center items-center py-8">
            <el-loading-spinner class="text-blue-500" />
            <span class="ml-2 text-gray-500">加载中...</span>
          </div>
          <div v-else-if="notesArr.length === 0" class="text-center py-8">
            <div class="text-gray-400 text-lg mb-2">📋</div>
            <div class="text-gray-500">暂无笔记</div>
          </div>
          <div v-else class="w-full space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="(note, idx) in notesArr"
              :key="idx"
              :class="[
                'note-item p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-md',
                getNoteStyles(note),
                idx === editingIndex ? 'ring-2 ring-blue-400' : ''
              ]"
              @click="startEdit(idx)"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span :class="['priority-badge', getPriorityClass(note.importance)]">
                    {{ getPriorityText(note.importance) }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(note.date) }}
                  </span>
                </div>
                <div v-if="note.isdone" class="text-green-500 text-sm">✓</div>
                <el-button type="danger" size="small" @click.stop="deleteNote(idx)" :icon="Delete">删除</el-button>
              </div>
              <div :class="[
                'note-content text-sm leading-relaxed',
                note.isdone ? 'line-through text-gray-400' : 'text-gray-700'
              ]">
                {{ note.notes || '无内容' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑/新增表单区 -->
        <div v-if="editingIndex !== null || isAdding" class="mt-4">
          <el-form :model="noteForm" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="笔记内容" prop="notes">
              <el-input
                v-model="noteForm.notes"
                type="textarea"
                :rows="6"
                placeholder="请输入笔记内容..."
                maxlength="500"
                show-word-limit
                resize="none"
              />
            </el-form-item>
            <el-form-item label="优先级" prop="importance">
              <el-radio-group v-model="noteForm.importance" class="w-full">
                <el-radio-button label="high" class="flex-1 text-center">
                  <span class="text-red-600">🔴 高</span>
                </el-radio-button>
                <el-radio-button label="medium" class="flex-1 text-center">
                  <span class="text-yellow-600">🟡 中</span>
                </el-radio-button>
                <el-radio-button label="low" class="flex-1 text-center">
                  <span class="text-green-600">🟢 低</span>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch
                v-model="noteForm.isdone"
                active-text="已完成"
                inactive-text="未完成"
                active-color="#67c23a"
                inactive-color="#dcdfe6"
              />
            </el-form-item>
            <el-form-item v-if="noteForm.date" label="创建时间">
              <el-input :value="formatDateTime(noteForm.date)" readonly>
                <template #prefix>
                  <el-icon><Clock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <div class="flex justify-end gap-2 mt-4">
            <el-button @click="cancelEdit" size="large">取消</el-button>
            <el-button type="primary" size="large" @click="saveNote" :loading="saving" :icon="Check" >
              {{ isAdding ? '创建笔记' : '保存修改' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, defineComponent, h } from 'vue'
import * as THREE from 'three'
import WAVES from 'vanta/dist/vanta.waves.min'
import {  Check, Delete, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SplashCursor from '@/SplashCursor/SplashCursor.vue'
import useAxios from '@/composables/useAxios'
import CountPage from './Index/CountPage.vue'

const axios = useAxios()

// 背景相关（复制自IndexPage）
const experimental = ref(false)
const vantaRef = ref(null)
const wavesBgRef = ref(null)
let vantaEffect = null

// 移动端检测
function isMobile() {
  return /Android|webOS|iPhone|iPod|iPad|BlackBerry|Mobile/i.test(navigator.userAgent)
}

// 动画映射
const vantaMap = {
  waves: WAVES
}

const HaloBg = defineComponent({
  name: 'HaloBg',
  setup() {
    return () => h('div', { class: 'halo-bg' })
  }
})

// 根据时间段返回动画参数
function getWavesParamsByHour(hour) {
  if (hour >= 6 && hour < 12) {
    return {
      color: 0x6fa8dc,
      shininess: 20,
      waveHeight: 8,
      waveSpeed: 0.07,
      zoom: 0.85,
      backgroundColor: 0xf5f7fa
    }
  }
  if (hour >= 12 && hour < 18) {
    return {
      color: 0xb4aee8,
      shininess: 10,
      waveHeight: 5,
      waveSpeed: 0.09,
      zoom: 0.8,
      backgroundColor: 0xf7f5fa
    }
  }
  if (hour >= 18 && hour < 23) {
    return {
      color: 0x222233,
      shininess: 8,
      waveHeight: 10,
      waveSpeed: 0.05,
      zoom: 0.8,
      backgroundColor: 0x181a2a
    }
  }
  return {
    color: 0x181a2a,
    shininess: 5,
    waveHeight: 4,
    waveSpeed: 0.03,
    zoom: 0.75,
    backgroundColor: 0x10111a
  }
}

const wavesParams = ref(getWavesParamsByHour(new Date().getHours()))

// 判断是否显示waves动画（暂时取消）
const showWavesBg = computed(() => {
  const d = new Date().getDay()
  return d === 8
})

// 上报睡眠状态
const sleepingReporting = ref(false)
const reportSleep = async () => {
  if (sleepingReporting.value) return
  sleepingReporting.value = true
  try {
    await axios.get('/set', { params: { secret: 'tonks', status: 0, app_name: '睡眠状态', timestamp: Math.floor(Date.now() / 1000) } })
    ElMessage.error('编辑失败')
  } catch (err) {
    ElMessage.error('上报失败')
    console.error('reportSleep error', err)
  }
  sleepingReporting.value = false
}

// 设置背景动画
async function setVantaEffect() {
  await nextTick()
  if (vantaEffect) {
    vantaEffect.destroy()
    vantaEffect = null
  }
  if (wavesBgRef.value && showWavesBg.value) {
    vantaEffect = vantaMap['waves']({
      el: wavesBgRef.value,
      THREE,
      mouseControls: true,
      touchControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 0.5,
      scaleMobile: 0.5,
      ...wavesParams.value
    })
  }
}


// 笔记管理逻辑
const notesArr = ref([])
const notesLoading = ref(false)
const formRef = ref(null)
const saving = ref(false)
const editingIndex = ref(null) // 当前编辑的索引
const isAdding = ref(false)

const noteForm = reactive({
  notes: '',
  importance: 'medium',
  isdone: false,
  date: null
})

const rules = {
  notes: [
    { required: true, message: '请输入笔记内容', trigger: 'blur' },
    { min: 1, max: 500, message: '笔记内容长度在1到500个字符', trigger: 'blur' }
  ],
  importance: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 加载所有笔记
const fetchNotes = async () => {
  notesLoading.value = true
  try {
    const res = await axios.get('/getNotes')
    if (res.data.success && res.data.notes) {
      notesArr.value = res.data.notes.slice()
    } else {
      notesArr.value = []
    }
  } catch (error) {
    notesArr.value = []
    ElMessage.error('加载笔记失败:', error.message)
  }
  notesLoading.value = false
}

onMounted(async () => {
  if (!isMobile() && showWavesBg.value) {
    await setVantaEffect()
  }
  await fetchNotes()
})

// 编辑某条笔记
const startEdit = (idx) => {
  isAdding.value = false
  editingIndex.value = idx
  const note = notesArr.value[idx]
  noteForm.notes = note.notes
  noteForm.importance = note.importance
  noteForm.isdone = note.isdone
  noteForm.date = note.date
}

// 新增笔记
const startAdd = () => {
  isAdding.value = true
  editingIndex.value = null
  noteForm.notes = ''
  noteForm.importance = 'medium'
  noteForm.isdone = false
  noteForm.date = Math.floor(Date.now() / 1000)
}

// 取消编辑/新增
const cancelEdit = () => {
  isAdding.value = false
  editingIndex.value = null
  noteForm.notes = ''
  noteForm.importance = 'medium'
  noteForm.isdone = false
  noteForm.date = null
}

// 保存笔记（编辑或新增）
const saveNote = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isAdding.value) {
      // 新增
      await axios.post('/notes?action=add&secret=tonks', {
        notes: noteForm.notes,
        importance: noteForm.importance,
        isdone: noteForm.isdone,
        date: noteForm.date || Math.floor(Date.now() / 1000)
      })
      ElMessage.success('笔记创建成功')
    } else if (editingIndex.value !== null) {
      // 编辑
      await axios.post('/notes?action=update&secret=tonks', {
        index: editingIndex.value,
        notes: noteForm.notes,
        importance: noteForm.importance,
        isdone: noteForm.isdone
      })
      ElMessage.success('笔记更新成功')
    }
    await fetchNotes()
    cancelEdit()
  } catch (error) {
    ElMessage.error('保存失败，请重试:', error.message)
  }
  saving.value = false
}

// 删除笔记
const deleteNote = async (idx) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条笔记吗？此操作不可撤销。',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await axios.post('/notes?action=delete&secret=tonks', {
      index: idx
    })
    ElMessage.success('笔记删除成功')
    await fetchNotes()
    cancelEdit()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 优先级样式和文本
const getPriorityClass = (importance) => {
  const map = {
    high: 'priority-high',
    medium: 'priority-medium', 
    low: 'priority-low'
  }
  return map[importance] || 'priority-low'
}
const getPriorityText = (importance) => {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[importance] || '低'
}
const getNoteStyles = (note) => {
  const baseClass = 'bg-white/70 backdrop-blur-sm'
  if (note.isdone) {
    return `${baseClass} border-gray-200 opacity-75`
  }
  const priorityBorderMap = {
    high: 'border-red-200 hover:border-red-300',
    medium: 'border-yellow-200 hover:border-yellow-300',
    low: 'border-green-200 hover:border-green-300'
  }
  return `${baseClass} ${priorityBorderMap[note.importance] || priorityBorderMap.low}`
}
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date
  if (diff < 24 * 60 * 60 * 1000) {
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`
    }
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 时间更新监听
let lastHour = new Date().getHours()
let lastDay = new Date().getDay()
setInterval(() => {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  
  if (hour !== lastHour || day !== lastDay) {
    lastHour = hour
    lastDay = day
    const newParams = getWavesParamsByHour(hour)
    wavesParams.value = newParams
    setVantaEffect()
  }
}, 60000) // 每分钟检查一次
</script>

<style scoped>
/* 磨砂玻璃风格卡片（与IndexPage保持一致） */
.glass-card {
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1.5px solid rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
}

/* 光圈背景 */
.halo-bg {
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0; 
  top: 0;
  background: radial-gradient(circle at 0% 0%, #fff7 0%, #b4aee8 40%, #6fa8dc 70%, #222233 100%);
  animation: halo-pulse 4s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes halo-pulse {
  0% { filter: blur(0px) brightness(1); }
  100% { filter: blur(8px) brightness(1.1); }
}

/* 优先级按钮样式优化 */
:deep(.el-radio-button__inner) {
  padding: 12px 16px;
  border-radius: 8px !important;
  border: 1px solid #dcdfe6;
  margin: 0 4px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6;
  border-radius: 8px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

/* 表单项间距优化 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-bg {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
  }
  
  /* 移动端表单优化 */
  :deep(.el-radio-button__inner) {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  :deep(.el-button--large) {
    padding: 10px 16px;
  }
}
</style>
