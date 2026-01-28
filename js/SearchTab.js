const { ref, onMounted } = Vue

export default {
  name: 'SearchTab',
  setup() {
    const items = ref([])
    const loading = ref(true)
    const error = ref(null)

    const fetchItems = async () => {
      try {
        loading.value = true
        const { data, error: fetchError } = await window.supabase
          .from('item')
          .select('item_id, title')
          .order('item_id', { ascending: true })

        if (fetchError) throw fetchError

        items.value = data || []
      } catch (err) {
        error.value = err.message
        console.error('Error fetching items:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchItems()
    })

    return {
      items,
      loading,
      error
    }
  },
  template: `
    <div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">読み込み中...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        エラー: {{ error }}
      </div>
      
      <select v-else class="form-select" size="10">
        <option v-for="item in items" :key="item.item_id" :value="item.item_id">
          {{ item.item_id }}: {{ item.title }}
        </option>
      </select>
    </div>
  `
}
