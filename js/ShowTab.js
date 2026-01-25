export default {
  name: 'ShowTab',
  setup() {
    return {}
  },
  template: `
    <div>
      <div class="mb-2">
        <span class="badge bg-secondary me-1">タグ1</span>
        <span class="badge bg-secondary me-1">タグ2</span>
        <span class="badge bg-secondary">タグ3</span>
      </div>

      <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" class="form-control">
      </div>

      <div>
        <label class="form-label">Text</label>
        <textarea class="form-control" rows="6"></textarea>
      </div>
    </div>
  `
}
