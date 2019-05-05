<template>
    <jqx-window ref="dialog" :init-content="initContent" :is-modal="true" :autoOpen="false" width="300px" height="150px"
        :ok-button="`#input-dialog-${uuid}-ok`" :cancel-button="`#input-dialog-${uuid}-cancel`"
        modal-opacity="0.7" theme="metrodark" @close="onClose($event)">
        <div>标题</div>
        <div>
            {{ content }}
            <p>
                <input v-model="inputText" type="text" :id="`input-dialog-${uuid}-input`" />
            </p>
            <div style="display:flex; justify-content:flex-end;">
                <button type="button" :id="`input-dialog-${uuid}-ok`">确定</button>
                <button type="button" :id="`input-dialog-${uuid}-cancel`">取消</button>
            </div>
        </div>
    </jqx-window>
</template>

<script lang="ts">
/// <reference path="../jqwidgets.d.ts" />

import Vue from 'vue';
import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import JqxButton from "jqwidgets-scripts/jqwidgets-vue/vue_jqxbuttons.vue";
import JqxInput from "jqwidgets-scripts/jqwidgets-vue/vue_jqxinput.vue";
import { Component, Prop } from "vue-property-decorator";
import uuid from "uuid";

@Component({
    components: {
        "jqx-window": JqxWindow,
        "jqx-button": JqxButton,
        "jqx-input": JqxInput
    }
})
export default class ConfirmDialog extends Vue {
    private content: string = '';
    private inputText: string = '';

    private resolve: ((text: string) => void) | null = null;
    private reject: (() => void) | null = null;
    private uuid: string;

    constructor() {
        super();
        this.uuid = uuid.v1();
    }

    private initContent() {
        jqwidgets.createInstance(`#input-dialog-${this.uuid}-ok`, 'jqxButton', { theme:"metrodark", width: 80, height: 30 });
        jqwidgets.createInstance(`#input-dialog-${this.uuid}-cancel`, 'jqxButton', { theme:"metrodark", width: 80, height: 30 });
        jqwidgets.createInstance(`#input-dialog-${this.uuid}-input`, 'jqxInput', { theme: "metrodark", width: 280, height: 30 });
    }

    private onClose(event: any): void {
        if (this.resolve != null && this.reject != null) {
            if (event.args.dialogResult.OK) {
                this.resolve(this.inputText);
            }
            if (event.args.dialogResult.Cancel || event.args.dialogResult.None) {
                this.reject();
            }
            this.resolve = null;
            this.reject = null;
        }
    }

    show(content: string, title: string, defaultText?: string): Promise<string | null> | null {
        if (this.resolve == null && this.reject == null) {
            (<any>this.$refs['dialog']).setTitle(title);
            this.content = content;
            this.inputText = defaultText ? defaultText : '';
            (<any>this.$refs['dialog']).open();
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
        return null;
    }
}

</script>
