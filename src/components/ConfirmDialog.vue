<template>
    <jqx-window ref="dialog" :init-content="initContent" :is-modal="true" :autoOpen="false" width="300px" height="150px"
        :ok-button="`#confirm-dialog-${uuid}-ok`" :cancel-button="`#confirm-dialog-${uuid}-cancel`"
        modal-opacity="0.7" theme="metrodark" @close="onClose($event)">
        <div>标题</div>
        <div>
            <div style="display: flex; align-items:center;">
                <img v-show="type=='info'" width="64" height="64" src="../assets/icons/dialog_info.svg" style="margin: 2px 10px;" />
                <img v-show="type=='success'" width="64" height="64" src="../assets/icons/dialog_success.svg" style="margin: 2px 10px;" />
                <img v-show="type=='warning'" width="64" height="64" src="../assets/icons/dialog_warning.svg" style="margin: 2px 10px;" />
                <img v-show="type=='error'" width="64" height="64" src="../assets/icons/dialog_error.svg" style="margin: 2px 10px;" />
                <img v-show="type=='confirm'" width="64" height="64" src="../assets/icons/dialog_question.svg" style="margin: 2px 10px;" />
                <span>{{ content }}</span>
            </div>
            <div style="display:flex; justify-content:flex-end;">
                <button type="button" :id="`confirm-dialog-${uuid}-ok`">确定</button>
                <button v-show="type=='confirm'" type="button" :id="`confirm-dialog-${uuid}-cancel`">取消</button>
            </div>
        </div>
    </jqx-window>
</template>

<script lang="ts">
/// <reference path="../jqwidgets.d.ts" />

import Vue from 'vue';
import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import JqxButton from "jqwidgets-scripts/jqwidgets-vue/vue_jqxbuttons.vue";
import { Component, Prop } from "vue-property-decorator";
import uuid from "uuid";

@Component({
    components: {
        "jqx-window": JqxWindow,
        "jqx-button": JqxButton
    }
})
export default class ConfirmDialog extends Vue {
    private content: string = '';

    private resolve: (() => void) | null = null;
    private reject: (() => void) | null = null;
    private uuid: string;
    private type: string = 'info';

    constructor() {
        super();
        this.uuid = uuid.v1();
    }

    private initContent() {
        jqwidgets.createInstance(`#confirm-dialog-${this.uuid}-ok`, 'jqxButton', { theme:"metrodark", width: 80, height: 30 });
        jqwidgets.createInstance(`#confirm-dialog-${this.uuid}-cancel`, 'jqxButton', { theme:"metrodark", width: 80, height: 30 });
    }

    private onClose(event: any): void {
        if (this.resolve != null && this.reject != null) {
            if (event.args.dialogResult.OK) {
                this.resolve();
            }
            if (event.args.dialogResult.Cancel || event.args.dialogResult.None) {
                this.reject();
            }
            this.resolve = null;
            this.reject = null;
        }
    }

    show(content: string, title: string, type?: string): Promise<undefined> | null {
        if (this.resolve == null && this.reject == null) {
            let ret: Promise<undefined> = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            (<any>this.$refs['dialog']).setTitle(title);
            this.content = content;
            this.type = type ? type : 'info';
            (<any>this.$refs['dialog']).open();
            return ret;
        }
        return null;
    }
}

</script>
