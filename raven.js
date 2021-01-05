// @ts-nocheck

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
          item.formData &&
          item.formData.eid[0] &&
          item.formData.eid[0].includes(searchText)
        )"
        class="detail-item"
        :class="{
          'active-search': (
            searchText &&
            item.formData &&
            item.formData.eid[0] &&
            item.formData.eid[0].includes(searchText)
          )
        }"
        style="
          margin-bottom: .24rem;
          border-bottom: 1px solid #ebebeb;
        "
      >
        <transition-group name="flip-list">
          <div
            class="event-content animate__lightSpeedInLeft"
            style="
              font-size: .24rem;
              font-weight: normal;
              display: flex;
              justify-content: space-between;
              align-items: center;
              min-height: .8rem;
              border: .01rem solid #ebebeb;
              border-bottom: none;
            "
            :key="form + m"
            v-for="(form, m) in (
                (item.formData &&
                  Object.entries(item.formData)
                    .filter(
                      f => !ignoreKeys.includes(f[0])
                    ).sort((a, b) => {
                      if(a[0] === 'eid') {return -1} return 0
                    })
                ) || []
              )"
            :style="form[0] === 'eid' ? {
              background: colorMap[form[1]] || '#e2e2df'
            }: {}"
          >
            <p class="left"
              style="
                color: #41485d;
                flex: 0 0 2rem;
                align-self: stretch;
                text-align: center;
                position: relative;
                border-right: .01rem solid #ebebeb;
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
            <p
              class="right"
              style="
                color: #101010;
                word-break:break-all;
                flex: 1;
                padding: 0 .32rem;
              "
            >
              {{form[0] == 'pt' ? new Date(decode(form[1])).toLocaleString() : decode(form[1])}}
            <p>
          </div>
        </transition-group>
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
      },
      colorMap: {
        error: '#fec5bb',
        _global_e: '#f8edeb',
        _timing: '#e8e8e4',
        _r: '#d8e2dc',
        _page_view: '#ece4db',
      },
    }
  },
  mounted() {
    backgroundPageConnection.onMessage.addListener((message) => {
      if (!message.requestBody.formData.pld) {
        const data = {
          url: message.url,
          formData: message.requestBody.formData,
        }
        this.details.unshift(data)
      } else {
        const formData = message.requestBody.formData.pld
        const url = message.url
        formData.map((f, index) => {
          let obj = {
            url: url + '' + index,
            formData: {}
          }
          const str = decodeURIComponent(decodeURIComponent(f))
          str.split('&').forEach(st => {
            obj.formData[st.split('=')[0]] = [
              st.split('=').slice(1).join('')
            ]
          })
          this.details.unshift(obj)
        })
      }
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
  },
  render: compile(tpl).render,
  staticRenderFns: compile(tpl).staticRenderFns
}).$mount('#content')
