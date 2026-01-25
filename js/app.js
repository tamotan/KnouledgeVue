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
            ˆê——ŒŸõ
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: currentTab === 'show' }"
            @click="currentTab = 'show'"
          >
            €–Ú•\¦
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: currentTab === 'add' }"
            @click="currentTab = 'add'"
          >
            ’Ç‰Á
          </button>
        </li>
      </ul>

      <component :is="currentComponent"></component>
    </div>
  `
}).mount('#app')