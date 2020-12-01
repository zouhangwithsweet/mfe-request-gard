
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
    <md-field title="Raven" :brief="'埋点详情 / 共 ' + details.length +' 条'">
      <div class="action-container" slot="action">
        <md-input-item v-model="searchText" class="search-input" placeholder="输入埋点名称搜索">
          <md-icon slot="right" size="md" name="search"  @click.native="searchClick"></md-icon>
        </md-input-item>
        <md-icon size="md" name="refresh"  @click.native="clear"></md-icon>
      </div>
      <hr style="border: 0; background-color: #eee; height: 1px;"/>
      <div
        v-for="(item, index) in details" :key="item.url"
        v-show="!searchText || (
          searchText &&
          item.requestBody.formData &&
          item.requestBody.formData.eid[0] &&
          item.requestBody.formData.eid[0].includes(searchText)
        )"
        :class="{
          'active-search': (
            searchText &&
            item.requestBody.formData &&
            item.requestBody.formData.eid[0] &&
            item.requestBody.formData.eid[0].includes(searchText)
          )
        }"
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
          :key="form + m"
          v-for="(form, m) in (
              (item.requestBody.formData &&
                Object.entries(item.requestBody.formData)
                  .filter(
                    f => !ignoreKeys.includes(f[0])
                  )
              ) || []
            )"
        >
          <p class="left"
            style="
              color: #41485d;
              flex: 0 0 2rem;
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
              {{keyMap[form[0]]}}({{form[0]}})
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
            {{form[0] == 'pt' ? new Date(decode(form[1])).toLocaleString() : decode(form[1])}}
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
        'si',
        'sid',
        't',
        'v',
        'stid',
      ],
      searchText: '',
      keyMap: {
        attrs: '贯穿属性',
        eid: '埋点名称',
        nm: '请求地址',
        pt: '上报时间',
        ext: '请求数据',
      }
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
    },
    searchClick() {
      console.log('搜索')
    },
    formater(el, data) {
      const formatter = new JSONFormatter(data)
      el.appendChild(formatter.render())
    },
  },
  render: compile(tpl).render,
  staticRenderFns: compile(tpl).staticRenderFns
}).$mount('#content')
