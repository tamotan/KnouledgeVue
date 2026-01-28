const { ref, onMounted, inject } = Vue

export default {
  name: 'SearchTab',
  setup() {
    const items = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedItemId = ref(null)
    
    // app.jsから関数を取得
    const switchToShowTab = inject('switchToShowTab')

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

    const selectItem = (itemId) => {
      selectedItemId.value = itemId
    }

    const handleDoubleClick = (itemId) => {
      switchToShowTab(itemId)
    }

    onMounted(() => {
      fetchItems()
    })

    return {
      items,
      loading,
      error,
      selectedItemId,
      selectItem,
      handleDoubleClick
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
      
      <div v-else class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="table table-bordered table-hover">
          <thead class="table-light sticky-top">
            <tr>
              <th style="width: 100px; text-align: center;">ID</th>
              <th>TITLE</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in items" 
              :key="item.item_id"
              :class="{ 'table-active': selectedItemId === item.item_id }"
              @click="selectItem(item.item_id)"
              @dblclick="handleDoubleClick(item.item_id)"
              style="cursor: pointer;"
            >
              <td style="text-align: right;">{{ item.item_id }}</td>
              <td>{{ item.title }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
