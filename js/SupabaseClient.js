// Supabase クライアントを管理するクラス
class SupabaseClient {
  constructor(supabaseUrl, supabaseKey) {
    this.client = supabase.createClient(supabaseUrl, supabaseKey)
  }

  // アイテム一覧を取得
  async getItems() {
    const { data, error } = await this.client
      .from('item')
      .select('item_id, title')
      .order('item_id', { ascending: true })

    if (error) throw error
    return data || []
  }

  // 単一アイテムを取得
  async getItem(itemId) {
    const { data, error } = await this.client
      .from('item')
      .select('item_id, title, text')
      .eq('item_id', itemId)
      .single()

    if (error) throw error
    return data
  }

  // アイテムに紐づくタグを取得
  async getItemTags(itemId, limit = 5) {
    const { data, error } = await this.client
      .from('taglink')
      .select('tag:tag_id(tag_id, tag)')
      .eq('item_id', itemId)
      .limit(limit)

    if (error) throw error
    return data?.map(t => t.tag) || []
  }

  // 全タグを取得
  async getAllTags() {
    const { data, error } = await this.client
      .from('tag')
      .select('tag_id, tag')
      .order('tag_id', { ascending: true })

    if (error) throw error
    return data || []
  }

  // アイテムを追加
  async addItem(title, text) {
    const { data, error } = await this.client
      .from('item')
      .insert({
        title: title.trim(),
        text: text.trim()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // タグリンクを追加
  async addTagLinks(itemId, tagIds) {
    const tagLinks = tagIds.map(tagId => ({
      item_id: itemId,
      tag_id: tagId
    }))

    const { error } = await this.client
      .from('taglink')
      .insert(tagLinks)

    if (error) throw error
  }
}

export default SupabaseClient