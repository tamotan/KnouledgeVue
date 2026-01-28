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
      onTagChange
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
          <input type="text" class="form-control" v-model="title">
        </div>

        <div>
          <label class="form-label">Text</label>
          <textarea class="form-control" rows="6" v-model="text"></textarea>
        </div>
      </div>
    </div>
  `
}
