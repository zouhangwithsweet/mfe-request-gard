// install mand-mobile
const mand = 'mand-mobile'
window.Vue.use(window[mand])

const compile = Vue.compile


const tpl = `
  <div class="content">
  <md-field title="请输入需要拦截的URL" brief="本插件会直接拦截下列请求">
    <md-input-item
      title="URL"
      placeholder="请输入 URL"
      is-highlight
      v-model="url"
    >
      <span @click="onClick" class="add" slot="right">新增</span>
    </md-input-item>
    <md-detail-item v-for="(item, index) in apis" :key="item.url" :title="item.url">
      <md-icon @click.native="del(index)" v-if="item.edit" name="close"/>
    </md-detail-item>
  </md-field>
  </div>
`

var app = new Vue({
  data() {
    return {
      url: '',
      apis: [],
    }
  },
  mounted() {
    chrome.storage.sync.get('MFE_API', (data) => {
      if ( data.MFE_API) {
        this.apis = data.MFE_API.map(item => ({
          url: item,
          edit: false,
        }))
      }
    })
  },
  methods: {
    onClick() {
      if (this.url) {
        this.apis.unshift({
          url: this.url,
          edit: true,
        })
        this.url = ''
      }
    },
    del(index) {
      this.apis.splice(index, 1)
    }
  },
  render: compile(tpl).render,
  staticRenderFns: compile(tpl).staticRenderFns
}).$mount('#vue')