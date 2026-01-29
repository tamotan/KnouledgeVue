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
      .select('tag:tag_id(tag_id, tag, level)')
      .eq('item_id', itemId)
      .limit(limit)

    if (error) throw error
    return data?.map(t => t.tag) || []
  }

  // 全タグを取得
  async getAllTags() {
    const { data, error } = await this.client
      .from('tag')
      .select('tag_id, tag, level')
      .order('tag_id', { ascending: true })

    if (error) throw error
    return data || []
  }

  // レベル指定でタグを取得
  async getTagsByLevel(level) {
    const { data, error } = await this.client
      .from('tag')
      .select('tag_id, tag, level')
      .eq('level', level)
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

  // アイテムを更新
  async updateItem(itemId, title, text) {
    const { data, error } = await this.client
      .from('item')
      .update({
        title: title.trim(),
        text: text.trim()
      })
      .eq('item_id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // アイテムを削除
  async deleteItem(itemId) {
    const { error } = await this.client
      .from('item')
      .delete()
      .eq('item_id', itemId)

    if (error) throw error
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

  // タグリンクを削除
  async deleteTagLinks(itemId) {
    const { error } = await this.client
      .from('taglink')
      .delete()
      .eq('item_id', itemId)

    if (error) throw error
  }

  // タグリンクを更新（削除してから追加）
  async updateTagLinks(itemId, tagIds) {
    // 既存のタグリンクを削除
    await this.deleteTagLinks(itemId)

    // 新しいタグリンクを追加
    if (tagIds.length > 0) {
      await this.addTagLinks(itemId, tagIds)
    }
  }

  // タグを追加
  async addTag(tagName, level) {
    const { data, error } = await this.client
      .from('tag')
      .insert({
        tag: tagName.trim(),
        level: level
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // タグを更新
  async updateTag(tagId, tagName, level) {
    const { data, error } = await this.client
      .from('tag')
      .update({
        tag: tagName.trim(),
        level: level
      })
      .eq('tag_id', tagId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // タグを削除
  async deleteTag(tagId) {
    const { error } = await this.client
      .from('tag')
      .delete()
      .eq('tag_id', tagId)

    if (error) throw error
  }
}

export default SupabaseClient