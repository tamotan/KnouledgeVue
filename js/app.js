import SearchTab from './SearchTab.js'
import ShowTab from './ShowTab.js'
import AddItemTab from './AddItemTab.js'

const { createApp, ref, computed } = Vue

createApp({
  setup() {
    const currentTab = ref('search')

    const currentComponent = computed(() => {
      return {
        search: SearchTab,
        show: ShowTab,
        add: AddItemTab
      }[currentTab.value]
    })

    return {
      currentTab,
      currentComponent
    }
  },

  template: `
    <div>
      <h3 class="mb-3">KNOWLEDGE</h3>

      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: currentTab === 'search' }"
            @click="currentTab = 'search'"
          >
            一覧検索
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: currentTab === 'show' }"
            @click="currentTab = 'show'"
          >
            項目表示
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: currentTab === 'add' }"
            @click="currentTab = 'add'"
          >
            追加
          </button>
        </li>
      </ul>

      <component :is="currentComponent"></component>
    </div>
  `
}).mount('#app')