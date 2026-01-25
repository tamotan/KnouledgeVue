export default {
  name: 'AddItemTab',
  setup() {
    return {}
  },
  template: `
    <div>
      <div class="mb-3">
        <select class="form-select d-inline-block w-auto me-2">
          <option>タグ1</option>
        </select>
        <select class="form-select d-inline-block w-auto me-2">
          <option>タグ2</option>
        </select>
        <select class="form-select d-inline-block w-auto">
          <option>タグ3</option>
        </select>
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
