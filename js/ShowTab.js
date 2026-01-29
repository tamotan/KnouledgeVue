const { ref, inject, watch } = Vue

export default {
  name: 'ShowTab',
  setup() {
    const selectedItemId = inject('selectedItemId')
    const item = ref(null)
    const tags = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchItemData = async (itemId) => {
      if (!itemId) {
        item.value = null
        tags.value = []
        return
      }

      try {
        loading.value = true
        error.value = null

        item.value = await window.supabaseClient.getItem(itemId)
        tags.value = await window.supabaseClient.getItemTags(itemId, 5)

      } catch (err) {
        error.value = err.message
        console.error('Error fetching item data:', err)
      } finally {
        loading.value = false
      }
    }

    watch(selectedItemId, (newId) => {
      fetchItemData(newId)
    }, { immediate: true })

    return {
      item,
      tags,
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

      <div v-else-if="!item" class="alert alert-info">
        一覧検索タブからアイテムを選択してください。
      </div>

      <div v-else>
        <div class="mb-2">
          <span 
            v-for="tag in tags" 
            :key="tag.tag_id" 
            class="badge bg-secondary me-1"
          >
            {{ tag.tag }}
          </span>
          <span v-if="tags.length === 0" class="text-muted">タグなし</span>
        </div>

        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" :value="item.title" readonly>
        </div>

        <div>
          <label class="form-label">Text</label>
          <textarea class="form-control" rows="6" :value="item.text" readonly></textarea>
        </div>
      </div>
    </div>
  `
}
