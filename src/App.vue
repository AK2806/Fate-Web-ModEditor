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
    <jqx-docking-layout theme="metrodark" ref="layout" :width="jqxLayout.width" :height="jqxLayout.height" :layout="jqxLayout.layout">
        <div data-container="ResourcePanel">
          <div id="resource-controller" style="display: flex; height: 40px;">
            <button type="button" id="add-file-button"></button>
            <button type="button" id="add-folder-button"></button>
            <input type="file" accept="image/png" multiple id="file-input" style="display: none;" />
            <button type="button" id="remove-button"></button>
          </div>
          <div style="position: absolute; left:0; bottom: 500px; top: 40px; right: 0;">
            <div id="resource-manager"></div>
          </div>
          <div style="position: absolute; left:0; bottom: 0; right: 0; height: 500px;">
            <img id="resource-image-preview" style="height: 99%;"/>
          </div>
        </div>
        <div data-container="Document1Panel">
          
        </div>
        <div data-container="OutputPanel">Output</div>
        <div data-container="SolutionExplorerPanel"></div>
        <div data-container="PropertiesPanel">List of properties</div>
    </jqx-docking-layout>
    <input-dialog ref="inputDialog"></input-dialog>
    <confirm-dialog ref="confirmDialog"></confirm-dialog>
  </div>
</template>

<script lang="ts">
/// <reference path="./jqwidgets.d.ts" />

import $ from "jquery";
import { Component, Prop, Vue } from "vue-property-decorator";
import Axios, { AxiosInstance } from "axios";
import urljoin from "url-join";
import JqxMenu from "jqwidgets-scripts/jqwidgets-vue/vue_jqxmenu.vue";
import JqxDockingLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdockinglayout.vue";
import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import JqxButton from "jqwidgets-scripts/jqwidgets-vue/vue_jqxbuttons.vue";
import {IResourceItem, ResourceManagerView, DefaultResourceManagerModel} from "./components/ResourceManager";
import InputDialog from "./components/InputDialog.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";

@Component({
  components: {
    "jqx-menu": JqxMenu,
    "jqx-docking-layout": JqxDockingLayout,
    "jqx-window": JqxWindow,
    "jqx-button": JqxButton,
    "input-dialog": InputDialog,
    "confirm-dialog": ConfirmDialog
  }
})
export default class App extends Vue {
  readonly apiBaseUrl: string = "http://localhost:8080/trpgfate-api/";
  userId: number = -1;
  avatarUrl: string = "";
  axiosInst: AxiosInstance;
  resourceManager: ResourceManagerView = new ResourceManagerView();
  resourceModel: DefaultResourceManagerModel = new DefaultResourceManagerModel();

  jqxLayout: any = {
    width: "100%",
    height: "1080px",
    layout: [
      {
        type: "layoutGroup",
        orientation: "horizontal",
        items: [
          {
            type: "tabbedGroup",
            width: "20%",
            items: [
              {
                type: "layoutPanel",
                title: "资源面板",
                contentContainer: "ResourcePanel",
                initContent: () => {
                  this.resourceManager.initView('#resource-manager');
                  this.resourceManager.setModel(this.resourceModel);
                  this.resourceManager.addSelectEventListener(e => {
                    let data = e.selectedItem.getData();
                    if (data != null) {
                      let fileReader = new FileReader();
                      fileReader.readAsDataURL(data);
                      fileReader.onload = (e: any) => {
                        ($('#resource-image-preview').get(0) as HTMLImageElement).src = e.target.result;
                      };
                    }
                  });
                  jqwidgets.createInstance('#resource-controller>#add-file-button', 'jqxButton', { width: 120, height: 40, value: '导入', theme:'metrodark' });
                  jqwidgets.createInstance('#resource-controller>#add-folder-button', 'jqxButton', { width: 120, height: 40, value: '创建文件夹', theme:'metrodark' });
                  jqwidgets.createInstance('#resource-controller>#remove-button', 'jqxButton', { width: 120, height: 40, value: '删除', theme:'metrodark' });
                  $('#resource-controller>#add-file-button').click(() => {
                    $('#resource-controller>#file-input').click();
                  });
                  $('#resource-controller>#file-input').change(event => {
                    let item = this.resourceManager.getSelectedItem();
                    if (item != null) {
                      if (item.getData() != null) {
                        let folder = item.getParent() as IResourceItem;
                        let files = <FileList>(<any>event.target).files;
                        for (let i = 0; i < files.length; ++i) {
                          let file = files.item(i);
                          if (file != null) {
                            this.resourceModel.attachResource(folder.getFullPath(), file.name, 'file-image', file);
                          }
                        }
                      } else {
                        let files = <FileList>(<any>event.target).files;
                        for (let i = 0; i < files.length; ++i) {
                          let file = files.item(i);
                          if (file != null) {
                            this.resourceModel.attachResource(item.getFullPath(), file.name, 'file-image', file);
                          }
                        }
                      }
                    } else {
                      let files = <FileList>(<any>event.target).files;
                      for (let i = 0; i < files.length; ++i) {
                        let file = files.item(i);
                        if (file != null) {
                          this.resourceModel.attachResource("custom_resource", file.name, 'file-image', file);
                        }
                      }
                    }
                  });
                  $('#resource-controller>#add-folder-button').click(() => {
                    let inputDialog = this.$refs['inputDialog'] as InputDialog;
                    let promise = inputDialog.show('文件夹名：', '创建文件夹', '未命名文件夹');
                    if (promise != null) {
                      promise.then(t => {
                        let text = t as string;
                        if (text == '') {
                          let confirmDialog = this.$refs['confirmDialog'] as ConfirmDialog;
                          confirmDialog.show("文件夹名不能为空", "警告", "warning");
                          return;
                        }
                        let item = this.resourceManager.getSelectedItem();
                        if (item != null) {
                          if (item.getData() != null) {
                            let folder = item.getParent() as IResourceItem;
                            this.resourceModel.createFolder(folder.getFullPath(), text);
                          } else {
                            this.resourceModel.createFolder(item.getFullPath(), text);
                          }
                        } else {
                          this.resourceModel.createFolder("custom_resource", text);
                        }
                      }).catch(() => {});
                    }
                  });
                  $('#resource-controller>#remove-button').click(() => {
                    let selectedPath = this.resourceManager.getSelectedItemPath();
                    if (selectedPath != null) {
                      this.resourceModel.deleteNode(selectedPath);
                    }
                  });
                }
              }
            ]
          },
          {
            type: "documentGroup",
            width: "60%",
            items: [
              {
                type: "documentPanel",
                title: "故事场景",
                contentContainer: "Document1Panel",
              }
            ]
          },
          {
            type: "layoutGroup",
            orientation: "vertical",
            width: "20%",
            items: [
              {
                type: "tabbedGroup",
                height: "50%",
                items: [
                  {
                    type: "layoutPanel",
                    title: "Solution Explorer",
                    contentContainer: "SolutionExplorerPanel",
                  }
                ]
              },
              {
                type: "tabbedGroup",
                height: "50%",
                items: [
                  {
                    type: "layoutPanel",
                    title: "Properties",
                    contentContainer: "PropertiesPanel"
                  }
                ]
              },
            ]
          },
        ]
      }
    ]
  };

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
  width: 55px;
  height: 55px;
}

#avatar-container img {
  border-radius: 50% !important;
  max-width: 100%;
  height: auto;
}
</style>
