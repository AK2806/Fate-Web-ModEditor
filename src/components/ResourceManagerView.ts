/// <reference path="../jqwidgets.d.ts" />

import $ from 'jquery';
import 'jqwidgets-scripts/jqwidgets/jqxcore.js';
import 'jqwidgets-scripts/jqwidgets/jqxdata.js';
import 'jqwidgets-scripts/jqwidgets/jqxbuttons.js';
import 'jqwidgets-scripts/jqwidgets/jqxscrollbar.js';
import 'jqwidgets-scripts/jqwidgets/jqxpanel.js';
import 'jqwidgets-scripts/jqwidgets/jqxdragdrop.js';
import 'jqwidgets-scripts/jqwidgets/jqxtree.js';
import 'jqwidgets-scripts/jqwidgets/jqxcheckbox.js';
import uuid from 'uuid';

export interface ResourceManagerViewSelectEvent {
    selectedItem: IResourceItem
}

export class ResourceManagerView implements IResourceManagerModelObserver {
    private treeComponent: jqwidgets.jqxTree | null = null;
    private model: IResourceManagerModel | null = null;
    private uuid: string;
    private selectEventListeners: ((e : ResourceManagerViewSelectEvent) => void)[] = [];

    constructor() {
        this.uuid = uuid.v1().replace(/-/g, '');
    }

    private getSelectorFromPath(path: string): string {
        return 'li#jqxtree-item-' + this.uuid + '-' + path.replace(/\./g, '-');
    }

    private getIcon(icon: string): any {
        switch (icon) {
            case 'folder':
                return require('../assets/icons/icons8_opened_folder.svg');
            case 'file-image':
                return require('../assets/icons/icons8-image-file.svg');
            case 'file-raw':
                return require('../assets/icons/icons8_file.svg');
            case 'object':
                return require('../assets/icons/cube.svg');
            default:
                return undefined;
        }
    }

    private onSelect(e: any): void {
        if (this.model != null) {
            for (let i = 0; i < this.selectEventListeners.length; i++) {
                const listener = this.selectEventListeners[i];
                listener({ selectedItem: this.model.getResource($(e.args.element).data('path')) as IResourceItem });
            }
        }
    }

    onResourceAdded(item: IResourceItem, parentPath?: string): void {
        if (this.treeComponent != null) {
            if (parentPath == undefined) {
                this.treeComponent.addTo({ label: item.getLabel(), icon: this.getIcon(item.getIcon()), expanded: true, id: 'jqxtree-item-' + this.uuid + '-' + item.getId() });
                this.treeComponent.render();
                $(this.getSelectorFromPath(item.getId())).data('path', item.getId());
            } else {
                let selector = this.getSelectorFromPath(parentPath);
                let path = parentPath + '.' + item.getId();
                this.treeComponent.addTo({ label: item.getLabel(), icon: this.getIcon(item.getIcon()), expanded: true, id: 'jqxtree-item-' + this.uuid + '-' + path.replace(/\./g, '-') },
                    $(selector).get(0));
                this.treeComponent.render();
                $(this.getSelectorFromPath(path)).data('path', path);
            }
        }
    }

    onResourceRemoved(path: string): void {
        if (this.treeComponent != null) {
            let selector = this.getSelectorFromPath(path);
            this.treeComponent.removeItem($(selector).get(0));
            this.treeComponent.render();
        }
    }
    
    onResourceUpdated(item: IResourceItem): void {
        if (this.treeComponent != null) {
            let path = item.getFullPath();
            let selector = this.getSelectorFromPath(path);
            this.treeComponent.updateItem($(selector).get(0),
                { label: item.getLabel(), icon: this.getIcon(item.getIcon()), expanded: true, id: 'jqxtree-item-' + this.uuid + '-' + path.replace(/\./g, '-') });
            this.treeComponent.render();
        }
    }

    onClear(): void {
        if (this.treeComponent != null) {
            this.treeComponent.clear();
            this.treeComponent.render();
        }
    }

    initView(selector: string): void {
        if (this.treeComponent != null) {
            this.treeComponent.destroy();
        }
        this.treeComponent = jqwidgets.createInstance(selector, 'jqxTree', {
            width: '99%',
            height: '99%',
            theme: "metrodark",
            allowDrag: true,
            allowDrop: false
        }) as jqwidgets.jqxTree;
        this.treeComponent.addEventHandler('select', e => {
            this.onSelect(e);
        });
    }

    addSelectEventListener(onSelect: (e: ResourceManagerViewSelectEvent) => void): void {
        this.selectEventListeners.push(onSelect);
    }

    clearSelectEventListeners(): void {
        this.selectEventListeners.splice(0, this.selectEventListeners.length);
    }

    setModel(model: IResourceManagerModel): void {
        if (this.model != null) {
            this.model.removeDataObserver(this);
        }
        this.model = model;
        model.addDataObserver(this);
    }

    getSelectedItemPath(): string | null {
        if (this.treeComponent != null) {
            let treeItem = this.treeComponent.getSelectedItem();
            if (treeItem == null) return null;
            return $(treeItem.element).data('path');
        }
        return null;
    }

    getSelectedItem(): IResourceItem | null {
        if (this.treeComponent != null && this.model != null) {
            let treeItem = this.treeComponent.getSelectedItem();
            if (treeItem == null) return null;
            let path = $(treeItem.element).data('path');
            return this.model.getResource(path);
        }
        return null;
    }

    selectItem(path: string | null) : void {
        if (this.treeComponent != null) {
            if (path == null) {
                this.treeComponent.selectItem(undefined);
            } else {
                let selector = this.getSelectorFromPath(path);
                this.treeComponent.selectItem($(selector).get(0));
            }
            this.treeComponent.render();
        }
    }
}

export interface IResourceManagerModelObserver {
    onResourceAdded(item: IResourceItem, parentPath?: string): void
    onResourceRemoved(path: string): void
    onResourceUpdated(item: IResourceItem): void
    onClear(): void;
}

export interface IResourceManagerModel {
    getResource(path: string): IResourceItem | null
    addDataObserver(observer: IResourceManagerModelObserver): void
    removeDataObserver(observer: IResourceManagerModelObserver): void
}

export interface IResourceItem {
    getId(): string;
    getIcon(): string;
    getLabel(): string;
    getData(): any;
    getParent(): IResourceItem | null;
    getChildren(): IResourceItem[];
    getFullPath(): string;
}

class DefaultResourceFolder implements IResourceItem {
    readonly id: string;
    icon: string;
    label: string;

    parent: DefaultResourceFolder | null = null;
    children: (DefaultResourceFolder| DefaultResourceFile)[] = [];

    constructor(id: string, label?: string, icon?: string) {
        this.id = id;
        this.label = label ? label : '';
        this.icon = icon ? icon : 'folder';
    }

    getId(): string {
        return this.id;
    }
    
    getIcon(): string {
        return this.icon;
    }

    getLabel(): string {
        return this.label;
    }

    getData(): Blob | null {
        return null;
    }

    getParent(): IResourceItem | null {
        return this.parent;
    }

    getChildren(): IResourceItem[] {
        return this.children.slice();
    }

    getFullPath(): string {
        let ret = this.id;
        let parent = this.getParent();
        while (parent != null) {
            ret = parent.getId() + '.' + ret;
            parent = parent.getParent();
        }
        return ret;
    }
}

class DefaultResourceFile implements IResourceItem {
    readonly id: string;
    icon: string;
    label: string;
    data: Blob;
    
    parent: DefaultResourceFolder | null = null;
    
    constructor(data: Blob, id: string, label?: string, icon?: string) {
        this.data = data;
        this.id = id;
        this.label = label ? label : '';
        this.icon = icon ? icon : 'file-raw';
    }

    getId(): string {
        return this.id;
    }

    getIcon(): string {
        return this.icon;
    }

    getLabel(): string {
        return this.label;
    }

    getData(): Blob | null {
        return this.data;
    }

    getParent(): IResourceItem | null {
        return this.parent;
    }

    getChildren(): IResourceItem[] {
        return [];
    }

    getFullPath(): string {
        let ret = this.id;
        let parent = this.getParent();
        while (parent != null) {
            ret = parent.getId() + '.' + ret;
            parent = parent.getParent();
        }
        return ret;
    }
}

export class DefaultResourceManagerModel implements IResourceManagerModel {
    private observers: IResourceManagerModelObserver[] = [];

    private customResourceRoot: DefaultResourceFolder =
        new DefaultResourceFolder('custom_resource', '自定义资源', 'folder');

    constructor() {
        this.customResourceRoot.parent = null;
    }

    createFolder(location: string, label: string): IResourceItem | null {
        let parentNode = this.getResource(location);
        if (parentNode != null && parentNode instanceof DefaultResourceFolder) {
            let folder = parentNode as DefaultResourceFolder;
            let ret = new DefaultResourceFolder(uuid.v1().replace(/-/g, ''), label);
            ret.parent = folder;
            folder.children.push(ret);
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i];
                observer.onResourceAdded(ret, location);
            }
            return ret;
        }
        return null;
    }

    attachResource(location: string, label: string, icon: string, data: Blob): IResourceItem | null {
        let parentNode = this.getResource(location);
        if (parentNode != null && parentNode instanceof DefaultResourceFolder) {
            let folder = parentNode as DefaultResourceFolder;
            let ret = new DefaultResourceFile(data, uuid.v1().replace(/-/g, ''), label, icon);
            ret.parent = folder;
            folder.children.push(ret);
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i];
                observer.onResourceAdded(ret, location);
            }
            return ret;
        }
        return null;
    }

    renameNode(location: string, newLabel: string): void {
        let resource = this.getResource(location);
        if (resource != null && resource.getParent() != null) {
            let node = resource as DefaultResourceFolder | DefaultResourceFile;
            node.label = newLabel;
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i];
                observer.onResourceUpdated(node);
            }
        }
    }

    deleteNode(location: string): void {
        let resource = this.getResource(location);
        if (resource != null && resource.getParent() != null) {
            let node = resource as DefaultResourceFolder | DefaultResourceFile;
            let folder = node.getParent() as DefaultResourceFolder;
            node.parent = null;
            folder.children.splice(folder.children.indexOf(node), 1);
            for (let i = 0; i < this.observers.length; i++) {
                let observer = this.observers[i];
                observer.onResourceRemoved(location);
            }
        }
    }

    foreachItem(action: (item: IResourceItem) => void): void {
        this.recursiveHandleItem(this.customResourceRoot, action);
    }

    private recursiveHandleItem(parent: IResourceItem, action: (item: IResourceItem) => void): void {
        action(parent);
        let children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.recursiveHandleItem(child, action);
        }
    }

    addDataObserver(observer: IResourceManagerModelObserver): void {
        this.observers.push(observer);
        this.foreachItem(item => {
            let parentPath = '';
            let parent = item.getParent();
            while (parent != null) {
                parentPath = parent.getId() + '.' + parentPath;
                parent = parent.getParent();
            }
            if (parentPath != '') {
                parentPath = parentPath.slice(0, -1);
                observer.onResourceAdded(item, parentPath);
            } else {
                observer.onResourceAdded(item);
            }
        });
    }

    removeDataObserver(observer: IResourceManagerModelObserver): void {
        let idx = this.observers.indexOf(observer);
        if (idx == -1) return;
        let observers = this.observers.splice(idx, 1);
        observers[0].onClear();
    }

    getResource(path: string): IResourceItem | null {
        let pathIds = path.split('.');
        const root = this.getRootResource(pathIds[0]);
        let parent: IResourceItem | null = root;
        for (let i = 1; i < pathIds.length; i++) {
            if (parent == null) return null;
            const pathId = pathIds[i];
            parent = this.getChild(parent, pathId);
        }
        return parent;
    }

    getChild(parent: IResourceItem, childId: string): IResourceItem | null {
        let children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.getId() == childId) {
                return child;
            }
        }
        return null;
    }

    getRootResource(id: string): IResourceItem | null {
        if (id == this.customResourceRoot.getId()) {
            return this.customResourceRoot;
        } else {
            return null;
        }
    }
}