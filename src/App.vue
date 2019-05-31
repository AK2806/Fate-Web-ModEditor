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
            <a href="http://localhost:9200/console.html">
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
              <a href="javascript:void(0)" @click="newProject()">新建</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click="openProjectFile()">打开</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click="writeProjectFile()">保存</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click="publishMod()">发布</a>
            </li>
          </ul>
        </li>
      </ul>
    </jqx-menu>
    <jqx-docking-layout
      theme="metrodark"
      ref="layout"
      :width="jqxLayout.width"
      :height="jqxLayout.height"
      :layout="jqxLayout.layout"
    >
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
        <div
          style="position: absolute; left:0; bottom: 0; right: 0; height: 500px; line-height: 500px;"
        >
          <img
            id="resource-image-preview"
            class="alpha-background"
            style="max-width: 99%; max-height: 99%; vertical-align: middle;"
          >
        </div>
      </div>
      <div data-container="DocumentPanel">
        <div :id="`story-scene-controller`" style="display: flex; height: 40px;">
          <button type="button" id="add-object-button"></button>
          <button type="button" id="remove-object-button"></button>
          <button type="button" id="bind-character-button"></button>
          <button type="button" id="view-bound-character-button"></button>
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

    <!-- Character List -->
    <div class="modal fade" ref="characterListDialog" tabindex="-1" role="dialog" aria-labelledby="characterListDialogTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="characterListDialog">角色列表</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body page">
            <character-list ref="characterList" :self-id="userId" :user-id="userId" :can-select="true" @select-character="selectedCharacter"></character-list>
          </div>
        </div>
      </div>
    </div>

    <!-- Character Data -->
    <div class="modal fade" ref="characterDialog" tabindex="-1" role="dialog" aria-labelledby="characterDialogTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="characterDialog">角色卡</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body page">
            <character-view v-if="viewingCharacterDataUpdated" ref="viewCharacterData" :init-data="viewingCharacterData" :only-view="true"></character-view>
          </div>
        </div>
      </div>
    </div>

    <!-- Mod List -->
    <div class="modal fade" ref="modListDialog" tabindex="-1" role="dialog" aria-labelledby="modListDialogTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modListDialog">模组列表</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body page">
            <mod-list ref="modList" :self-id="userId" :user-id="userId" :can-select="true" @select-mod="selectedMod"></mod-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/// <reference path="./jqwidgets.d.ts" />
import './global';
import $ from "jquery";
import { Component, Prop, Vue } from "vue-property-decorator";
import Axios, { AxiosInstance } from "axios";
import urljoin from "url-join";
import JqxMenu from "jqwidgets-scripts/jqwidgets-vue/vue_jqxmenu.vue";
import JqxDockingLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdockinglayout.vue";
import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import JqxButton from "jqwidgets-scripts/jqwidgets-vue/vue_jqxbuttons.vue";
import uuid from "uuid";
import InputDialog from "./components/InputDialog.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import GoldenLayout from "golden-layout";

import {
  PropertyEditor,
  IPropertyContainer,
  IProperty
} from "./components/PropertyEditor";
import {
  StorySceneView,
  StorySceneModel,
  StoryGameObject,
  StoryGameCamera
} from "./components/StorySceneView";
import {
  IResourceItem,
  ResourceManagerView,
  ResourceManagerViewSelectEvent,
  DefaultResourceManagerModel
} from "./components/ResourceManagerView";

import ModList from './components/mod.vue';
import CharacterList from './components/character.vue';
import CharacterView from './components/view-character.vue';
import Swal from 'sweetalert2';

@Component({
  components: {
    "jqx-menu": JqxMenu,
    "jqx-docking-layout": JqxDockingLayout,
    "jqx-window": JqxWindow,
    "jqx-button": JqxButton,
    "input-dialog": InputDialog,
    "confirm-dialog": ConfirmDialog,
    "mod-list": ModList,
    "character-list": CharacterList,
    "character-view": CharacterView
  }
})
export default class App extends Vue {
  userId: number = -1;
  avatarUrl: string = "";
  propertyEditor: PropertyEditor = new PropertyEditor();
  storySceneView: StorySceneView = new StorySceneView();
  storySceneModel: StorySceneModel = new StorySceneModel();
  storySceneInspector: ResourceManagerView = new ResourceManagerView();
  resourceManager: ResourceManagerView = new ResourceManagerView();
  resourceModel: DefaultResourceManagerModel = new DefaultResourceManagerModel();

  viewingCharacterDataUpdated: boolean = true;
  viewingCharacterData: any = {
    uuid: '',
    portrait: {
        id: '',
        stature: 0
    },
    name: '',
    description: '',
    refreshPoint: 0,
    physics: 0,
    mental: 0,
    aspects: [],
    abilities: [],
    consequences: [],
    stunts: []
  };

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
                    this.propertyEditor.bindObject(e.selectedItem as any);
                    ($('#resource-image-preview').get(0) as HTMLImageElement).src = "";
                    let data = e.selectedItem.getData();
                    if (data != null) {
                      let fileReader = new FileReader();
                      fileReader.readAsDataURL(data);
                      fileReader.onload = (e: any) => {
                        ($('#resource-image-preview').get(
                          0
                        ) as HTMLImageElement).src = e.target.result;
                      };
                    }
                  });
                  jqwidgets.createInstance(
                    '#resource-controller>#add-file-button',
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "导入",
                      theme: "metrodark"
                    }
                  );
                  jqwidgets.createInstance(
                    '#resource-controller>#add-folder-button',
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "创建文件夹",
                      theme: "metrodark"
                    }
                  );
                  jqwidgets.createInstance(
                    '#resource-controller>#remove-button',
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "删除",
                      theme: "metrodark"
                    }
                  );
                  $('#resource-controller>#add-file-button').click(() => {
                    $('#resource-controller>#file-input').click();
                  });
                  $('#resource-controller>#file-input').change(event => {
                    let item = this.resourceManager.getSelectedItem();
                    if (item != null) {
                      if (item.getData() != null) {
                        let folder = item.getParent() as IResourceItem;
                        let files = (event.target as any).files;
                        for (let i = 0; i < files.length; ++i) {
                          let file = files.item(i);
                          if (file != null) {
                            this.resourceModel.attachResource(
                              folder.getFullPath(),
                              file.name,
                              "file-image",
                              file
                            );
                          }
                        }
                      } else {
                        let files = (event.target as any).files;
                        for (let i = 0; i < files.length; ++i) {
                          let file = files.item(i);
                          if (file != null) {
                            this.resourceModel.attachResource(
                              item.getFullPath(),
                              file.name,
                              "file-image",
                              file
                            );
                          }
                        }
                      }
                    } else {
                      let files = (event.target as any).files;
                      for (let i = 0; i < files.length; ++i) {
                        let file = files.item(i);
                        if (file != null) {
                          this.resourceModel.attachResource(
                            "custom_resource",
                            file.name,
                            "file-image",
                            file
                          );
                        }
                      }
                    }
                  });
                  $('#resource-controller>#add-folder-button').click(() => {
                    let inputDialog = this.$refs["inputDialog"] as any;
                    let promise = inputDialog.show(
                      "文件夹名：",
                      "创建文件夹",
                      "未命名文件夹"
                    );
                    if (promise != null) {
                      promise
                        .then((t: any) => {
                          let text = t as string;
                          if (text == "") {
                            let confirmDialog = this.$refs[
                              "confirmDialog"
                            ] as any;
                            confirmDialog.show(
                              "文件夹名不能为空",
                              "警告",
                              "warning"
                            );
                            return;
                          }
                          let item = this.resourceManager.getSelectedItem();
                          if (item != null) {
                            if (item.getData() != null) {
                              let folder = item.getParent() as IResourceItem;
                              this.resourceModel.createFolder(
                                folder.getFullPath(),
                                text
                              );
                            } else {
                              this.resourceModel.createFolder(
                                item.getFullPath(),
                                text
                              );
                            }
                          } else {
                            this.resourceModel.createFolder(
                              "custom_resource",
                              text
                            );
                          }
                        })
                        .catch(() => {});
                    }
                  });
                  $('#resource-controller>#remove-button').click(() => {
                    let selectedPath = this.resourceManager.getSelectedItemPath();
                    if (selectedPath != null) {
                      this.resourceModel.deleteNode(selectedPath);
                      ($('#resource-image-preview').get(
                        0
                      ) as HTMLImageElement).src = "";
                    }
                  });
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
                    {
                      width: 120,
                      height: 40,
                      value: "创建对象",
                      theme: "metrodark"
                    }
                  );
                  jqwidgets.createInstance(
                    `#story-scene-controller>#remove-object-button`,
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "移除对象",
                      theme: "metrodark"
                    }
                  );
                  jqwidgets.createInstance(
                    `#story-scene-controller>#bind-character-button`,
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "绑定角色",
                      theme: "metrodark"
                    }
                  );
                  jqwidgets.createInstance(
                    `#story-scene-controller>#view-bound-character-button`,
                    "jqxButton",
                    {
                      width: 120,
                      height: 40,
                      value: "查看已绑定角色",
                      theme: "metrodark"
                    }
                  );
                  $(`#story-scene-controller>#add-object-button`).click(() => {
                    let selectedResource: IResourceItem | null = this.resourceManager.getSelectedItem();
                    if (
                      selectedResource != null &&
                      selectedResource.getData()
                    ) {
                      let gameObject = new StoryGameObject(
                        this.resourceManager.getSelectedItemPath() as string
                      );
                      this.storySceneModel.addGameObject(gameObject);
                    } else {
                      let confirmDialog = this.$refs[
                        "confirmDialog"
                      ] as any;
                      confirmDialog.show(
                        "请先选择一个图像资源",
                        "警告",
                        "warning"
                      );
                    }
                  });
                  $(`#story-scene-controller>#remove-object-button`).click(
                    () => {
                      if (this.storySceneView != null) {
                        let selectedObjectId = this.storySceneView.getSelectedGameObjectId();
                        let confirmDialog = this.$refs[
                            "confirmDialog"
                          ] as any;
                        confirmDialog.show(
                          "确认要移除选中物件吗？",
                          "删除",
                          "confirm"
                        ).then(() => {
                          if (
                            selectedObjectId != null &&
                            selectedObjectId != "camera"
                          ) {
                            this.storySceneModel.removeGameObject(
                              selectedObjectId
                            );
                          }
                        });
                      }
                    }
                  );
                  $(`#story-scene-controller>#bind-character-button`).click(
                    () => { this.bindCharacter(); }
                  );
                  $(`#story-scene-controller>#view-bound-character-button`).click(
                    () => {
                      let selectedObjectId = this.storySceneView.getSelectedGameObjectId();
                      if (selectedObjectId) {
                        let gameObject = this.storySceneModel.getGameObject(selectedObjectId) as StoryGameObject;
                        this.viewCharacter(gameObject.characterUuid);
                      } else {
                        let confirmDialog = this.$refs[
                            "confirmDialog"
                          ] as any;
                        confirmDialog.show(
                          "请先选中场景物件",
                          "错误",
                          "error"
                        );
                      }
                    }
                  );
                  this.storySceneView.initView(
                    "#story-scene-container",
                    this.resourceModel
                  );
                  this.storySceneView.bindModel(this.storySceneModel);
                  this.storySceneView.addSelectObjectListener(
                    (selectedObjectId: string | null) => {
                      if (selectedObjectId == "camera") {
                        this.propertyEditor.bindObject(
                          this.storySceneModel.camera
                        );
                        this.storySceneInspector.selectItem(null);
                      } else if (selectedObjectId != null) {
                        this.propertyEditor.bindObject(
                          this.storySceneModel.getGameObject(
                            selectedObjectId
                          ) as StoryGameObject
                        );
                        this.storySceneInspector.selectItem(selectedObjectId);
                      } else {
                        this.propertyEditor.bindObject(null);
                        this.storySceneInspector.selectItem(null);
                      }
                    }
                  );
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
                      this.storySceneInspector.initView("#object-inspector");
                      this.storySceneInspector.setModel(this.storySceneModel);
                      this.storySceneInspector.addSelectEventListener(
                        (e: ResourceManagerViewSelectEvent) => {
                          if (this.storySceneView != null) {
                            this.storySceneView.selectGameObject(
                              e.selectedItem.getId()
                            );
                          }
                        }
                      );
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
                      this.propertyEditor.initView("#property-editor");
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  mounted() {
    Axios
      .get("/auth/authentication")
      .then(resp => {
        this.userId = resp.data.userId;
        Axios
          .get("/userdata/account-info/" + this.userId)
          .then(resp => {
            this.avatarUrl = urljoin(
              (global as any).apiUrlPrefix,
              "/img/avatar/",
              resp.data.avatarId
            );
          })
          .catch(err => {});
      })
      .catch(err => {
        console.error(err);
      });
  }

  newProject() {
    window.location.reload();
  }

  loadProject(jsonData: string) {
    let model = JSON.parse(jsonData);
    this.resourceModel.applyPersistentData(model.resourceManager);
    this.storySceneModel.applyPersistentData(model.storyScene);
  }

  saveProject(onlyData: boolean): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.resourceModel.getPersistentData()
      .then((resourceData) => {
        if (!onlyData) {
          let model = {
            resourceManager: resourceData,
            storyScene: this.storySceneModel.getPersistentData()
          };
          let jsonStr: string = JSON.stringify(model);
          resolve(jsonStr);
        } else {
          let model = {
            storyScene: this.storySceneModel.getPersistentData()
          };
          let jsonStr: string = JSON.stringify(model);
          resolve(jsonStr);
        }
      });
    });
  }
  
  writeProjectFile() {
    this.saveProject(false).then(json => {
      let a = document.createElement("a");
      let file = new Blob([json], {type: 'application/json'});
      let url = URL.createObjectURL(file);
      a.href = url;
      a.download = '模组.json';
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);  
      }, 10000); 
    });
  }

  openProjectFile() {
    let fileInput = $('<input type="file" accept="application/json" style="display: none;" />').on('change', event => {
      let file = (event.target as any).files[0] as File;
      let fileReader = new FileReader();
      fileReader.onload = () => {
        this.loadProject(fileReader.result as string);
      }
      fileReader.readAsText(file);
    });
    fileInput.click();
  }

  publishMod(uuid?: string): void {
    if (uuid) {
      this.saveProject(true).then(json => {
        let fmData = new FormData();
        let jsonBlob = new Blob([json], { type: 'application/json' });
        fmData.append('data', jsonBlob);
        Axios.put('/persona/mod/' + uuid + '/data', fmData)
        .then(resp => {
          ($(this.$refs['modListDialog']) as any).modal('hide');
          Swal.fire({
            title: '成功',
            text: '模组已发布',
            type: 'success'
          });
        })
        .catch(err => {
          console.error(err);
        })
      });
    } else {
      ($(this.$refs['modListDialog']) as any).modal('show');
    }
  }

  selectedMod(modUuid: string): void {
    this.publishMod(modUuid);
  }

  bindCharacter(characterUuid?: string): void {
    if (characterUuid) {
      ($(this.$refs['characterListDialog']) as any).modal('hide');
      let selectedObjectId = this.storySceneView.getSelectedGameObjectId();
      if (selectedObjectId && selectedObjectId != 'camera') {
        let gameObject = this.storySceneModel.getGameObject(selectedObjectId) as StoryGameObject;
        gameObject.characterUuid = characterUuid;
        let confirmDialog = this.$refs[
          "confirmDialog"
        ] as any;
        confirmDialog.show(
          "角色已绑定",
          "成功",
          "success"
        );
      } else {
        let confirmDialog = this.$refs[
          "confirmDialog"
        ] as any;
        confirmDialog.show(
          "请先选择场景物件",
          "错误",
          "error"
        );
      }
    } else {
      let selectedObjectId = this.storySceneView.getSelectedGameObjectId();
      if (!selectedObjectId || selectedObjectId == 'camera') {
        let confirmDialog = this.$refs[
          "confirmDialog"
        ] as any;
        confirmDialog.show(
          "请先选择场景物件",
          "错误",
          "error"
        );
      } else {
        ($(this.$refs['characterListDialog']) as any).modal('show');
        (this.$refs['characterList'] as any).fetchCharacters();
      }
    }
  }

  selectedCharacter(characterUuid: string): void {
    this.bindCharacter(characterUuid);
  }

  viewCharacter(uuid: string) {
      if (uuid == '') {
        let confirmDialog = this.$refs[
          "confirmDialog"
        ] as any;
        confirmDialog.show(
          "这个物件没有绑定角色",
          "警告",
          "warning"
        );
      } else {
        console.log(uuid);
        Axios.get('/userdata/character/concrete/' + uuid)
        .then(resp => {
            this.viewingCharacterData.uuid = resp.data.uuid;
            this.viewingCharacterData.portrait.id = resp.data.uuid;
            this.viewingCharacterData.portrait.stature = resp.data.portrait.stature;
            this.viewingCharacterData.name = resp.data.data.name;
            this.viewingCharacterData.description = resp.data.data.description;
            this.viewingCharacterData.refreshPoint = resp.data.data.refreshFatePoint;
            this.viewingCharacterData.physics = resp.data.data.physics;
            this.viewingCharacterData.mental = resp.data.data.mental;
            this.viewingCharacterData.aspects.splice(0, this.viewingCharacterData.aspects.length);
            for (let i in resp.data.data.aspects) {
                this.viewingCharacterData.aspects.push(resp.data.data.aspects[i]);
            }
            this.viewingCharacterData.abilities.splice(0, this.viewingCharacterData.abilities.length);
            for (let i in resp.data.data.abilities) {
                this.viewingCharacterData.abilities.push(resp.data.data.abilities[i]);
            }
            this.viewingCharacterData.stunts.splice(0, this.viewingCharacterData.stunts.length);
            for (let i in resp.data.data.stunts) {
                this.viewingCharacterData.stunts.push(resp.data.data.stunts[i]);
            }
            this.viewingCharacterData.consequences.splice(0, this.viewingCharacterData.consequences.length);
            for (let i in resp.data.data.consequences) {
                this.viewingCharacterData.consequences.push(resp.data.data.consequences[i]);
            }
            this.viewingCharacterDataUpdated = false;
            this.$nextTick(() => this.viewingCharacterDataUpdated = true);
            ($(this.$refs['characterDialog']) as any).modal();
        })
        .catch(err => {
          console.error(err);
        });
      }
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

img.alpha-background {
  background: url('./assets/alpha-background.png') repeat;
}
</style>
