<template>
  <div>
    <div :id="`resource-controller-${uuid}`" style="display: flex; height: 40px;">
      <button type="button" id="add-file-button"></button>
      <button type="button" id="add-folder-button"></button>
      <input type="file" accept="image/png" multiple id="file-input" style="display: none;">
      <button type="button" id="remove-button"></button>
    </div>
    <div style="position: absolute; left:0; bottom: 500px; top: 40px; right: 0;">
      <div :id="`resource-manager-${uuid}`"></div>
    </div>
    <div style="position: absolute; left:0; bottom: 0; right: 0; height: 500px; line-height: 500px;">
      <img :id="`resource-image-preview-${uuid}`" class="alpha-background" style="max-width: 99%; max-height: 99%; vertical-align: middle;">
    </div>
    <input-dialog ref="inputDialog"></input-dialog>
    <confirm-dialog ref="confirmDialog"></confirm-dialog>
  </div>
</template>

<script lang="ts">
/// <reference path="./jqwidgets.d.ts" />

import $ from "jquery";
import Vue from "vue";
import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import JqxButton from "jqwidgets-scripts/jqwidgets-vue/vue_jqxbuttons.vue";
import { Component, Prop } from "vue-property-decorator";
import uuid from "uuid";

import {
  IResourceItem,
  ResourceManagerView,
  DefaultResourceManagerModel
} from "./ResourceManagerView";
import InputDialog from "./InputDialog.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

@Component({
  components: {
    "jqx-window": JqxWindow,
    "jqx-button": JqxButton,
    "input-dialog": InputDialog,
    "confirm-dialog": ConfirmDialog
  }
})
export default class ResourceManager extends Vue {
  private readonly uuid: string;
  private readonly resourceManager: ResourceManagerView = new ResourceManagerView();
  readonly resourceModel: DefaultResourceManagerModel = new DefaultResourceManagerModel();

  constructor() {
    super();
    this.uuid = uuid.v1().replace(/-/g, '')
  }

  getSelectedItemPath(): string | null {
    return this.resourceManager.getSelectedItemPath();
  }

  getSelectedResource(): Blob | null {
    let selectedItem = this.resourceManager.getSelectedItem();
    if (selectedItem != null) {
      return selectedItem.getData();
    }
    return null;
  }

  initView() {
    this.resourceManager.initView(`#resource-manager-${this.uuid}`);
    this.resourceManager.setModel(this.resourceModel);
    this.resourceManager.addSelectEventListener(e => {
      ($(`#resource-image-preview-${this.uuid}`).get(0) as HTMLImageElement).src = '';
      let data = e.selectedItem.getData();
      if (data != null) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(data);
        fileReader.onload = (e: any) => {
          ($(`#resource-image-preview-${this.uuid}`).get(0) as HTMLImageElement).src =
            e.target.result;
        };
      }
    });
    jqwidgets.createInstance(
      `#resource-controller-${this.uuid}>#add-file-button`,
      "jqxButton",
      { width: 120, height: 40, value: "导入", theme: "metrodark" }
    );
    jqwidgets.createInstance(
      `#resource-controller-${this.uuid}>#add-folder-button`,
      "jqxButton",
      { width: 120, height: 40, value: "创建文件夹", theme: "metrodark" }
    );
    jqwidgets.createInstance(
      `#resource-controller-${this.uuid}>#remove-button`,
      "jqxButton",
      { width: 120, height: 40, value: "删除", theme: "metrodark" }
    );
    $(`#resource-controller-${this.uuid}>#add-file-button`).click(() => {
      $(`#resource-controller-${this.uuid}>#file-input`).click();
    });
    $(`#resource-controller-${this.uuid}>#file-input`).change(event => {
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
    $(`#resource-controller-${this.uuid}>#add-folder-button`).click(() => {
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
              let confirmDialog = this.$refs["confirmDialog"] as any;
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
          })
          .catch(() => {});
      }
    });
    $(`#resource-controller-${this.uuid}>#remove-button`).click(() => {
      let selectedPath = this.resourceManager.getSelectedItemPath();
      if (selectedPath != null) {
        this.resourceModel.deleteNode(selectedPath);
        ($(`#resource-image-preview-${this.uuid}`).get(0) as HTMLImageElement).src = '';
      }
    });
  }
}
</script>

<style lang="scss">
img.alpha-background {
  background: url('../assets/alpha-background.png') repeat;
}
</style>
