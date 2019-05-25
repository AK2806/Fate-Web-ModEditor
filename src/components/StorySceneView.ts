import $ from 'jquery';
import uuid from 'uuid';
import Konva from 'konva';
import { IPropertyContainer, IProperty } from './PropertyEditor';
import {
    IResourceItem,
    IResourceManagerModel,
    IResourceManagerModelObserver
} from "./ResourceManagerView";

function Tint(data: any) {
    let imageData = data as ImageData;
    let red: number = this.getAttr('tintRed');
    let green: number = this.getAttr('tintGreen');
    let blue: number = this.getAttr('tintBlue');
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] *= (red / 255);
        imageData.data[i + 1] *= (green / 255);
        imageData.data[i + 2] *= (blue / 255);
    }
}

export class StorySceneView {
    private _uuid: string;
    private _stageWidth: number = 1920;
    private _stageHeight: number = 1080;

    private _stage: Konva.Stage | null = null;
    private _model: StorySceneModel | null = null;
    private _objectsLayer: Konva.Layer = new Konva.Layer();
    private _cameraLayer: Konva.Layer = new Konva.Layer();
    private _camera: Konva.Group | null = null;
    private _cameraRect: Konva.Rect | null = null;
    private _resourceModel: IResourceManagerModel | null = null;

    private _image2ObjectIdMap: Map<Konva.Image, string> = new Map();
    private _objectId2ImageMap: Map<string, Konva.Image> = new Map();

    private _modelModifying: boolean = false;
    private _viewModifying: boolean = false;

    private _selectObjectListeners: ((selectedGameObjectId: string | null) => void)[] = [];

    private _selectedObjectId: string | null = null;

    constructor() {
        this._uuid = uuid.v1();
    }

    addSelectObjectListener(callback: (selectedGameObjectId: string | null) => void) {
        this._selectObjectListeners.push(callback);
    }

    clearSelectObjectListeners() {
        this._selectObjectListeners.splice(0, this._selectObjectListeners.length);
    }

    getSelectedGameObjectId(): string | null {
        return this._selectedObjectId;
    }

    selectGameObject(id: string | null) {
        if (this._stage != null) {
            // remove transformers
            (this._stage.find('Transformer') as any).destroy();
            this._objectsLayer.draw();
            if (id == 'camera') {
                // select camera
                let cameraRect = this._cameraRect as Konva.Rect;
                cameraRect.strokeWidth(2);
                this._cameraLayer.draw();
                this._selectedObjectId = id;
                // invoke callbacks
                for (let i = 0; i < this._selectObjectListeners.length; i++) {
                    const listener = this._selectObjectListeners[i];
                    listener('camera');
                }
            } else if (id != null) {
                // unselect camera
                let cameraRect = this._cameraRect as Konva.Rect;
                cameraRect.strokeWidth(1);
                this._cameraLayer.draw();
                let image = this._objectId2ImageMap.get(id);
                if (image) {
                    if (image.getAttr('transformable')) {
                        // create new transformer
                        var tr = new Konva.Transformer();
                        this._objectsLayer.add(tr as any);
                        tr.attachTo(image);
                        this._objectsLayer.draw();
                    }
                    this._selectedObjectId = id;
                    // invoke callbacks
                    for (let i = 0; i < this._selectObjectListeners.length; i++) {
                        const listener = this._selectObjectListeners[i];
                        listener(id);
                    }
                }
            } else {
                // unselect camera
                let cameraRect = this._cameraRect as Konva.Rect;
                cameraRect.strokeWidth(1);
                this._cameraLayer.draw();
                this._selectedObjectId = id;
                // invoke callbacks
                for (let i = 0; i < this._selectObjectListeners.length; i++) {
                    const listener = this._selectObjectListeners[i];
                    listener(null);
                }
            }
        }
    }

    bindModel(model: StorySceneModel) {
        if (this._model != null) {
            this._model.removeObserver(this);
        }
        this._model = model;
        model.addObserver(this);
        let cameraImage = new Image();
        cameraImage.src = require('../assets/camera.png');
        cameraImage.onload = () => {
            let model = this._model as StorySceneModel;
            let cameraIcon = new Konva.Image({
                offsetX: 32, offsetY: 32,
                width: 64, height: 64,
                image: cameraImage,
                e: 3
            });
            this._cameraRect = new Konva.Rect({
                offsetX: model.camera.scl / 9 * 16 / 2, offsetY: model.camera.scl / 2,
                width: model.camera.scl / 9 * 16, height: model.camera.scl,
                stroke: 'white',
                strokeWidth: 1
            })
            this._camera = new Konva.Group({
                x: model.camera.x,
                y: model.camera.y,
                draggable: true
            });
            this._camera.add(cameraIcon);
            this._camera.add(this._cameraRect);
            this._camera.on('dragstart', () => {
                this.selectGameObject('camera');
            });
            this._camera.on('dragmove', () => {
                this.cameraTransformed();
            });
            this._cameraLayer.add(this._camera);
            this._cameraLayer.draw();
        }
    }

    initView(selector: string, resourceModel: IResourceManagerModel) {
        $(`<div id="story-scene-${this._uuid}"></div>`).appendTo($(selector));
        this._resourceModel = resourceModel;
        this._stage = new Konva.Stage({
            container: `story-scene-${this._uuid}`,
            width: this._stageWidth,
            height: this._stageHeight
        });
        this._stage.getContent().style.backgroundColor = 'black';
        this._stage.add(this._objectsLayer);
        this._stage.add(this._cameraLayer);
        this._stage.draw();
        this._stage.on('click', (e: any) => {
            let stage = this._stage as Konva.Stage;
            this.selectGameObject(null);
            if (e.target == this._cameraRect) {
                this.selectGameObject('camera');
            } else {
                if (e.target instanceof Konva.Image) {
                    let objectId = this._image2ObjectIdMap.get(e.target);
                    if (objectId) {
                        this.selectGameObject(objectId);
                    }
                }
            }
        });
    }

    private imageTransformed(target: Konva.Image) {
        if (this._modelModifying) return;
        let objectId = this._image2ObjectIdMap.get(target) as string;
        if (this._model != null) {
            let object = this._model.getGameObject(objectId) as StoryGameObject;
            this._viewModifying = true;
            object.x = target.x();
            object.y = target.y();
            object.angle = target.rotation();
            object.sclX = target.scaleX();
            object.sclY = target.scaleY();
            object.zIndex = target.getZIndex();
            object.color = '#' +
                        target.getAttr('tintRed').toString(16).padStart(2, '0') +
                        target.getAttr('tintGreen').toString(16).padStart(2, '0') +
                        target.getAttr('tintBlue').toString(16).padStart(2, '0');
            this._viewModifying = false;
        }
    }

    private cameraTransformed() {
        if (this._modelModifying) return;
        let camera = this._camera as Konva.Group;
        if (this._model != null) {
            this._viewModifying = true;
            this._model.camera.x = camera.x();
            this._model.camera.y = camera.y();
            this._viewModifying = false;
        }
    }

    onGameObjectAdded(gameObject: StoryGameObject) {
        if (this._resourceModel == null) return;
        let blob = this._resourceModel.getResource(gameObject.spritePath);
        if (blob != null) {
            let blobData = blob.getData();
            if (blobData != null) {
                let fileReader = new FileReader();
                fileReader.readAsDataURL(blobData);
                fileReader.onload = (e: any) => {
                    let imageElement = new Image();
                    imageElement.src = e.target.result;
                    imageElement.onload = () => {
                        if (this._stage != null) {
                            let image = new Konva.Image({
                                x: this._stage.width() / 2,
                                y: this._stage.height() / 2,
                                image: imageElement,
                                draggable: true,
                                transformable: true,
                                tintRed: 255,
                                tintGreen: 255,
                                tintBlue: 255
                            });
                            image.on('transformstart', () => {
                                this.imageTransformed(image);
                            });
                            image.on('dragstart', () => {
                                this.selectGameObject(gameObject.id);
                            });
                            image.on('dragmove', () => {
                                this.imageTransformed(image);
                            });
                            image.on('transform', () => {
                                this.imageTransformed(image);
                            });
                            image.on('transformend', () => {
                                this.imageTransformed(image);
                            });
                            image.cache(undefined);
                            image.filters([Tint]);
                            this._objectsLayer.add(image);
                            this._objectsLayer.draw();
                            this._objectId2ImageMap.set(gameObject.id, image);
                            this._image2ObjectIdMap.set(image, gameObject.id);
                            this.selectGameObject(gameObject.id);
                        }
                    }
                }
            }
        }
    }

    onGameObjectRemoved(id: string) {
        this.selectGameObject(null);
        let image = this._objectId2ImageMap.get(id) as Konva.Image;
        this._objectId2ImageMap.delete(id);
        this._image2ObjectIdMap.delete(image);
        image.destroy();
        this._objectsLayer.draw();
    }

    onGameObjectValueChanged(id: string, property: string, value: any) {
        if (this._viewModifying) return;
        let image = this._objectId2ImageMap.get(id) as Konva.Image;
        if (this._stage != null) {
            this._modelModifying = true;
            switch (property) {
                case 'x':
                    image.x(value);
                    break;
                case 'y':
                    image.y(value);
                    break;
                case 'zIndex':
                    image.setZIndex(value);
                    break;
                case 'angle':
                    image.rotation(value);
                    break;
                case 'sclX':
                    image.scaleX(value);
                    break;
                case 'sclY':
                    image.scaleY(value);
                    break;
                case 'color':
                    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
                    if (result) {
                        image.setAttr('tintRed', parseInt(result[1], 16));
                        image.setAttr('tintGreen', parseInt(result[2], 16));
                        image.setAttr('tintBlue', parseInt(result[3], 16));
                    }
                    image.filters([Tint]);
                    break;
            }
            this._modelModifying = false;
            this._objectsLayer.draw();
        }
    }

    onCameraValueChanged(property: string, value: any) {
        if (this._viewModifying) return;
        let camera = this._camera as Konva.Group;
        if (this._stage != null) {
            this._modelModifying = true;
            switch (property) {
                case 'x':
                    camera.x(value);
                    break;
                case 'y':
                    camera.y(value);
                    break;
                case 'scl':
                    let cameraRect = this._cameraRect as Konva.Rect;
                    cameraRect.width(value / 9 * 16);
                    cameraRect.height(value);
                    cameraRect.offsetX(cameraRect.width() / 2);
                    cameraRect.offsetY(cameraRect.height() / 2);
                    break;
            }
            this._modelModifying = false;
            this._cameraLayer.draw();
        }
    }

    onClear() {
        this._image2ObjectIdMap.clear();
        this._objectId2ImageMap.clear();
        this._camera = null;
        this._cameraRect = null;
        this._objectsLayer.clear();
        this._cameraLayer.clear();
        this._objectsLayer.draw();
        this._cameraLayer.draw();
    }
}

class InspectorItem implements IResourceItem {
    readonly id: string;
    icon: string = 'object';
    label: string;
    obj: StoryGameObject;

    constructor(id: string, label: string, obj: StoryGameObject) {
        this.id = id;
        this.label = label;
        this.obj = obj;
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

    getData(): StoryGameObject {
        return this.obj;
    }

    getParent(): IResourceItem | null {
        return null;
    }

    getChildren(): IResourceItem[] {
        return [];
    }

    getFullPath(): string {
        return this.id;
    }
}

export class StorySceneModel implements IResourceManagerModel {
    private _inspectorObservers: IResourceManagerModelObserver[] = [];
    private _observers: StorySceneView[] = [];

    private _camera: StoryGameCamera = new StoryGameCamera();
    private _objectsMap: Map<string, StoryGameObject> = new Map();

    constructor() {
        this._camera.container = this;
    }

    onGameObjectValueChanged(id: string, property: string, value: any) {
        for (let i = 0; i < this._observers.length; i++) {
            const observer = this._observers[i];
            observer.onGameObjectValueChanged(id, property, value);
        }
        if (property == 'name') {
            for (let i = 0; i < this._inspectorObservers.length; i++) {
                const observer = this._inspectorObservers[i];
                let inspectorItem = this.getResource(id) as InspectorItem;
                observer.onResourceUpdated(inspectorItem);
            }
        }
    }

    onCameraValueChanged(property: string, value: any) {
        for (let i = 0; i < this._observers.length; i++) {
            const observer = this._observers[i];
            observer.onCameraValueChanged(property, value);
        }
    }

    addDataObserver(observer: IResourceManagerModelObserver): void {
        this._inspectorObservers.push(observer);
        for (let [key, value] of this._objectsMap) {
            for (let i = 0; i < this._inspectorObservers.length; i++) {
                const observer = this._inspectorObservers[i];
                let inspectorItem = new InspectorItem(key, value.name, value);
                observer.onResourceAdded(inspectorItem);
            }
        }
    }

    removeDataObserver(observer: IResourceManagerModelObserver): void {
        let idx = this._inspectorObservers.indexOf(observer);
        if (idx == -1) return;
        let observers = this._inspectorObservers.splice(idx, 1);
        observers[0].onClear();
    }
    
    getResource(path: string): IResourceItem | null {
        let obj = this._objectsMap.get(path);
        if (!obj) return null; 
        return new InspectorItem(obj.id, obj.name, obj);
    }

    addObserver(view: StorySceneView): void {
        this._observers.push(view);
        for (let [key, value] of this._objectsMap) {
            view.onGameObjectAdded(value);
        }
        for (let property in this._camera) {
            view.onCameraValueChanged(property, (this._camera as any)[property]);
        }
    }

    removeObserver(view: StorySceneView): void {
        let index = this._observers.indexOf(view);
        if (index != -1) {
            this._observers.splice(index, 1);
            view.onClear();
        }
    }

    getGameObject(id: string): StoryGameObject | null {
        let ret = this._objectsMap.get(id);
        return ret ? ret : null;
    }

    get camera(): StoryGameCamera {
        return this._camera;
    }

    addGameObject(gameObject: StoryGameObject): void {
        this._objectsMap.set(gameObject.id, gameObject);
        gameObject.container = this;
        for (let i = 0; i < this._observers.length; i++) {
            const observer = this._observers[i];
            observer.onGameObjectAdded(gameObject);
        }
        for (let i = 0; i < this._inspectorObservers.length; i++) {
            const observer = this._inspectorObservers[i];
            let inspectorItem = new InspectorItem(gameObject.id, gameObject.name, gameObject);
            observer.onResourceAdded(inspectorItem);
        }
    }

    removeGameObject(id: string): boolean {
        let gameObject = this._objectsMap.get(id);
        let removed = this._objectsMap.delete(id);
        if (removed) {
            (gameObject as StoryGameObject).container = null;
            for (let i = 0; i < this._observers.length; i++) {
                const observer = this._observers[i];
                observer.onGameObjectRemoved(id);
            }
            for (let i = 0; i < this._inspectorObservers.length; i++) {
                const observer = this._inspectorObservers[i];
                observer.onResourceRemoved(id);
            }
        }
        return removed;
    }
}

export class StoryGameObject extends IPropertyContainer {
    container: StorySceneModel | null = null;

    private _id: string;
    private _name: string = '未命名对象';
    private _x: number = 0;
    private _y: number = 0;
    private _zIndex: number = 0;
    private _angle: number = 0;
    private _sclX: number = 1;
    private _sclY: number = 1;
    private _colorR: number = 1;
    private _colorG: number = 1;
    private _colorB: number = 1;
    private _spritePath: string;

    constructor(spritePath: string) {
        super();
        this._id = uuid.v1();
        this._spritePath = spritePath;
    }

    protected valueUpdated(propertyName: string, oldVal: any, newVal: any) {
        if (this.container != null) {
            this.container.onGameObjectValueChanged(this._id, propertyName, newVal);
        }
        this.propertyUpdated(propertyName, oldVal, newVal);
    }

    getWatchedProperties(): IProperty[] {
        return [
            { propertyName: 'name', type: 'string', showName: '名称' },
            { propertyName: 'x', type: 'number', showName: 'X', groupName: '位置' },
            { propertyName: 'y', type: 'number', showName: 'Y', groupName: '位置' },
            { propertyName: 'angle', type: 'number', showName: '旋转' },
            { propertyName: 'sclX', type: 'number', showName: 'X', groupName: '缩放' },
            { propertyName: 'sclY', type: 'number', showName: 'Y', groupName: '缩放' },
            { propertyName: 'color', type: 'color', showName: '颜色' },
            { propertyName: 'zIndex', type: 'number', showName: '前后顺序' }
        ];
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get zIndex(): number {
        return this._zIndex;
    }

    get angle(): number {
        return this._angle;
    }

    get sclX(): number {
        return this._sclX;
    }

    get sclY(): number {
        return this._sclY;
    }

    get colorR(): number {
        return this._colorR;
    }

    get colorG(): number {
        return this._colorG;
    }

    get colorB(): number {
        return this._colorB;
    }

    get color(): string {
        return '#' + this._colorR.toString(16).padStart(2, '0') + this.colorG.toString(16).padStart(2, '0') + this.colorB.toString(16).padStart(2, '0');
    }

    get spritePath(): string {
        return this._spritePath;
    }

    set name(val: string) {
        let oldVal = this._name;
        this._name = val;
        this.valueUpdated('name', oldVal, val);
    }

    set x(val: number) {
        let oldVal = this._x;
        this._x = val;
        this.valueUpdated('x', oldVal, val);
    }

    set y(val: number) {
        let oldVal = this.y;
        this._y = val;
        this.valueUpdated('y', oldVal, val);
    }

    set zIndex(val: number) {
        let oldVal = this._zIndex;
        this._zIndex = val;
        this.valueUpdated('zIndex', oldVal, val);
    }

    set angle(val: number) {
        let oldVal = this._angle;
        this._angle = val;
        this.valueUpdated('angle', oldVal, val);
    }

    set sclX(val: number) {
        let oldVal = this._sclX;
        this._sclX = val;
        this.valueUpdated('sclX', oldVal, val);
    }

    set sclY(val: number) {
        let oldVal = this._sclY;
        this._sclY = val;
        this.valueUpdated('sclY', oldVal, val);
    }

    set color(val: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(val);
        if (result) {
            let oldVal = this.color;
            this._colorR = parseInt(result[1], 16);
            this._colorG = parseInt(result[2], 16);
            this._colorB = parseInt(result[3], 16);
            this.valueUpdated('color', oldVal, val);
        }
    }
}

export class StoryGameCamera extends IPropertyContainer {
    container: StorySceneModel | null = null;
    
    private _x: number = 500;
    private _y: number = 400;
    private _scl: number = 480;
    
    protected valueUpdated(propertyName: string, oldVal: any, newVal: any) {
        if (this.container != null) {
            this.container.onCameraValueChanged(propertyName, newVal);
        }
        this.propertyUpdated(propertyName, oldVal, newVal);
    }

    getWatchedProperties(): IProperty[] {
        return [
            { propertyName: 'x', type: 'number', showName: 'X', groupName: '位置' },
            { propertyName: 'y', type: 'number', showName: 'Y', groupName: '位置' },
            { propertyName: 'scl', type: 'number', showName: '尺寸' }
        ];
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get scl(): number {
        return this._scl;
    }

    set x(val: number) {
        let oldVal = this._x;
        this._x = val;
        this.valueUpdated('x', oldVal, val);
    }

    set y(val: number) {
        let oldVal = this._y;
        this._y = val;
        this.valueUpdated('y', oldVal, val);
    }

    set scl(val: number) {
        let oldVal = this._scl;
        this._scl = val;
        this.valueUpdated('scl', oldVal, val);
    }
}