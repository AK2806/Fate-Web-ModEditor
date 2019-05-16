/// <reference path="../jqwidgets.d.ts" />

import $ from 'jquery';
import 'jqwidgets-scripts/jqwidgets/jqxcore.js';
import 'jqwidgets-scripts/jqwidgets/jqxdata.js';
import 'jqwidgets-scripts/jqwidgets/jqxbuttons.js';
import 'jqwidgets-scripts/jqwidgets/jqxscrollbar.js';
import 'jqwidgets-scripts/jqwidgets/jqxdatatable.js';
import 'jqwidgets-scripts/jqwidgets/jqxtreegrid.js';
import 'jqwidgets-scripts/jqwidgets/jqxlistbox.js';
import 'jqwidgets-scripts/jqwidgets/jqxinput.js';
import 'jqwidgets-scripts/jqwidgets/jqxcheckbox.js';
import 'jqwidgets-scripts/jqwidgets/jqxdropdownlist.js';
import 'jqwidgets-scripts/jqwidgets/jqxdropdownbutton.js';
import 'jqwidgets-scripts/jqwidgets/jqxcolorpicker.js';
import uuid from 'uuid';

export interface IProperty {
    propertyName: string;
    type: string;
    showName: string;
    groupName?: string;
}

export abstract class IPropertyContainer {
    manager: PropertyEditor | null = null;

    protected propertyUpdated(propertyName: string, oldVal: any, newVal: any): void {
        if (this.manager != null) {
            this.manager.valueChanged(propertyName, oldVal, newVal);
        }
    }

    abstract getWatchedProperties(): IProperty[];
}

interface IDataSource {
    property: string;
    value: string;
    type: string;
    mappingName?: string;
    children?: IDataSource[];
}

export class PropertyEditor {
    private uuid: string;
    private gridComponent : jqwidgets.jqxTreeGrid | null = null;
    private containerSelector: string = '';
    private dataSource: IDataSource[] = [];

    private readonly inputs: Map<string, jqwidgets.jqxInput> = new Map<string, jqwidgets.jqxInput>();
    private readonly dropDownLists: Map<string, jqwidgets.jqxDropDownList> = new Map<string, jqwidgets.jqxDropDownList>();
    private readonly colorPickers: Map<string, jqwidgets.jqxColorPicker> = new Map<string, jqwidgets.jqxColorPicker>();
    private readonly checkBoxes: Map<string, jqwidgets.jqxCheckBox> = new Map<string, jqwidgets.jqxCheckBox>();

    private watchTarget: IPropertyContainer | null = null;
    private editorModifying: boolean = false;
    private externalModifying: boolean = false;

    constructor() {
        this.uuid = uuid.v1().replace(/-/g, '');
    }

    initView(selector: string) {
        this.containerSelector = selector;
        this.rebuildComponent();
    }

    private rebuildComponent(): void {
        let source: any = {
            dataType: 'json',
            dataFields: [
                { name: 'property', type: 'string' },
                { name: 'value', type: 'string' },
                { name: 'type', type: 'string' },
                { name: 'mappingName', type: 'string' },
                { name: 'children', type: 'array' }
            ],
            hierarchy:
                {
                    root: 'children'
                },
            localData: this.dataSource
        };
        if (this.gridComponent != null) {
            this.inputs.clear();
            this.dropDownLists.clear();
            this.colorPickers.clear();
            this.checkBoxes.clear();
            this.gridComponent = null;
            $(this.containerSelector).children().remove();
        }
        $(`<div id="property-editor-${this.uuid}"></div>`).appendTo($(this.containerSelector));
        this.gridComponent = jqwidgets.createInstance(`#property-editor-${this.uuid}`, 'jqxTreeGrid', {
            theme: 'metrodark',
            width: '99%',
            source: new jqx.dataAdapter(source),
            altRows: true,
            autoRowHeight: true,
            editSettings: {
                saveOnPageChange: true, saveOnBlur: true,
                saveOnSelectionChange: true, cancelOnEsc: true,
                saveOnEnter: true, editOnDoubleClick: true, editOnF2: true
            },
            editable: true,
            columns: [
                { text: '属性名', editable: false, columnType: 'none', dataField: 'property', width: 200 },
                {
                    text: '值', dataField: 'value', width: 230, columnType: 'custom',
                    // creates an editor depending on the 'type' value.
                    createEditor: (rowKey: any, cellvalue: any, editor: any, cellText: any, width: any, height: any): void => {
                        let component = this.gridComponent as jqwidgets.jqxTreeGrid;
                        let row = component.getRow(rowKey) as any;
                        switch (row['type']) {
                            case 'string':
                            case 'number':
                                $(`<input id="property-editor-${this.uuid}-input-${rowKey}" style="border: none;"/>`).appendTo(editor);
                                this.inputs.set(rowKey, jqwidgets.createInstance(`#property-editor-${this.uuid}-input-${rowKey}`, 'jqxInput', { width: '100%', height: '100%' }));
                                break;
                            case 'align':
                                $(`<div id="property-editor-${this.uuid}-dropdownlist-${rowKey}" style="border: none;"></div>`).appendTo(editor);
                                let options =
                                    {
                                        width: '100%', height: '100%', autoDropDownHeight: true, source: ['Left', 'Center', 'Right']
                                    };
                                this.dropDownLists.set(rowKey, jqwidgets.createInstance(`#property-editor-${this.uuid}-dropdownlist-${rowKey}`, 'jqxDropDownList', options));
                                break;
                            case 'color':
                                $(`<div id="property-editor-${this.uuid}-colorpicker-container-${rowKey}" style="border: none;"><div style="padding: 5px;"><div id="property-editor-${this.uuid}-colorpicker-${rowKey}"></div></div></div>`).appendTo(editor);
                                let dropDownButton = jqwidgets.createInstance(`#property-editor-${this.uuid}-colorpicker-container-${rowKey}`, 'jqxDropDownButton', { width: '100%', height: '100%', theme: 'metrodark' });
                                let colorPicker = jqwidgets.createInstance(`#property-editor-${this.uuid}-colorpicker-${rowKey}`, 'jqxColorPicker', { width: 220, height: 220, theme: 'metrodark' });
                                colorPicker.addEventHandler('colorchange', (event: any): void => {
                                    dropDownButton.setContent(this.getTextElementByColor(event.args.color));
                                });
                                this.colorPickers.set(rowKey, colorPicker);
                                break;
                            case 'bool':
                                $(`<div id="property-editor-${this.uuid}-checkbox-${rowKey}" style="margin-top: 6px; margin-left: -8px; left: 50%; position: relative;"></div>`).appendTo(editor);
                                this.checkBoxes.set(rowKey, jqwidgets.createInstance(`#property-editor-${this.uuid}-checkbox-${rowKey}`, 'jqxCheckBox', { checked: cellvalue }));
                                break;
                        }
                    },
                    // updates the editor's value.
                    initEditor: (rowKey: any, cellvalue: any, editor: any, cellText: any, width: any, height: any): void => {
                        let component = this.gridComponent as jqwidgets.jqxTreeGrid;
                        let row = component.getRow(rowKey) as any;
                        switch (row['type']) {
                            case "string":
                            case "number":
                                let input = this.inputs.get(rowKey);
                                if (input) input.val(cellvalue);
                                break;
                            case "align":
                                let dropDownList = this.dropDownLists.get(rowKey);
                                if (dropDownList) dropDownList.val(cellvalue);
                                break;
                            case "color":
                                let colorPicker = this.colorPickers.get(rowKey);
                                if (colorPicker) colorPicker.setColor(cellvalue);
                                break;
                            case "bool":
                                let checkBox = this.checkBoxes.get(rowKey);
                                if (checkBox) checkBox.val(cellvalue);
                                break;
                        }
                    },
                    // returns the value of the custom editor.
                    getEditorValue: (rowKey: any, cellvalue: any, editor: any): any => {
                        let component = this.gridComponent as jqwidgets.jqxTreeGrid;
                        let row = component.getRow(rowKey) as any;
                        switch (row['type']) {
                            case "string":
                                let strInput = this.inputs.get(rowKey);
                                return strInput ? strInput.val() : '';
                            case "number":
                                let numberInput = this.inputs.get(rowKey);
                                if (!numberInput) return 0;
                                var number = parseFloat(numberInput.val());
                                if (isNaN(number)) {
                                    return 0;
                                }
                                else return number;
                            case "align":
                                let dropDownList = this.dropDownLists.get(rowKey);
                                return dropDownList ? dropDownList.val() : '';
                            case "color":
                                let colorPicker = this.colorPickers.get(rowKey);
                                return colorPicker ? '#' + colorPicker.getColor().hex : '#000000';
                            case "bool":
                                let checkBox = this.checkBoxes.get(rowKey);
                                return checkBox ? checkBox.val() : 'false';
                        }
                        return '';
                    }
                }
            ]
        }) as jqwidgets.jqxTreeGrid;
        this.gridComponent.addEventHandler('cellValueChanged', (event: any): void => {
            this.treeGridOnCellValueChanged(event);
        });
    }

    private getTextElementByColor(color: any): any {
        if (color == 'transparent' || color.hex == "") {
            return $("<div style='text-shadow: none; position: relative; padding-bottom: 4px; margin-top: 4px;'>transparent</div>");
        }
        var element = $("<div style='text-shadow: none; position: relative; padding-bottom: 4px; margin-top: 4px;'>#" + color.hex + "</div>");
        var nThreshold = 105;
        var bgDelta = (color.r * 0.299) + (color.g * 0.587) + (color.b * 0.114);
        var foreColor = (255 - bgDelta < nThreshold) ? 'Black' : 'White';
        element.css('color', foreColor);
        element.css('background', "#" + color.hex);
        element.addClass('jqx-rc-all');
        return element;
    }

    private treeGridOnCellValueChanged(event: any): void {
        let component = this.gridComponent as jqwidgets.jqxTreeGrid;
        // Update the Location and Size properties and their nested properties.
        let args = event.args;
        let row = args.row;
        let records = row.records;
        // update the nested properties when a parent value is changed.
        if (records.length > 0) {
            let values = args.value.split(',');
            for (let i = 0; i < values.length; i++) {
                let value = $.trim(values[i]);
                let rowKey = component.getKey(records[i]);
                component.setCellValue(rowKey, 'value', value);
            }
        }
        // update the parent value when the user changes a nested property,
        else if (row.level == 1) {
            let parent = row.parent;
            let parentRowKey = component.getKey(parent);
            let value = '';
            let records = parent.records;
            if (records.length > 0) {
                for (let i = 0; i < records.length; i++) {
                    let rowKey = component.getKey(records[i]);
                    let cellValue = component.getCellValue(rowKey, 'value');
                    value += cellValue;
                    if (i < records.length - 1) {
                        value += ', ';
                    }
                }
            }
            component.setCellValue(parentRowKey, 'value', value);
        }
        if (!this.externalModifying) {
            if (row['mappingName']) {
                this.editorModifying = true;
                if (this.watchTarget != null) {
                    let rawObj: any = this.watchTarget;
                    switch (row['type']) {
                        case "number":
                            let num = parseFloat(args.value);
                            rawObj[row['mappingName']] = !isNaN(num) ? num : 0;
                            break;
                        case "string":
                        case "align":
                        case "color":
                            rawObj[row['mappingName']] = args.value;
                            break;
                        case "bool":
                            rawObj[row['mappingName']] = args.value == 'true' ? true : false;
                            break;
                    }
                }
                this.editorModifying = false;
            }
        }
    }

    bindObject(obj: IPropertyContainer): void {
        this.watchTarget = obj;
        this.watchTarget.manager = this;
        let properties = obj.getWatchedProperties();
        let rawObj = obj as any;
        this.dataSource = [];
        for (let idx in properties) {
            let property = properties[idx];
            if (property.groupName) {
                let found = this.dataSource.find((element: IDataSource): boolean => {
                    return element.property == property.groupName;
                });
                if (found) {
                    if (!found.children) found.children = [];
                    found.children.push({ property: property.showName, value: rawObj[property.propertyName], type: property.type, mappingName: property.propertyName });
                    let valueStr = found.children[0].value;
                    for (let i = 1; i < found.children.length; i++) {
                        const child = found.children[i];
                        valueStr += ', ' + child.value;
                    }
                    found.value = valueStr;
                    found.type = 'string';
                    found.mappingName = undefined;
                } else {
                    let newGroup: IDataSource = { property: property.groupName, value: '', type: 'string', children: [] };
                    this.dataSource.push(newGroup);
                }
            } else {
                let found = this.dataSource.find((element: IDataSource): boolean => {
                    return element.property == property.showName;
                });
                if (!found) {
                    this.dataSource.push({ property: property.showName, value: rawObj[property.propertyName], type: property.type, mappingName: property.propertyName });
                } else {
                    found.value = rawObj[property.propertyName];
                    found.type = property.type;
                    found.mappingName = property.propertyName;
                    found.children = undefined;
                }
            }
        }
        if (this.containerSelector != '') {
            this.rebuildComponent();
        }
    }

    valueChanged(propertyName: string, oldVal: any, newVal: any) {
        if (!this.editorModifying) {
            if (this.gridComponent != null) {
                let rows = this.gridComponent.getRows();
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i] as any;
                    if (row['mappingName'] == propertyName) {
                        this.externalModifying = true;
                        this.gridComponent.setCellValue(this.gridComponent.getKey(row), 'value', newVal.toString());
                        this.externalModifying = false;
                        break;
                    }
                }
            }
        }
    }
}