<template>
    <div>
        <header class="page-header">
            <div class="container-fluid">
                <h2 class="no-margin-bottom" v-show="isCreation">创建角色卡</h2>
                <h2 class="no-margin-bottom" v-show="!isCreation">编辑角色卡</h2>
            </div>
        </header>
        <div class="breadcrumb-holder container-fluid">
            <div class="breadcrumb">
                <button class="btn btn-secondary breadcrumb-item" @click="$emit('cancel')">返回</button>
            </div>
        </div>
        <!-- Edit Character -->
        <section id="edit-character">
        <div class="container-fluid">
            <div class="row">
            <div class="col-lg-12 form-container">
                <!-- Form Elements -->
                <form id="edit-character-form" class="form-validate"
                @submit="function(e) { e.preventDefault(); if($('#edit-character-form').valid()) submitData(); }">
                <div class="card" v-show="step == 1">
                    <div class="card-header d-flex align-items-center">
                        <h3 class="h4 px-3">角色卡&nbsp;-&nbsp;第一步&nbsp;设置立绘</h3>
                    </div>
                    <div id="edit-character-step1" class="card-body">
                        <div class="form-group row align-items-center">
                            <label class="col-lg-2 form-control-label">设定身高</label>
                            <div class="col-lg-2 input-group">
                                <input type="number" class="form-control" required min="1"
                                    data-msg="最小身高为1cm" v-model="portrait.stature" />
                                <div class="input-group-append"><span class="input-group-text">cm</span></div>
                            </div>
                        </div>
                        <div class="form-group row align-items-center">
                            <label class="col-lg-2 form-control-label">立绘选择（一定要全身立绘）</label>
                            <div class="col-lg-10">
                                <input type="file" class="form-control-file" required
                                    @change="portraitChanged($event.target.files[0])" />
                            </div>
                        </div>
                        <div class="form-group row align-items-center">
                            <div class="col-lg-10 offset-md-2">
                                <image-cropper :img-src="portrait.fileData" ref="portraitCropper"></image-cropper>
                            </div>
                        </div>
                        <div class="form-group row align-items-center">
                            <div class="col-lg-10 offset-md-2">
                                <button type="button" class="btn btn-primary"
                                    @click="function () { if($('#edit-character-step1').find('input').valid()) { step += 1; cropPortrait(); } }">
                                    下一步
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="edit-character-step2" class="card" v-show="step == 2">
                    <div class="card-header d-flex align-items-center">
                    <h3 class="h4 px-3">角色卡&nbsp;-&nbsp;第二步&nbsp;基本属性</h3>
                    </div>
                    <div class="card-body row">
                        <div class="col-lg-3">
                            <img class="w-100 img-fluid has-shadow" :src="portrait.croppedData" />
                        </div>
                        <div class="col-lg-9">
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">基本信息</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">名字</label>
                                        <div class="col-lg-8">
                                        <input type="text" class="form-control" required
                                            v-model="name" name="characterName" />
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">描述</label>
                                        <div class="col-lg-8">
                                            <textarea class="form-control" v-model="description"
                                                name="characterDescription"></textarea>
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">重振命运点</label>
                                        <div class="col-lg-2">
                                            <input type="number" class="form-control" required min="0"
                                               v-model="refreshPoint" name="characterRefreshPoint" />
                                        </div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">生理压力基础上限</label>
                                        <div class="col-lg-2">
                                            <input type="number" class="form-control" required min="1"
                                               v-model="physics" name="characterPhysics" />
                                        </div>
                                        <label class="col-lg-2 form-control-label text-center">精神压力基础上限</label>
                                        <div class="col-lg-2">
                                            <input type="number" class="form-control" required min="1"
                                               v-model="mental" name="characterMental" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">特征</span>
                                    <a href="javascript:void(0)" class="text-primary px-2 pb-4" @click="aspects.push({ name : '' })"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(aspect, index) in aspects" :key="'aspect-' + index" class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">固有特征&nbsp;{{ index + 1 }}&nbsp;</label>
                                        <div class="col-lg-9">
                                            <input type="text" class="form-control" required
                                                v-model="aspect.name" name="characterName" />
                                        </div>
                                        <a href="javascript:void(0)" class="col-lg-1" @click="aspects.splice(index, 1)"><i class="fa fa-trash" aria-hidden="true"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">技能</span>
                                    <a href="javascript:void(0)" class="text-primary px-2 pb-4" @click="plusAbilityLevel"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                    <a href="javascript:void(0)" class="text-primary px-2 pb-4" @click="minusAbilityLevel"><i class="fa fa-minus" aria-hidden="true"></i></a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="layer in ability.level" :key="'ability-layer-' + layer" class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">{{ ability.levels[ability.levels.length - ability.level + layer - 1] }}</label>
                                        <div v-for="no in layer" :key="'ability-layer-' + layer + '-no-' + no" class="col-lg-2">
                                            <select class="form-control" data-live-search="true" data-size="5" v-model="ability.abilitySelections['ability-layer-' + layer + '-no-' + no].id">
                                                <option value="">无</option>
                                                <option v-for="(ab, index) in ability.abilityList" :key="'ability-' + index" :value="ab.id"
                                                    :disabled="abilitySelected(ab.id)">
                                                    {{ ab.name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">伤痕槽</span>
                                    <a href="javascript:void(0)" class="text-primary px-2 pb-4" @click="consequences.push({ capacity : 2 })"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(consequence, index) in consequences" :key="'consequence-' + index" class="form-group row align-items-center">
                                        <label class="col-lg-2 form-control-label text-center">槽&nbsp;{{ index + 1 }}&nbsp;容量</label>
                                        <div class="col-lg-2">
                                            <input type="number" class="form-control" required min="1"
                                                v-model="consequence.capacity" name="characterName" />
                                        </div>
                                        <a href="javascript:void(0)" class="col-lg-1" @click="consequences.splice(index, 1)"><i class="fa fa-times" aria-hidden="true"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="form-group row align-items-center">
                                <div class="col-lg-12">
                                    <button type="button" class="btn btn-secondary" @click="step -= 1">上一步</button>
                                    <button type="button" class="btn btn-primary" @click="function () { if($('#edit-character-step2').find('input').valid()) { step += 1; } }">下一步</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="edit-character-step3" class="card" v-show="step == 3">
                    <div class="card-header d-flex align-items-center">
                    <h3 class="h4 px-3">角色卡&nbsp;-&nbsp;第三步&nbsp;设定特技</h3>
                    </div>
                    <div class="card-body row">
                        <div class="col-lg-3">
                            <img class="w-100 img-fluid has-shadow" :src="portrait.croppedData" />
                        </div>
                        <div class="col-lg-9">
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">特技</span>
                                    <a href="javascript:void(0)" class="text-primary px-2 pb-4" @click="stunt.selected.push({ type: 0, presetId: '', uuid: null })"><i class="fa fa-plus" aria-hidden="true"></i></a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(selectedStunt, index) in stunt.selected" :key="'stunt-' + index">
                                        <div class="form-group row align-items-center">
                                            <div class="col-lg-6">
                                                <select class="form-control" data-live-search="true" data-size="5" v-model="selectedStunt.presetId" required>
                                                    <optgroup label="预设">
                                                        <option v-for="(presetStunt, index) in stunt.presetStuntList" :key="'preset-stunt-' + index" :value="presetStunt.id"
                                                            :disabled="stunt.selected.findIndex((element) => { return element.presetId == presetStunt.id; }) != -1">
                                                            {{ presetStunt.name }}
                                                        </option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <a href="javascript:void(0)" class="col-lg-1" @click="stunt.selected.splice(index, 1)"><i class="fa fa-trash" aria-hidden="true"></i></a>
                                        </div>
                                        <div class="row">
                                            <div class="col-lg-10">
                                                <span>{{ getStuntDescription(selectedStunt) }}</span>
                                            </div>
                                        </div>
                                        <div class="line"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="form-group row align-items-center">
                                <div class="col-lg-12">
                                    <button type="button" class="btn btn-secondary" @click="step -= 1">上一步</button>
                                    <button type="submit" class="btn btn-primary">完成</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </form>
            </div>
            </div>
        </div>
        </section>
    </div>
</template>

<script>
import '../global';
import $ from 'jquery';
import Axios from 'axios';
import Vue from 'vue';
import Swal from 'sweetalert2';
import urljoin from 'url-join';
import 'jquery-validation';
import uuid from 'uuid/v1';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.css';

const abilityList = require('../assets/data/ability.json');
const presetStuntList = require('../assets/data/preset_stunt.json');

function jqueryInit() {
    // ------------------------------------------------------- //
    // Tooltips init
    // ------------------------------------------------------ //    
    $('[data-toggle="tooltip"]').tooltip();

    // ------------------------------------------------------- //
    // Adding fade effect to dropdowns
    // ------------------------------------------------------ //
    $('.dropdown').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).fadeIn();
    });
    $('.dropdown').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).fadeOut();
    });

    // ------------------------------------------------------- //
    // Universal Form Validation
    // ------------------------------------------------------ //
    $('.form-validate').each(function () {
        $(this).validate({
            errorElement: "div",
            errorClass: 'is-invalid text-red',
            validClass: 'is-valid',
            ignore: '.ignore',
            errorPlacement: function (error, element) {
                // Add the `invalid-feedback` class to the error element
                error.addClass('invalid-feedback');
                error.insertAfter(element.siblings().last());
            }
        });
    });

    // ------------------------------------------------------- //
    // External links to new window
    // ------------------------------------------------------ //
    $('.external').on('click', function (e) {
        e.preventDefault();
        window.open($(this).attr("href"));
    });
}

export default {
    props: {
        creation: {
            type: Boolean,
            default: true
        },
        initData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            step: 1,
            isCreation: this.creation,
            uuid: '',
            portrait: {
                file: null,
                fileData: '',
                croppedData: '',
                blob: null,
                stature: 170
            },
            name: '',
            description: '',
            refreshPoint: 3,
            physics: 4,
            mental: 4,
            aspects: [
                {
                    name: ''
                },
                {
                    name: ''
                },
                {
                    name: ''
                }
            ],
            ability: {
                level: 4,
                levels: [
                    ' 杰出（+5）',
                    ' 出色（+4）',
                    ' 良好（+3）',
                    ' 尚可（+2）',
                    ' 一般（+1）',
                ],
                abilityList,
                abilitySelections: {}
            },
            consequences: [
                {
                    capacity: 2
                },
                {
                    capacity: 2
                },
                {
                    capacity: 4
                },
                {
                    capacity: 6
                }
            ],
            stunt: {
                presetStuntList,
                selected: []
            }
        };
    },
    created() {
        for (let i = 1; i <= this.ability.levels.length; ++i) {
            for (let j = 1; j <= i; ++j) {
                this.$set(this.ability.abilitySelections, 'ability-layer-' + i + '-no-' + j, { id: '', level: this.ability.level - i + 1 });
            }
        }
    },
    mounted() {
        jqueryInit();
        $('select').selectpicker('refresh');
        if (this.initData != null && this.isCreation === false) {
            this.uuid = this.initData.uuid;
            //this.portrait.fileData = urljoin(apiUrlPrefix, 'img/character', this.initData.portrait.id)
            this.portrait.stature = this.initData.portrait.stature;
            this.name = this.initData.name;
            this.description = this.initData.description;
            this.refreshPoint = this.initData.refreshPoint;
            this.physics = this.initData.physics;
            this.mental = this.initData.mental;
            this.aspects.splice(0, this.aspects.length);
            for (let i in this.initData.aspects) {
                this.aspects.push(this.initData.aspects[i]);
            }
            this.setAbilityLevel(this.ability.levels.length);
            for (let i in this.initData.abilities) {
                let layer = this.ability.levels.length - this.initData.abilities[i].level + 1;
                for (let no = 1; no <= layer; ++no) {
                    if (this.ability.abilitySelections['ability-layer-' + layer + '-no-' + no].id == '') {
                        this.ability.abilitySelections['ability-layer-' + layer + '-no-' + no].id = this.initData.abilities[i].id;
                        break;
                    }
                }
            }
            this.consequences.splice(0, this.consequences.length);
            for (let i in this.initData.consequences) {
                this.consequences.push(this.initData.consequences[i]);
            }
            this.stunt.selected.splice(0, this.stunt.selected.length);
            for (let i in this.initData.stunts) {
                this.stunt.selected.push(this.initData.stunts[i]);
            }
        }
    },
    updated() {
        $('select').selectpicker('refresh');
    },
    methods: {
        $,
        log: console.log,
        portraitChanged(file) {
            this.portrait.file = file;
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = e => {
                this.portrait.fileData = e.target.result;
            };
        },
        cropPortrait() {
            let canvas = this.$refs.portraitCropper.cropper.getCroppedCanvas();
            this.portrait.croppedData = canvas.toDataURL();
            canvas.toBlob((blob) => {
                this.portrait.blob = blob;
            });
        },
        plusAbilityLevel() {
            if (this.ability.level < this.ability.levels.length) {
                this.ability.level++;
                for (let key in this.ability.abilitySelections) {
                    this.ability.abilitySelections[key].level++;
                }
            }
        },
        minusAbilityLevel() {
            if (this.ability.level > 1) {
                this.ability.level--;
                for (let key in this.ability.abilitySelections) {
                    this.ability.abilitySelections[key].level--;
                    if (this.ability.abilitySelections[key].level <= 0)
                        this.ability.abilitySelections[key].id = '';
                }
            }
        },
        setAbilityLevel(level) {
            if (level > 5 || level < 1) return;
            let distance = level - this.ability.level;
            this.ability.level = level;
            for (let key in this.ability.abilitySelections) {
                this.ability.abilitySelections[key].level += distance;
                if (this.ability.abilitySelections[key].level <= 0)
                    this.ability.abilitySelections[key].id = '';
            }
        },
        abilitySelected(id) {
            let found = null;
            for (let key in this.ability.abilitySelections) {
                if (this.ability.abilitySelections[key].id == id) {
                    found = key;
                    break;
                }
            }
            return found != null;
        },
        getStuntDescription(stunt) {
            let presetStunt = this.stunt.presetStuntList.find((element) => { return element.id == stunt.presetId; });
            if (presetStunt != null) {
                return presetStunt.description;
            } else return null;
        },
        submitData() {
            let portraitData = {
                stature: this.portrait.stature,
                headLeft: 0,
                headTop: 0,
                headRight: 0,
                headBottom: 0
            };
            let characterData = {
                name: this.name,
                description: this.description,
                refreshFatePoint: this.refreshPoint,
                aspects: this.aspects,
                abilities: [],
                stunts: this.stunt.selected,
                extras: [],
                consequences: this.consequences,
                physics: this.physics,
                mental: this.mental
            };
            for (let i = 1; i <= this.ability.levels.length; ++i) {
                for (let j = 1; j <= i; ++j) {
                    let ability = this.ability.abilitySelections['ability-layer-' + i + '-no-' + j];
                    if (ability.id == '') continue;
                    characterData.abilities.push({ id: ability.id, level: ability.level });
                }
            }
            if (this.isCreation) {
                let sendData = {
                    portrait: portraitData,
                    data: characterData
                };
                let fmData = new FormData();
                let jsonBlob = new Blob([JSON.stringify(sendData)], { type: 'application/json' });
                fmData.append('data', jsonBlob);
                fmData.append('img', this.portrait.blob, 'portrait.png');
                Axios.post('/persona/character', fmData)
                .then(() => {
                    Swal.fire({
                        title: '成功',
                        text: '角色卡已创建',
                        type: 'success'
                    }).then(() => { this.$emit('ok'); });
                })
                .catch(err => {
                    Swal.fire({
                        title: '错误',
                        text: err.response ? err.response.data.message : err.message,
                        type: 'error'
                    });
                });
            } else {
                let portraitFormData = new FormData();
                let portraitSendData = {
                    uuid: this.uuid,
                    portrait: portraitData
                };
                let characterSendData = {
                    uuid: this.uuid,
                    data: characterData
                }
                let portraitJsonBlob = new Blob([JSON.stringify(portraitSendData)], { type: 'application/json' });
                portraitFormData.append('data', portraitJsonBlob);
                portraitFormData.append('img', this.portrait.blob, 'portrait.png');
                Axios.patch('/persona/character/portrait', portraitFormData)
                .then(() => {
                    Axios.patch('/persona/character', characterSendData)
                    .then(() => {
                        Swal.fire({
                            title: '成功',
                            text: '角色卡已修改',
                            type: 'success'
                        }).then(() => { this.$emit('ok'); });
                    })
                    .catch(err => {
                        Swal.fire({
                            title: '错误',
                            text: err.response ? err.response.data.message : err.message,
                            type: 'error'
                        });
                    })
                })
                .catch(err => {
                    Swal.fire({
                        title: '错误',
                        text: err.response ? err.response.data.message : err.message,
                        type: 'error'
                    });
                });
            }
        }
    },
    components: {
        'image-cropper': {
            props: {
                imgSrc: {
                    required: true
                },
                width: {
                    default: 600
                },
                height: {
                    default: 600
                }
            },
            data: function () {
                return {
                    cropper: null
                };
            },
            mounted: function () {
                this.cropper = new Cropper(this.$refs.cropping);
            },
            watch: {
                imgSrc: function (newSrc, oldSrc) {
                    this.cropper.replace(newSrc);
                },
            },
            template: `
                <div :style="{ width: width, height: height }">
                    <img style="max-width: 100%;" ref="cropping" />
                </div>
            `
        },
    }
}
</script>
