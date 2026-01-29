const { ref, inject, watch, onMounted } = Vue

export default {
  name: 'ShowTab',
  setup() {
    const selectedItemId = inject('selectedItemId')
    const item = ref(null)
    const tags = ref([])
    const level1Tags = ref([])
    const level2Tags = ref([])
    const loading = ref(false)
    const error = ref(null)
    const saving = ref(false)

    // 編集モード
    const isEditMode = ref(false)
    const editTitle = ref('')
    const editText = ref('')
    const selectedTags = ref(['', '', '', '', ''])
    const visibleTagCount = ref(1)

    // レベル別タグを取得
    const fetchTagsByLevel = async () => {
      try {
        level1Tags.value = await window.supabaseClient.getTagsByLevel(1)
        level2Tags.value = await window.supabaseClient.getTagsByLevel(2)
      } catch (err) {
        console.error('Error fetching tags by level:', err)
      }
    }

    const fetchItemData = async (itemId) => {
      if (!itemId) {
        item.value = null
        tags.value = []
        isEditMode.value = false
        return
      }

      try {
        loading.value = true
        error.value = null

        item.value = await window.supabaseClient.getItem(itemId)
        tags.value = await window.supabaseClient.getItemTags(itemId, 5)

        // 編集モードをリセット
        isEditMode.value = false

      } catch (err) {
        error.value = err.message
        console.error('Error fetching item data:', err)
      } finally {
        loading.value = false
      }
    }

    // 編集モードに切り替え
    const startEdit = () => {
      if (!item.value) return

      isEditMode.value = true
      editTitle.value = item.value.title
      editText.value = item.value.text

      // タグを設定
      selectedTags.value = ['', '', '', '', '']
      visibleTagCount.value = 1

      if (tags.value.length > 0) {
        tags.value.forEach((tag, index) => {
          if (index < 5) {
            selectedTags.value[index] = tag.tag_id
          }
        })
        visibleTagCount.value = Math.min(tags.value.length + 1, 5)
      }
    }

    // 編集をキャンセル
    const cancelEdit = () => {
      isEditMode.value = false
      editTitle.value = ''
      editText.value = ''
      selectedTags.value = ['', '', '', '', '']
      visibleTagCount.value = 1
      error.value = null
    }

    // タグの変更処理
    const onTagChange = (index) => {
      if (!selectedTags.value[index] && index < 4) {
        for (let i = index + 1; i < 5; i++) {
          selectedTags.value[i] = ''
        }
        visibleTagCount.value = index + 1
      } else if (selectedTags.value[index] && visibleTagCount.value < 5 && index === visibleTagCount.value - 1) {
        visibleTagCount.value++
      }
    }

    // アイテムを更新
    const handleUpdate = async () => {
      if (!item.value) return

      if (!editTitle.value.trim()) {
        alert('タイトルを入力してください。')
        return
      }

      if (!editText.value.trim()) {
        alert('テキストを入力してください。')
        return
      }

      if (!confirm(`[${editTitle.value}] を更新します。`)) {
        return
      }

      try {
        saving.value = true
        error.value = null

        // アイテムを更新
        await window.supabaseClient.updateItem(
          item.value.item_id,
          editTitle.value,
          editText.value
        )

        // タグを更新
        const validTagIds = selectedTags.value.filter(tagId => tagId !== '')
        await window.supabaseClient.updateTagLinks(item.value.item_id, validTagIds)

        // データを再取得
        await fetchItemData(item.value.item_id)

      } catch (err) {
        error.value = err.message
        console.error('Error updating item:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    // アイテムを削除
    const handleDelete = async () => {
      if (!item.value) return

      if (!confirm(`[${item.value.title}] を削除してもよろしいですか？`)) {
        return
      }

      try {
        saving.value = true
        error.value = null

        // タグリンクを削除
        await window.supabaseClient.deleteTagLinks(item.value.item_id)

        // アイテムを削除
        await window.supabaseClient.deleteItem(item.value.item_id)

        alert('アイテムが削除されました。')

        // 表示をクリア
        item.value = null
        tags.value = []
        isEditMode.value = false

      } catch (err) {
        error.value = err.message
        console.error('Error deleting item:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    watch(selectedItemId, (newId) => {
      fetchItemData(newId)
    }, { immediate: true })

    onMounted(() => {
      fetchTagsByLevel()
    })

    return {
      item,
      tags,
      level1Tags,
      level2Tags,
      loading,
      error,
      saving,
      isEditMode,
      editTitle,
      editText,
      selectedTags,
      visibleTagCount,
      startEdit,
      cancelEdit,
      onTagChange,
      handleUpdate,
      handleDelete
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

      <!-- 表示モード -->
      <div v-else-if="!isEditMode">
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

        <div class="mb-3">
          <label class="form-label">Text</label>
          <textarea class="form-control" rows="6" :value="item.text" readonly></textarea>
        </div>

        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary" @click="startEdit">
            編集
          </button>
          <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            削除
          </button>
        </div>
      </div>

      <!-- 編集モード -->
      <div v-else>
        <div class="mb-3">
          <label class="form-label">タグ</label>
          <div>
            <!-- タグ1: Level 1のタグのみ -->
            <select 
              v-model="selectedTags[0]"
              @change="onTagChange(0)"
              class="form-select d-inline-block w-auto me-2"
              :disabled="saving"
            >
              <option value="">-- タグを選択 --</option>
              <option 
                v-for="tag in level1Tags" 
                :key="tag.tag_id" 
                :value="tag.tag_id"
              >
                {{ tag.tag }}
              </option>
            </select>

            <!-- タグ2: Level 2のタグのみ -->
            <select 
              v-if="visibleTagCount >= 2"
              v-model="selectedTags[1]"
              @change="onTagChange(1)"
              class="form-select d-inline-block w-auto me-2"
              :disabled="saving"
            >
              <option value="">なし</option>
              <option 
                v-for="tag in level2Tags" 
                :key="tag.tag_id" 
                :value="tag.tag_id"
              >
                {{ tag.tag }}
              </option>
            </select>

            <!-- タグ3: Level 2のタグのみ -->
            <select 
              v-if="visibleTagCount >= 3"
              v-model="selectedTags[2]"
              @change="onTagChange(2)"
              class="form-select d-inline-block w-auto me-2"
              :disabled="saving"
            >
              <option value="">なし</option>
              <option 
                v-for="tag in level2Tags" 
                :key="tag.tag_id" 
                :value="tag.tag_id"
              >
                {{ tag.tag }}
              </option>
            </select>

            <!-- タグ4: Level 2のタグのみ -->
            <select 
              v-if="visibleTagCount >= 4"
              v-model="selectedTags[3]"
              @change="onTagChange(3)"
              class="form-select d-inline-block w-auto me-2"
              :disabled="saving"
            >
              <option value="">なし</option>
              <option 
                v-for="tag in level2Tags" 
                :key="tag.tag_id" 
                :value="tag.tag_id"
              >
                {{ tag.tag }}
              </option>
            </select>

            <!-- タグ5: Level 2のタグのみ -->
            <select 
              v-if="visibleTagCount >= 5"
              v-model="selectedTags[4]"
              @change="onTagChange(4)"
              class="form-select d-inline-block w-auto"
              :disabled="saving"
            >
              <option value="">なし</option>
              <option 
                v-for="tag in level2Tags" 
                :key="tag.tag_id" 
                :value="tag.tag_id"
              >
                {{ tag.tag }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="editTitle"
            :disabled="saving"
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Text</label>
          <textarea 
            class="form-control" 
            rows="6" 
            v-model="editText"
            :disabled="saving"
          ></textarea>
        </div>

        <div class="d-flex gap-2">
          <button 
            type="button" 
            class="btn btn-success" 
            @click="handleUpdate"
            :disabled="saving"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            更新
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="cancelEdit"
            :disabled="saving"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  `
}
