<template>
    <div class="main" ref="main">
        <router-view v-slot="{ Component }">
            <component :is="Component"/>
            <!--<keep-alive>-->
            <!--<component :is="Component"/>-->
            <!--</keep-alive>-->
        </router-view>
    </div>
</template>

<script setup>
    import {onMounted, reactive} from 'vue'
    import helper from "../util/helper"


    const state = reactive({
    })


    onMounted(() => {

    })


</script>

<style>

    body {
        background: #ededee;
        max-width: 880px;
        margin: auto;
    }

    .main{
        font-family: system-ui, sans-serif;
    }



</style>
