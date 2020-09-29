
const content = document.querySelector('#content')
const backgroundPageConnection = chrome.runtime.connect({
  name: "raven-page"
})

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
})

const mand = 'mand-mobile'
window.Vue.use(window[mand])

const compile = Vue.compile


const tpl = `
  <div class="content">
    <md-field title="Raven" brief="埋点详情">
      <div class="action-container" slot="action" @click="clear">
        <md-icon size="lg" name="refresh"></md-icon>
      </div>
      <hr style="border: 0; background-color: #eee; height: 1px;"/>
      <div
        v-for="(item, index) in details" :key="item.url"
        style="
          margin-bottom: .48rem;
          border-bottom: 1px solid #ebebeb;
        "
      >
      <transition-group name="flip-list">
        <div
          class="event-content"
          style="
            font-size: .28rem;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: .9rem;
            border: 1px solid #ebebeb;
            border-bottom: none;
          "
          :key="form + index"
          v-for="(form, index) in ((item.requestBody.formData && Object.entries(item.requestBody.formData).filter(f => !ignoreKeys.includes(f[0]))) || [])"
        >
          <p class="left"
            style="
              color: #41485d;
              flex: 0 0 1rem;
              align-self: stretch;
              text-align: center;
              position: relative;
              border-right: 1px solid #ebebeb;
            "
          >
            <span style="
              position: absolute;
              top: 0;
              bottom: 0;
              right: 0;
              left: 0;
              display: flex;
              justify-content: center;
              text-align: center;
              align-items: center;
            ">
              {{form[0]}}
            </span>
          <p>
          <p class="right"
            style="
              color: #858b9c;
              word-break:break-all;
              flex: 1;
              padding: 0 .32rem;
            "
          >
            {{decode(form[1])}}
          <p>
        </div>
      <transition-group
      </div>
    </md-field>
  </div>
`

var app = new Vue({
  data() {
    return {
      url: '',
      details: [],
      ignoreKeys: [
        'aid',
        'oid',
        'bid',
        'p',
        'pt',
        'si',
        'sid',
        't',
        'v',
        'stid',
      ]
    }
  },
  mounted() {
    backgroundPageConnection.onMessage.addListener((message) => {
      this.details.unshift(message)
    })
  },
  methods: {
    decode(val) {
      try {
        return JSON.parse(decodeURIComponent(val))
      } catch (error) {
        return decodeURIComponent(val)
      }
    },
    clear() {
      this.details = []
    }
  },
  render: compile(tpl).render,
  staticRenderFns: compile(tpl).staticRenderFns
}).$mount('#content')
