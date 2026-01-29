const { ref, onMounted } = Vue

export default {
  name: 'TagManageTab',
  setup() {
    const tags = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedTagId = ref(null)
    const saving = ref(false)
    
    // フォームの状態
    const isEditMode = ref(false)
    const formTagId = ref('')
    const formTag = ref('')
    const formLevel = ref(2)

    // タグ一覧を取得
    const fetchTags = async () => {
      try {
        loading.value = true
        error.value = null
        tags.value = await window.supabaseClient.getAllTags()
      } catch (err) {
        error.value = err.message
        console.error('Error fetching tags:', err)
      } finally {
        loading.value = false
      }
    }

    // タグを選択
    const selectTag = (tag) => {
      selectedTagId.value = tag.tag_id
      isEditMode.value = true
      formTagId.value = tag.tag_id
      formTag.value = tag.tag
      formLevel.value = tag.level || 2
    }

    // フォームをクリア
    const clearForm = () => {
      isEditMode.value = false
      selectedTagId.value = null
      formTagId.value = ''
      formTag.value = ''
      formLevel.value = 2
      error.value = null
    }

    // タグを追加
    const handleAdd = async () => {
      if (!formTag.value.trim()) {
        alert('タグ名を入力してください。')
        return
      }

      try {
        saving.value = true
        error.value = null

        await window.supabaseClient.addTag(formTag.value, formLevel.value)
        alert('タグが追加されました。')
        
        clearForm()
        await fetchTags()

      } catch (err) {
        error.value = err.message
        console.error('Error adding tag:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    // タグを更新
    const handleUpdate = async () => {
      if (!formTag.value.trim()) {
        alert('タグ名を入力してください。')
        return
      }

      if (!formTagId.value) {
        alert('更新するタグが選択されていません。')
        return
      }

      try {
        saving.value = true
        error.value = null

        await window.supabaseClient.updateTag(formTagId.value, formTag.value, formLevel.value)
        alert('タグが更新されました。')
        
        clearForm()
        await fetchTags()

      } catch (err) {
        error.value = err.message
        console.error('Error updating tag:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    // タグを削除
    const handleDelete = async () => {
      if (!formTagId.value) {
        alert('削除するタグが選択されていません。')
        return
      }

      if (!confirm(`タグ ID [${formTagId.value}] を削除してもよろしいですか？`)) {
        return
      }

      try {
        saving.value = true
        error.value = null

        await window.supabaseClient.deleteTag(formTagId.value)
        alert('タグが削除されました。')
        
        clearForm()
        await fetchTags()

      } catch (err) {
        error.value = err.message
        console.error('Error deleting tag:', err)
        alert(`エラーが発生しました: ${err.message}`)
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      fetchTags()
    })

    return {
      tags,
      loading,
      error,
      selectedTagId,
      saving,
      isEditMode,
      formTagId,
      formTag,
      formLevel,
      selectTag,
      clearForm,
      handleAdd,
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

      <div v-else>
        <!-- タグ一覧テーブル -->
        <div class="mb-3">
          <h5>タグ一覧</h5>
          <div v-if="error" class="alert alert-danger">
            エラー: {{ error }}
          </div>
          
          <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
            <table class="table table-bordered table-hover table-sm">
              <thead class="table-light sticky-top">
                <tr>
                  <th style="width: 100px; text-align: center;">ID</th>
                  <th>タグ名</th>
                  <th style="width: 100px; text-align: center;">Level</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="tag in tags" 
                  :key="tag.tag_id"
                  :class="{ 'table-active': selectedTagId === tag.tag_id }"
                  @click="selectTag(tag)"
                  style="cursor: pointer;"
                >
                  <td style="text-align: right;">{{ tag.tag_id }}</td>
                  <td>{{ tag.tag }}</td>
                  <td style="text-align: right;">{{ tag.level }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- タグ追加・編集フォーム -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ isEditMode ? 'タグ編集' : 'タグ追加' }}</h5>
          </div>
          <div class="card-body">
            <div class="mb-3" v-if="isEditMode">
              <label class="form-label">ID</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formTagId"
                readonly
                disabled
              >
            </div>

            <div class="mb-3">
              <label class="form-label">タグ名</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formTag"
                :disabled="saving"
                placeholder="タグ名を入力"
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Level</label>
              <input 
                type="number" 
                class="form-control" 
                v-model.number="formLevel"
                :disabled="saving"
                placeholder="レベル (数値)"
                min="1"
                max="2"
              >
              <div class="form-text">1 〜 2 の範囲で入力してください</div>
            </div>

            <div class="d-flex gap-2">
              <button 
                v-if="!isEditMode"
                type="button" 
                class="btn btn-primary" 
                @click="handleAdd"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                追加
              </button>

              <button 
                v-if="isEditMode"
                type="button" 
                class="btn btn-success" 
                @click="handleUpdate"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                更新
              </button>

              <button 
                v-if="isEditMode"
                type="button" 
                class="btn btn-danger" 
                @click="handleDelete"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                削除
              </button>

              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="clearForm"
                :disabled="saving"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}