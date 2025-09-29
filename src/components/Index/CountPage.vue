<template>
	<div>
		<div v-if="loading">正在获取在线人数...</div>
		<div v-else-if="error">获取失败</div>
		<div v-else>{{ count }}: ({{ mobileCount }})</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useAxios from '@/composables/useAxios'
const axios = useAxios()
const count = ref(0)
const mobileCount = ref(0)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
	loading.value = true
	error.value = false
	try {
		const res = await axios.get('/online_count')
		if (res.data && res.data.success) {
			count.value = res.data.online_count
			mobileCount.value = res.data.mobile_count
		} else {
			error.value = true
		}
	} catch {
		error.value = true
	}
	loading.value = false
})
</script>
