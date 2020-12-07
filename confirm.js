// install mand-mobile
const mand = 'mand-mobile'
window.Vue.use(window[mand])

const compile = Vue.compile

const tpl = `
  <div class="content">
    <md-field
      title="拦截与重定向"
    >
      <div class="action-container" slot="action">
        <md-icon name="info" />
      </div>
      <md-input-item
        v-model="mockApi"
        @input="saveHandler($event,'mockApi')"
        ref="input13"
        title="Mock 地址"
        placeholder="输入 mock 地址"
        brief="例如：https://mock.xxx.com"
        is-highlight
      ></md-input-item>
      <md-cell-item title="是否请求 Mock">
        <md-switch v-model="mock" @input="saveHandler($event,'mock')" slot="right" />
      </md-cell-item>
      <md-cell-item title="拦截关键接口">
        <md-switch v-model="apiBlocking" @input="saveHandler($event,'apiBlocking')" slot="right" />
      </md-cell-item>
      <md-cell-item title="屏蔽 Raven 埋点">
        <md-switch v-model="ravenBlocking" @input="saveHandler($event,'ravenBlocking')" slot="right" />
      </md-cell-item>
      <md-cell-item title="屏蔽 Omega 埋点">
        <md-switch v-model="omegaBlocking" @input="saveHandler($event,'omegaBlocking')" slot="right" />
      </md-cell-item>
    </md-field>
    <md-field
      title="快速代理"
    >
      <div
        class="action-container pointer"
        slot="action"
      >
        +
      </div>
      <md-input-item
        v-model="proxyOrigin"
        @input="saveHandler($event,'proxyOrigin')"
        ref="input13"
        title="源地址"
        placeholder="输入需要代理的地址"
        brief="例如：https://mock.xxx.com"
        is-highlight
      ></md-input-item>
      <md-input-item
        v-model="proxyTarget"
        @input="saveHandler($event,'proxyTarget')"
        ref="input13"
        title="目标地址"
        placeholder="输入目标地址"
        brief="例如：192.168.1.1"
        is-highlight
      ></md-input-item>
    </md-field>
  </div>
`

var app = new Vue({
  data() {
    return {
      ravenBlocking: false,
      omegaBlocking: false,
      apiBlocking: true,
      mock: false,
      mockApi: '',
      // 代理
      proxyOrigin: '',
      proxyTarget: '',
    }
  },
  methods: {
    handler(name, active) {
      console.log(`Status of switch ${name} is ${active ? 'active' : 'inactive'}`)
    },
  },
  created() {
    const storage = chrome.storage.sync
    storage.get('ravenBlocking', (data) => {
      this.ravenBlocking = data.ravenBlocking || false
    })
    storage.get('omegaBlocking', (data) => {
      this.omegaBlocking = data.omegaBlocking || false
    })
    storage.get('apiBlocking', (data) => {
      this.apiBlocking = data.apiBlocking || false
    })
    storage.get('mock', (data) => {
      this.mock = data.mock || false
    })
    storage.get('mockApi', (data) => {
      this.mockApi = data.mockApi || 'https://mock.xiaojukeji.com'
    })
    storage.get('proxyOrigin', (data) => {
      this.proxyOrigin = data.proxyOrigin || ''
    })
    storage.get('proxyTarget', (data) => {
      this.proxyTarget = data.proxyTarget || ''
    })
  },
  methods: {
    saveHandler($event, type) {
      chrome.storage.sync.set({ [type]: $event }, function () {
        console.log('设置成功')
      })
    },
    setHandler() {
      
      const { ravenBlocking, omegaBlocking, apiBlocking, mock, mockApi } = this
      chrome.storage.sync.set({ mockApi: mockApi, }, function () {
        window.alert('ok')
      })
    },
  },
  render: compile(tpl).render,
  staticRenderFns: compile(tpl).staticRenderFns
}).$mount('#vue')
