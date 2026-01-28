const { ref, onMounted } = Vue

export default {
  name: 'AddItemTab',
  setup() {
    const allTags = ref([])
    const selectedTags = ref(['', '', '', '', ''])
    const visibleTagCount = ref(1)
    const loading = ref(true)
    const error = ref(null)
    const title = ref('')
    const text = ref('')
    const saving = ref(false)

    // データベースからタグ一覧を取得
    const fetchTags = async () => {
      try {
        loading.value = true
        const { data, error: fetchError } = await window.supabase
          .from('tag')
          .select('tag_id, tag')
          .order('tag_id', { ascending: true })

        if (fetchError) throw fetchError

        allTags.value = data || []
      } catch (err) {
        error.value = err.message
        console.error('Error fetching tags:', err)
      } finally {
        loading.value = false
      }
    }

    // タグが選択されたときの処理
    const onTagSelect = (index) => {
      // 選択されたタグが有効で、次のタグがまだ表示されていない場合
      if (selectedTags.value[index] && visibleTagCount.value < 5 && index === visibleTagCount.value - 1) {
        visibleTagCount.value++
      }
    }

    // タグが「なし」に変更されたときの処理
    const onTagChange = (index) => {
      // 「なし」が選択された場合、それ以降のタグをリセット
      if (!selectedTags.value[index] && index < 4) {
        // 後続のタグをクリア
        for (let i = index + 1; i < 5; i++) {
          selectedTags.value[i] = ''
        }
        // 表示数を調整
        visibleTagCount.value = index + 1
      } else {
        // タグが選択された場合、次のタグを表示
        onTagSelect(index)
      }
    }

    // キャンセル処理
    const handleCancel = () => {
      title.value = ''
      text.value = ''
      selectedTags.value = ['', '', '', '', '']
      visibleTagCount.value = 1
      error.value = null
    }

    // 追加処理
    const handleAdd = async () => {
      // バリデーション
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

        // itemテーブルに追加
        const { data: newItem, error: itemError } = await window.supabase
          .from('item')
          .insert({
            title: title.value.trim(),
            text: text.value.trim()
          })
          .select()
          .single()

        if (itemError) throw itemError

        // 選択されたタグのみを抽出（空でないもの）
        const validTagIds = selectedTags.value.filter(tagId => tagId !== '')

        // taglinkテーブルに追加
        if (validTagIds.length > 0) {
          const tagLinks = validTagIds.map(tagId => ({
            item_id: newItem.item_id,
            tag_id: tagId
          }))

          const { error: taglinkError } = await window.supabase
            .from('taglink')
            .insert(tagLinks)

          if (taglinkError) throw taglinkError
        }

        // 成功メッセージ
        alert(`ID [${newItem.item_id}] タイトル [${newItem.title}] が追加されました`)

        // フォームをクリア
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
      fetchTags()
    })

    return {
      allTags,
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
          <!-- タグ1 -->
          <select 
            v-model="selectedTags[0]"
            @change="onTagChange(0)"
            class="form-select d-inline-block w-auto me-2"
            :disabled="saving"
          >
            <option value="">-- タグを選択 --</option>
            <option 
              v-for="tag in allTags" 
              :key="tag.tag_id" 
              :value="tag.tag_id"
            >
              {{ tag.tag }}
            </option>
          </select>

          <!-- タグ2 -->
          <select 
            v-if="visibleTagCount >= 2"
            v-model="selectedTags[1]"
            @change="onTagChange(1)"
            class="form-select d-inline-block w-auto me-2"
            :disabled="saving"
          >
            <option value="">なし</option>
            <option 
              v-for="tag in allTags" 
              :key="tag.tag_id" 
              :value="tag.tag_id"
            >
              {{ tag.tag }}
            </option>
          </select>

          <!-- タグ3 -->
          <select 
            v-if="visibleTagCount >= 3"
            v-model="selectedTags[2]"
            @change="onTagChange(2)"
            class="form-select d-inline-block w-auto me-2"
            :disabled="saving"
          >
            <option value="">なし</option>
            <option 
              v-for="tag in allTags" 
              :key="tag.tag_id" 
              :value="tag.tag_id"
            >
              {{ tag.tag }}
            </option>
          </select>

          <!-- タグ4 -->
          <select 
            v-if="visibleTagCount >= 4"
            v-model="selectedTags[3]"
            @change="onTagChange(3)"
            class="form-select d-inline-block w-auto me-2"
            :disabled="saving"
          >
            <option value="">なし</option>
            <option 
              v-for="tag in allTags" 
              :key="tag.tag_id" 
              :value="tag.tag_id"
            >
              {{ tag.tag }}
            </option>
          </select>

          <!-- タグ5 -->
          <select 
            v-if="visibleTagCount >= 5"
            v-model="selectedTags[4]"
            @change="onTagChange(4)"
            class="form-select d-inline-block w-auto"
            :disabled="saving"
          >
            <option value="">なし</option>
            <option 
              v-for="tag in allTags" 
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
