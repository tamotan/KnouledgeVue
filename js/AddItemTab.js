const { ref, onMounted } = Vue

export default {
  name: 'AddItemTab',
  setup() {
    const level1Tags = ref([])
    const level2Tags = ref([])
    const selectedTags = ref(['', '', '', '', ''])
    const visibleTagCount = ref(1)
    const loading = ref(true)
    const error = ref(null)
    const title = ref('')
    const text = ref('')
    const saving = ref(false)

    // レベル別タグを取得
    const fetchTagsByLevel = async () => {
      try {
        loading.value = true
        level1Tags.value = await window.supabaseClient.getTagsByLevel(1)
        level2Tags.value = await window.supabaseClient.getTagsByLevel(2)
      } catch (err) {
        error.value = err.message
        console.error('Error fetching tags by level:', err)
      } finally {
        loading.value = false
      }
    }

    const onTagSelect = (index) => {
      if (selectedTags.value[index] && visibleTagCount.value < 5 && index === visibleTagCount.value - 1) {
        visibleTagCount.value++
      }
    }

    const onTagChange = (index) => {
      if (!selectedTags.value[index] && index < 4) {
        for (let i = index + 1; i < 5; i++) {
          selectedTags.value[i] = ''
        }
        visibleTagCount.value = index + 1
      } else {
        onTagSelect(index)
      }
    }

    const handleCancel = () => {
      title.value = ''
      text.value = ''
      selectedTags.value = ['', '', '', '', '']
      visibleTagCount.value = 1
      error.value = null
    }

    const handleAdd = async () => {
      if (!title.value.trim()) {
        alert('タイトルを入力してください。')
        return
      }

      if (!text.value.trim()) {
        alert('テキストを入力してください。')
        return
      }

      try {
        saving.value = true
        error.value = null

        const newItem = await window.supabaseClient.addItem(title.value, text.value)

        const validTagIds = selectedTags.value.filter(tagId => tagId !== '')

        if (validTagIds.length > 0) {
          await window.supabaseClient.addTagLinks(newItem.item_id, validTagIds)
        }

        alert(`ID [${newItem.item_id}] タイトル [${newItem.title}] が追加されました`)
        handleCancel()

      } catch (err) {
        error.value = err.message
        console.error('Error adding item:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      fetchTagsByLevel()
    })

    return {
      level1Tags,
      level2Tags,
      selectedTags,
      visibleTagCount,
      loading,
      error,
      title,
      text,
      saving,
      onTagChange,
      handleCancel,
      handleAdd
    }
  },
  template: `
    <div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">読み込み中...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        エラー: {{ error }}
      </div>

      <div v-else>
        <div class="mb-3">
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

        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="title"
            :disabled="saving"
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Text</label>
          <textarea 
            class="form-control" 
            rows="6" 
            v-model="text"
            :disabled="saving"
          ></textarea>
        </div>

        <div class="d-flex gap-2">
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleAdd"
            :disabled="saving"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            追加
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleCancel"
            :disabled="saving"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  `
}
