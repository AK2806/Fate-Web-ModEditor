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
          模组
          <ul style="width: 250px;">
            <li>
              <a href="javascript:void(0)">新建</a>
            </li>
            <li>
              <a href="javascript:void(0)">打开</a>
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
          帮助
          <ul style="width: 200px;">
            <li>
              <a href="#Designers">关于</a>
            </li>
          </ul>
        </li>
      </ul>
    </jqx-menu>
    <jqx-docking-layout theme="metrodark" ref="layout" :width="jqxLayout.width" :height="jqxLayout.height" :layout="jqxLayout.layout">
        <div data-container="ResourcePanel">
          <resource-manager ref="resourceManager"></resource-manager>
        </div>
        <div data-container="DocumentPanel">
          <div :id="`story-scene-controller`" style="display: flex; height: 40px;">
            <button type="button" id="add-object-button"></button>
            <button type="button" id="remove-object-button"></button>
          </div>
          <div id="story-scene-container"></div>
        </div>
        <div data-container="ObjectInspectPanel">
          <div id="object-inspector"></div>
        </div>
        <div data-container="PropertiesPanel">
          <div id="property-editor"></div>
        </div>
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
import InputDialog from "./components/InputDialog.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import ResourceManager from './components/ResourceManager.vue';
import {PropertyEditor,IPropertyContainer,IProperty} from './components/PropertyEditor';
import {StorySceneView,StorySceneModel,StoryGameObject,StoryGameCamera} from './components/StorySceneView';
import uuid from "uuid";

import {
  IResourceItem,
  ResourceManagerView,
  ResourceManagerViewSelectEvent
} from "./components/ResourceManagerView";

@Component({
  components: {
    "jqx-menu": JqxMenu,
    "jqx-docking-layout": JqxDockingLayout,
    "jqx-window": JqxWindow,
    "jqx-button": JqxButton,
    "resource-manager": ResourceManager,
    "input-dialog": InputDialog,
    "confirm-dialog": ConfirmDialog
  }
})
export default class App extends Vue {
  readonly apiBaseUrl: string = "http://localhost:8080/trpgfate-api/";
  userId: number = -1;
  avatarUrl: string = "";
  axiosInst: AxiosInstance;
  propertyEditor: PropertyEditor = new PropertyEditor();
  storySceneView: StorySceneView = new StorySceneView();
  storySceneModel: StorySceneModel = new StorySceneModel();
  storySceneInspector: ResourceManagerView = new ResourceManagerView();

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
                  (this.$refs['resourceManager'] as any).initView();
                }
              }
            ]
          },
          {
            type: "tabbedGroup",
            width: "60%",
            items: [
              {
                type: "layoutPanel",
                title: "场景编辑",
                contentContainer: "DocumentPanel",
                initContent: () => {
                  jqwidgets.createInstance(
                    `#story-scene-controller>#add-object-button`,
                    "jqxButton",
                    { width: 120, height: 40, value: "创建对象", theme: "metrodark" }
                  );
                  jqwidgets.createInstance(
                    `#story-scene-controller>#remove-object-button`,
                    "jqxButton",
                    { width: 120, height: 40, value: "移除对象", theme: "metrodark" }
                  );
                  $(`#story-scene-controller>#add-object-button`).click(() => {
                    let selectedResource: Blob | null = (this.$refs['resourceManager'] as any).getSelectedResource();
                    if (selectedResource != null) {
                      let gameObject = new StoryGameObject((this.$refs['resourceManager'] as any).getSelectedItemPath());
                      this.storySceneModel.addGameObject(gameObject);
                    }
                  });
                  $(`#story-scene-controller>#remove-object-button`).click(() => {
                    if (this.storySceneView != null) {
                      let selectedObjectId = this.storySceneView.getSelectedGameObjectId();
                      if (selectedObjectId != null && selectedObjectId != 'camera') {
                        this.storySceneModel.removeGameObject(selectedObjectId);
                      }
                    }
                  });
                  this.storySceneView.initView('#story-scene-container', (this.$refs['resourceManager'] as any).resourceModel);
                  this.storySceneView.bindModel(this.storySceneModel);
                  this.storySceneView.addSelectObjectListener((selectedObjectId: string | null) => {
                    if (selectedObjectId == 'camera') {
                      this.propertyEditor.bindObject(this.storySceneModel.camera);
                      this.storySceneInspector.selectItem(null);
                    } else if (selectedObjectId != null) {
                      this.propertyEditor.bindObject(this.storySceneModel.getGameObject(selectedObjectId) as StoryGameObject);
                      this.storySceneInspector.selectItem(selectedObjectId);
                    } else {
                      this.propertyEditor.bindObject(null);
                      this.storySceneInspector.selectItem(null);
                    }
                  });
                }
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
                height: "40%",
                items: [
                  {
                    type: "layoutPanel",
                    title: "场景对象列表",
                    contentContainer: "ObjectInspectPanel",
                    initContent: () => {
                      console.log('123213');
                      this.storySceneInspector.initView('#object-inspector');
                      this.storySceneInspector.setModel(this.storySceneModel);
                      this.storySceneInspector.addSelectEventListener((e : ResourceManagerViewSelectEvent) => {
                        if (this.storySceneView != null) {
                          this.storySceneView.selectGameObject(e.selectedItem.getId());
                        }
                      })
                    }
                  }
                ]
              },
              {
                type: "tabbedGroup",
                height: "60%",
                items: [
                  {
                    type: "layoutPanel",
                    title: "属性",
                    contentContainer: "PropertiesPanel",
                    initContent: () => {
                      this.propertyEditor.initView('#property-editor');
                    }
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
