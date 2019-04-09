<template>
  <div id="app">
    <!-- Main Navbar-->
    <header id="header">
      <nav id="navbar">
        <!-- Navbar Header-->
        <div id="navbar-header">
          <!-- Navbar Brand -->
          <strong>《命运™》模组设计器</strong>
        </div>
        <!-- Navbar Menu -->
        <ul id="nav-menu">
          <!-- Avatar -->
          <li class="nav-item">
            <a href="javascript:void(0)">
              <div id="avatar-container">
                <img :src="avatarUrl" alt="头像">
              </div>
            </a>
          </li>
        </ul>
      </nav>
    </header>
    <jqx-menu theme="metrodark">
      <ul>
        <li>
          文件
          <ul style="width: 250px;">
            <li>
              <a href="javascript:void(0)">新建模组</a>
            </li>
            <li>
              <a href="javascript:void(0)">打开模组</a>
            </li>
            <li>
              <a href="javascript:void(0)">保存</a>
            </li>
            <li>
              <a href="javascript:void(0)">发布</a>
            </li>
          </ul>
        </li>
        <li>
          编辑
          <ul style="width: 250px;">
            <li>
              <a href="#Education">撤销</a>
            </li>
            <li>
              <a href="#Financial">重做</a>
            </li>
            <li type="separator"></li>
            <li>
              <a href="#Government">剪切</a>
            </li>
            <li>
              <a href="#Manufacturing">复制</a>
            </li>
            <li>
              <a href="#Government">粘贴</a>
            </li>
            <li>
              Software Solutions
              <ul style="width: 220px;">
                <li>
                  <a href="#ConsumerPhoto">Consumer photo and video</a>
                </li>
                <li>
                  <a href="#Mobile">Mobile</a>
                </li>
                <li>
                  <a href="#RIA">Rich Internet applications</a>
                </li>
                <li>
                  <a href="#TechnicalCommunication">Technical communication</a>
                </li>
                <li>
                  <a href="#Training">Training and eLearning</a>
                </li>
                <li>
                  <a href="#WebConferencing">Web conferencing</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">All industries and solutions</a>
            </li>
          </ul>
        </li>
        <li>
          视图
          <ul>
            <li>
              <a href="#PCProducts">资源管理器</a>
            </li>
            <li>
              <a href="#AllProducts">剧情树</a>
            </li>
            <li>
              <a href="#AllProducts">NPC编辑器</a>
            </li>
            <li type="separator"></li>
            <li>
              <a href="#PCProducts">场景布局器</a>
            </li>
            <li>
              <a href="javascript:void(0)">动作编辑器</a>
            </li>
          </ul>
        </li>
        <li>
          模组
          <ul style="width: 200px;">
            <li>
              <a href="#SupportHome">脚本库</a>
            </li>
            <li>
              <a href="#CustomerService">属性</a>
            </li>
            <li>
              <a href="#KB">Knowledge base</a>
            </li>
            <li>
              <a href="#Books">Books</a>
            </li>
            <li>
              <a href="#Training">Training and certification</a>
            </li>
            <li>
              <a href="#SupportPrograms">Support programs</a>
            </li>
            <li>
              <a href="#Forums">Forums</a>
            </li>
            <li>
              <a href="#Documentation">Documentation</a>
            </li>
            <li>
              <a href="#Updates">Updates</a>
            </li>
          </ul>
        </li>
        <li>
          帮助
          <ul style="width: 200px;">
            <li>
              <a href="#Designers">关于</a>
            </li>
            <li>
              <a href="#Developers">Developers</a>
            </li>
            <li>
              <a href="#Educators">Educators and students</a>
            </li>
            <li>
              <a href="#Partners">Partners</a>
            </li>
            <li type="separator"></li>
            <li>
              By resource
              <ul>
                <li>
                  <a href="#Labs">Labs</a>
                </li>
                <li>
                  <a href="#TV">TV</a>
                </li>
                <li>
                  <a href="#Forums">Forums</a>
                </li>
                <li>
                  <a href="#Exchange">Exchange</a>
                </li>
                <li>
                  <a href="#Blogs">Blogs</a>
                </li>
                <li>
                  <a href="#Experience Design">Experience Design</a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </jqx-menu>
    <jqx-layout theme="metrodark" ref="layout" @resize="onResize()" :width="jqxLayout.width" :layout="jqxLayout.layout">
        <div data-container="Document1Panel">
          
        </div>
        <div data-container="Document2Panel">Document 2 content</div>
        <div data-container="ErrorListPanel">List of errors</div>
        <div data-container="OutputPanel">Output</div>
        <div data-container="SolutionExplorerPanel"></div>
        <div data-container="PropertiesPanel">List of properties</div>
    </jqx-layout>
    <jqx-tree theme="metrodark" :width="tree.width" :height="tree.height" :source="tree.treeSource">
          </jqx-tree>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Axios, { AxiosInstance } from "axios";
import urljoin from "url-join";
import JqxMenu from "jqwidgets-scripts/jqwidgets-vue/vue_jqxmenu.vue";
import JqxLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxlayout.vue";
import JqxTree from "jqwidgets-scripts/jqwidgets-vue/vue_jqxtree.vue";

@Component({
  components: {
    "jqx-menu": JqxMenu,
    "jqx-layout": JqxLayout,
    "jqx-tree": JqxTree
  }
})
export default class App extends Vue {
  private readonly apiBaseUrl: string = "http://localhost:8080/trpgfate-api/";
  private userId: number = -1;
  private avatarUrl: string = "";
  private axiosInst: AxiosInstance;
  private tree: any = {
    width: 200,
    height: 600,
    treeSource: [
        {
            label: 'Mail', expanded: true,
            items:
                [
                    { label: 'Calendar' },
                    { label: 'Contacts', selected: true }
                ]
        },
        {
            label: 'Inbox', expanded: true,
            items:
                [
                    { label: 'Admin' },
                    { label: 'Corporate' },
                    { label: 'Finance' },
                    { label: 'Other' },
                ]
        },
        { label: 'Deleted Items' },
        { label: 'Notes' },
        { label: 'Settings' },
        { label: 'Favorites' }
    ]
  }
  private jqxLayout: any = {
    width: "100%",
    layout: [
      {
        type: "layoutGroup",
        orientation: "horizontal",
        items: [
          {
            type: "layoutGroup",
            orientation: "vertical",
            width: "60%",
            items: [
              {
                type: "documentGroup",
                height: "50%",
                minHeight: "25%",
                items: [
                  {
                    type: "documentPanel",
                    title: "Document 1",
                    contentContainer: "Document1Panel"
                  },
                  {
                    type: "documentPanel",
                    title: "Document 2",
                    contentContainer: "Document2Panel"
                  }
                ]
              },
              {
                type: "tabbedGroup",
                height: "500px",
                pinnedHeight: "10%",
                items: [
                  {
                    type: "layoutPanel",
                    title: "Error List",
                    contentContainer: "ErrorListPanel"
                  },
                  {
                    type: "layoutPanel",
                    title: "Output",
                    contentContainer: "OutputPanel",
                    selected: true
                  }
                ]
              }
            ]
          },
          {
            type: "tabbedGroup",
            width: "40%",
            items: [
              {
                type: "layoutPanel",
                title: "Solution Explorer",
                contentContainer: "SolutionExplorerPanel"
              },
              {
                type: "layoutPanel",
                title: "Properties",
                contentContainer: "PropertiesPanel"
              }
            ]
          }
        ]
      }
    ]
  };

  private onResize() {
    // Do something...
    console.log(this.$refs.layout);
    //(<any>this.$refs.layout).refresh();
  }

  constructor() {
    super();
    this.axiosInst = Axios.create({
      baseURL: this.apiBaseUrl,
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });
  }

  mounted() {
    this.axiosInst
      .get("/auth/authentication")
      .then(resp => {
        this.userId = resp.data.userId;
        this.axiosInst
          .get("/userdata/account-info/" + this.userId)
          .then(resp => {
            console.log(
              urljoin(this.apiBaseUrl, "/img/avatar/", resp.data.avatarId)
            );
            this.avatarUrl = urljoin(
              this.apiBaseUrl,
              "/img/avatar/",
              resp.data.avatarId
            );
          })
          .catch(err => {});
      })
      .catch(err => {
        console.log(err);
      });
  }
}
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#header {
  display: block;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1030;
}

#navbar {
  background: #2f333e;
  padding-top: 15px;
  padding-bottom: 15px;
  color: #fff;
  position: relative;
  border-radius: 0;
  -webkit-box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  z-index: 10;
  padding: 10px 30px;

  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

#nav-menu {
  list-style: none;
  align-items: center;
  padding: 0;
  margin: 0;
}

#nav-menu .nav-item {
  display: flex;
  -ms-flex-align: center;
  align-items: center;
}

#nav-menu .nav-item a {
  display: block;
  position: relative;
  padding: 0.5rem 1rem;
}

#avatar-container {
  width: 40px;
  height: 40px;
}

#avatar-container img {
  border-radius: 50% !important;
  max-width: 100%;
  height: auto;
}
</style>
