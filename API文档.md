# Sleepy 服务器 API 接口文档

## 基础信息

- **服务器地址**: `http://your-server-ip:9010`
- **认证方式**: 部分接口需要 `secret` 参数（默认: `tonks`）
- **数据格式**: JSON

## 接口列表

### 1. 获取状态信息

#### GET `/query`
获取当前状态信息

**请求参数**: 无

**响应示例**:
```json
{
    "success": true,
    "status": 0,
    "info": {
        "id": 0,
        "name": "VSCode 编辑器",
        "desc": "目前电脑正在使用的应用",
        "color": "awake"
    },
    "timestamp": 1757551064
}
```

#### Vue + Axios 调用示例:
```javascript
// 在 Vue 组件中
async getStatus() {
  try {
    const response = await this.$http.get('/query');
    console.log('当前状态:', response.data);
    this.currentStatus = response.data;
  } catch (error) {
    console.error('获取状态失败:', error);
  }
}
```

---

### 2. 获取在线人数

#### GET `/online_count`
获取当前在线用户数量（基于5分钟内访问的唯一IP）

**请求参数**: 无

**响应示例**:
```json
{
    "online_count": 3,
    "success": true
}
```

#### Vue + Axios 调用示例:
```javascript
async getOnlineCount() {
  try {
    const response = await this.$http.get('/online_count');
    this.onlineCount = response.data.online_count;
  } catch (error) {
    console.error('获取在线人数失败:', error);
  }
}
```

---

### 3. 笔记管理接口

#### GET `/getNotes`
获取所有笔记列表

**请求参数**: 无

**响应示例**:
```json
{
    "success": true,
    "notes": [
        {
            "notes": "要学习使用tailwindcss",
            "isdone": false,
            "importance": "high",
            "date": 1757551064
        },
        {
            "notes": "记得看编译原理网课",
            "isdone": false,
            "importance": "medium",
            "date": 1757551064
        }
    ]
}
```

#### Vue + Axios 调用示例:
```javascript
async getNotes() {
  try {
    const response = await this.$http.get('/getNotes');
    this.notesList = response.data.notes;
  } catch (error) {
    console.error('获取笔记失败:', error);
  }
}
```

---

#### POST `/notes`
管理笔记（增删改查）

**请求参数**:
- `action` (查询参数): 操作类型，可选值: `add`, `update`, `delete`, `set`
- `secret` (查询参数): 认证密钥，必填
- **请求体**: JSON格式，根据action不同而不同

##### 添加笔记 (action=add)
**请求体**:
```json
{
    "notes": "新的待办事项",
    "isdone": false,
    "importance": "medium",
    "date": 1757552000
}
```

**Vue + Axios 调用示例**:
```javascript
async addNote(noteData) {
  try {
    const response = await this.$http.post('/notes?action=add&secret=tonks', {
      notes: noteData.content,
      isdone: false,
      importance: noteData.importance || 'medium',
      date: Math.floor(Date.now() / 1000) // 当前时间戳
    });
    console.log('添加成功:', response.data);
    await this.getNotes(); // 刷新列表
  } catch (error) {
    console.error('添加笔记失败:', error);
  }
}
```

##### 更新笔记 (action=update)
**请求体**:
```json
{
    "index": 0,
    "isdone": true,
    "importance": "low"
}
```

**Vue + Axios 调用示例**:
```javascript
async updateNote(index, updates) {
  try {
    const response = await this.$http.post('/notes?action=update&secret=tonks', {
      index: index,
      ...updates
    });
    console.log('更新成功:', response.data);
    await this.getNotes(); // 刷新列表
  } catch (error) {
    console.error('更新笔记失败:', error);
  }
}

// 标记完成示例
async markNoteComplete(index) {
  await this.updateNote(index, { isdone: true });
}
```

##### 删除笔记 (action=delete)
**请求体**:
```json
{
    "index": 1
}
```

**Vue + Axios 调用示例**:
```javascript
async deleteNote(index) {
  try {
    const response = await this.$http.post('/notes?action=delete&secret=tonks', {
      index: index
    });
    console.log('删除成功:', response.data);
    await this.getNotes(); // 刷新列表
  } catch (error) {
    console.error('删除笔记失败:', error);
  }
}
```

##### 替换全部笔记 (action=set)
**请求体**:
```json
[
    {
        "notes": "新的第一条笔记",
        "isdone": false,
        "importance": "high",
        "date": 1757553000
    }
]
```

**Vue + Axios 调用示例**:
```javascript
async setAllNotes(newNotes) {
  try {
    const response = await this.$http.post('/notes?action=set&secret=tonks', newNotes);
    console.log('替换成功:', response.data);
    await this.getNotes(); // 刷新列表
  } catch (error) {
    console.error('替换笔记失败:', error);
  }
}
```

---

### 4. 设置状态 (report_app.py 使用)

#### GET `/set`
更新应用状态

**请求参数**:
- `status` (必填): 状态码 (0=正常, 1=锁屏等)
- `app_name` (必填): 应用名称
- `secret` (必填): 认证密钥
- `timestamp` (可选): 时间戳

**响应示例**:
```json
{
    "success": true,
    "code": "OK",
    "set_to": 0,
    "app_name": "VSCode 编辑器"
}
```

---

## Vue 项目完整配置示例

### 1. 安装和配置 Axios

```bash
npm install axios
```

### 2. 在 main.js 中配置

```javascript
import axios from 'axios'
import Vue from 'vue'

// 配置 axios 基础URL
axios.defaults.baseURL = 'http://your-server-ip:9010'
axios.defaults.timeout = 10000

// 添加到 Vue 原型
Vue.prototype.$http = axios

// 或者使用 Vue 3 的方式
// app.config.globalProperties.$http = axios
```

### 3. 在组件中使用示例

```vue
<template>
  <div class="notes-manager">
    <h2>在线人数: {{ onlineCount }}</h2>
    <h3>当前状态: {{ currentStatus?.info?.name }}</h3>
    
    <div class="notes-section">
      <h3>笔记列表</h3>
      
      <!-- 添加新笔记 -->
      <div class="add-note">
        <input v-model="newNote.content" placeholder="输入新笔记">
        <select v-model="newNote.importance">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <button @click="addNote">添加</button>
      </div>
      
      <!-- 笔记列表 -->
      <div v-for="(note, index) in notesList" :key="index" class="note-item">
        <span :class="{ completed: note.isdone }">{{ note.notes }}</span>
        <span class="importance">{{ note.importance }}</span>
        <span class="date">{{ formatDate(note.date) }}</span>
        <button @click="toggleComplete(index)" :class="note.isdone ? 'undo' : 'complete'">
          {{ note.isdone ? '撤销' : '完成' }}
        </button>
        <button @click="deleteNote(index)" class="delete">删除</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotesManager',
  data() {
    return {
      onlineCount: 0,
      currentStatus: null,
      notesList: [],
      newNote: {
        content: '',
        importance: 'medium'
      }
    }
  },
  async mounted() {
    await this.loadData();
    // 定时刷新在线人数和状态
    setInterval(() => {
      this.getOnlineCount();
      this.getStatus();
    }, 30000); // 30秒刷新一次
  },
  methods: {
    async loadData() {
      await Promise.all([
        this.getOnlineCount(),
        this.getStatus(),
        this.getNotes()
      ]);
    },
    
    async getOnlineCount() {
      try {
        const response = await this.$http.get('/online_count');
        this.onlineCount = response.data.online_count;
      } catch (error) {
        console.error('获取在线人数失败:', error);
      }
    },
    
    async getStatus() {
      try {
        const response = await this.$http.get('/query');
        this.currentStatus = response.data;
      } catch (error) {
        console.error('获取状态失败:', error);
      }
    },
    
    async getNotes() {
      try {
        const response = await this.$http.get('/getNotes');
        this.notesList = response.data.notes || [];
      } catch (error) {
        console.error('获取笔记失败:', error);
      }
    },
    
    async addNote() {
      if (!this.newNote.content.trim()) return;
      
      try {
        await this.$http.post('/notes?action=add&secret=tonks', {
          notes: this.newNote.content,
          isdone: false,
          importance: this.newNote.importance,
          date: Math.floor(Date.now() / 1000)
        });
        
        this.newNote.content = '';
        await this.getNotes();
      } catch (error) {
        console.error('添加笔记失败:', error);
        alert('添加失败: ' + (error.response?.data?.message || error.message));
      }
    },
    
    async toggleComplete(index) {
      try {
        const currentStatus = this.notesList[index].isdone;
        await this.$http.post('/notes?action=update&secret=tonks', {
          index: index,
          isdone: !currentStatus
        });
        await this.getNotes();
      } catch (error) {
        console.error('更新笔记失败:', error);
      }
    },
    
    async deleteNote(index) {
      if (!confirm('确定要删除这条笔记吗？')) return;
      
      try {
        await this.$http.post('/notes?action=delete&secret=tonks', {
          index: index
        });
        await this.getNotes();
      } catch (error) {
        console.error('删除笔记失败:', error);
      }
    },
    
    formatDate(timestamp) {
      return new Date(timestamp * 1000).toLocaleString();
    }
  }
}
</script>

<style scoped>
.notes-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.note-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.completed {
  text-decoration: line-through;
  color: #999;
}

.add-note {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-note input {
  flex: 1;
  padding: 8px;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.complete { background-color: #4CAF50; color: white; }
.undo { background-color: #ff9800; color: white; }
.delete { background-color: #f44336; color: white; }
</style>
```

## 错误处理

所有接口可能返回的错误格式:
```json
{
    "success": false,
    "code": "error_type",
    "message": "错误描述"
}
```

常见错误码:
- `not authorized`: 认证失败，检查 secret 参数
- `bad request`: 请求参数错误
- `index out of range`: 笔记索引超出范围

## 注意事项

1. **认证**: `/notes` 接口需要正确的 `secret` 参数
2. **并发安全**: 服务器端已实现写锁，避免数据冲突
3. **时间戳**: 使用Unix时间戳格式 (秒)
4. **重要性等级**: `high` > `medium` > `low`
5. **CORS**: 如果前端域名与服务器不同，需要配置CORS
6. **网络超时**: 建议设置合理的超时时间和重试机制

## 开发建议

1. 使用环境变量管理服务器地址和密钥
2. 实现统一的错误处理和用户提示
3. 添加加载状态和防抖优化
4. 考虑实现乐观更新提升用户体验