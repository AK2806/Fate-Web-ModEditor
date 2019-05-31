<template>
    <div>
        <header v-if="!onlyView" class="page-header">
            <div class="container-fluid">
                <h2 class="no-margin-bottom">角色卡</h2>
            </div>
        </header>
        <div v-if="!onlyView" class="breadcrumb-holder container-fluid">
            <div v-if="!canSelect" class="breadcrumb">
                <button class="btn btn-primary breadcrumb-item" @click="$emit('ok')">返回</button>
            </div>
            <div v-if="canSelect" class="breadcrumb breadcrumb-item">
                <button class="btn btn-secondary mx-2" @click="$emit('ok')">返回</button>
                <button  class="btn btn-primary mx-2" @click="$emit('select-character')">确定</button>
            </div>
        </div>
        <!-- Edit Character -->
        <section id="edit-character">
        <div class="container-fluid">
            <div class="row">
            <div class="col-lg-12 form-container">
                <div class="card">
                    <div class="card-header d-flex align-items-center">
                    <h3 class="h4 px-3">角色卡&nbsp;-&nbsp;{{ name }}</h3>
                    </div>
                    <div class="card-body row">
                        <div class="col-lg-3">
                            <img class="w-100 img-fluid has-shadow" :src="portrait" />
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
                                    <div class="row align-items-center">
                                        <span class="text-bold col-lg-2 ">名字</span>
                                        <span class="col-lg-8">{{ name }}</span>
                                    </div>
                                    <div class=" row align-items-center">
                                        <span class="text-bold col-lg-2">描述</span>
                                        <span class="col-lg-8">{{ description }}</span>
                                    </div>
                                    <div class=" row align-items-center">
                                        <span class="text-bold col-lg-2">重振命运点</span>
                                        <span class="col-lg-2">{{ refreshPoint }}</span>
                                    </div>
                                    <div class=" row align-items-center">
                                        <span class="text-bold col-lg-2">生理压力基础上限</span>
                                        <span class="col-lg-2">{{ physics }}</span>
                                        <span class="text-bold col-lg-2">精神压力基础上限</span>
                                        <span class="col-lg-2">{{ mental }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">特征</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(aspect, index) in aspects" :key="'aspect-' + index" class="row align-items-center">
                                        <span class="text-bold col-lg-2">固有特征&nbsp;{{ index + 1 }}&nbsp;</span>
                                        <span class="col-lg-9">{{ aspect.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">技能</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="layer in ability.levels.length" :key="'ability-layer-' + layer" class="row align-items-center">
                                        <span class="text-bold col-lg-2">{{ ability.levels[layer - 1] }}</span>
                                        <span v-for="(ab, index) in getAbilitiesInLevel(ability.levels.length - layer + 1)" :key="'ability-layer-' + layer + '-no-' + index" class="col-lg-2">
                                            {{ ability.abilityList.find((element) => { return element.id == ab.id; }).name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">特技</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(selectedStunt, index) in stunt.content" :key="'stunt-' + index">
                                        <div class="row">
                                            <div class="col-lg-6">
                                                <span class="text-bold py-2">{{ getStuntInfo(selectedStunt).name }}</span>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-lg-10">
                                                <span>{{ getStuntInfo(selectedStunt).description }}</span>
                                            </div>
                                        </div>
                                        <div class="line"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="line"></div>
                            <div class="row align-items-center">
                                <div class="col-lg-12">
                                    <span class="text-bold px-2 pb-4">伤痕槽</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-10 offset-lg-1">
                                    <div v-for="(consequence, index) in consequences" :key="'consequence-' + index" class=" row align-items-center">
                                        <span class="text-bold col-lg-2">槽&nbsp;{{ index + 1 }}&nbsp;容量</span>
                                        <span class="col-lg-2">
                                            {{ consequence.capacity }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

const abilityList = require('../assets/data/ability.json');
const presetStuntList = require('../assets/data/preset_stunt.json');

export default {
    props: {
        initData: {
            type: Object,
            required: true
        },
        canSelect: {
            type: Boolean,
            default: false
        },
        onlyView: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            portrait: urljoin(apiUrlPrefix, 'img/character', this.initData.portrait.id),
            name: this.initData.name,
            description: this.initData.description,
            refreshPoint: this.initData.refreshPoint,
            physics: this.initData.physics,
            mental: this.initData.mental,
            aspects: [...this.initData.aspects],
            ability: {
                levels: [
                    ' 杰出（+5）',
                    ' 出色（+4）',
                    ' 良好（+3）',
                    ' 尚可（+2）',
                    ' 一般（+1）',
                ],
                abilityList,
                selectedAbilities: [...this.initData.abilities]
            },
            consequences: [...this.initData.consequences],
            stunt: {
                presetStuntList,
                content: [...this.initData.stunts]
            }
        };
    },
    methods: {
        log: console.log,
        getAbilitiesInLevel(level) {
            let ret = [];
            for (let i in this.ability.selectedAbilities) {
                if (level == this.ability.selectedAbilities[i].level)
                    ret.push(this.ability.selectedAbilities[i]);
            }
            return ret;
        },
        getStuntInfo(stunt) {
            let presetStunt = this.stunt.presetStuntList.find((element) => { return element.id == stunt.presetId; });
            if (presetStunt != null) {
                return presetStunt;
            } else return null;
        }
    }
}
</script>
