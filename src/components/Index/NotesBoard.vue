<template>
  <div class="notes-board-container">
    <!-- 刷新按钮 -->
    <el-button
      class="refresh-btn !absolute right-6 top-6 z-10"
      type="primary"
      circle
      size="large"
      @click="$emit('refresh')"
      :icon="Refresh"
      :loading="loading"
      title="刷新待办"
    />
    

    <div class="flex flex-col items-center py-8 px-6">
      <!-- 头部信息 -->
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-2">我的待办</h2>
        <div class="text-sm text-gray-600">
          {{ notes.length }} 条待办
          <span v-if="completedCount > 0" class="text-green-600 ml-2">
            ({{ completedCount }} 已完成)
          </span>
        </div>
      </div>

      <!-- 待办列表 -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <el-loading-spinner class="text-blue-500" />
        <span class="ml-2 text-gray-500">加载中...</span>
      </div>
      
      <div v-else-if="notes.length === 0" class="text-center py-8">
        <div class="text-gray-400 text-lg mb-2">📋</div>
        <div class="text-gray-500">暂无待办</div>
      </div>

      <div v-else class="w-full space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="(note, index) in sortedNotes"
          :key="index"
          :class="[
            'note-item p-4 rounded-lg border transition-all duration-300',
            getNoteStyles(note)
          ]"
        >
          <!-- 优先级标识 -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span :class="['priority-dot', getPriorityClass(note.importance)]"></span>
              <span class="text-xs text-gray-500">
                {{ formatDate(note.date) }}
              </span>
            </div>
            <div v-if="note.isdone" class="text-green-500 text-sm">✓</div>
          </div>

          <!-- 待办内容 -->
          <div :class="[
            'note-content text-sm leading-relaxed',
            note.isdone ? 'line-through text-gray-400' : 'text-gray-700'
          ]">
            {{ note.notes || '无内容' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])

// 计算已完成的待办数量
const completedCount = computed(() => {
  return props.notes.filter(note => note.isdone).length
})

// 排序：未完成优先显示，已完成始终排在后面；相同状态下按优先度排序（high > medium > low）
const sortedNotes = computed(() => {
  const priorityValue = (p) => {
    if (p === 'high') return 3
    if (p === 'medium') return 2
    return 1
  }
  return props.notes.slice().sort((a, b) => {
    // 未完成 (isdone=false) 应排在前面
    if (a.isdone !== b.isdone) return a.isdone ? 1 : -1
    // 相同完成状态下按优先度（高->低）
    const pa = priorityValue(a.importance)
    const pb = priorityValue(b.importance)
    if (pa !== pb) return pb - pa
    // 最后按时间倒序（新的在前）作为 tiebreaker
    return (b.date || 0) - (a.date || 0)
  })
})

// 获取优先级样式类（只返回颜色类）
const getPriorityClass = (importance) => {
  const map = {
    high: 'priority-high',
    medium: 'priority-medium', 
    low: 'priority-low'
  }
  return map[importance] || 'priority-low'
}

// 获取待办样式
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

// 格式化日期（只显示几月几日）
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

</script>

<style scoped>
.refresh-btn {
  cursor: pointer !important;
  z-index: 100 !important;
  pointer-events: auto !important;
}
.notes-board-container {
  position: relative;
  min-height: 400px;
}

.priority-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.priority-high {
  background-color: #f87171;
}
.priority-medium {
  background-color: #facc15;
}
.priority-low {
  background-color: #4ade80;
}

.note-item {
  transform: translateZ(0);
}

.note-item:hover {
  transform: translateY(-1px);
}

.note-content {
  word-break: break-word;
  line-height: 1.5;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}


/* Desktop: thin, faint scrollbar; deepen on hover */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.28);
  border-radius: 4px;
  transition: background-color 0.18s ease;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.55);
}

/* Mobile: hide scrollbar but allow scrolling */
@media (max-width: 768px) {
  .custom-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

/* 磨砂玻璃效果增强 */
.notes-board-container {
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1.5px solid rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  border-radius: 8px;
}
</style>
