<template>
    <el-collapse v-model="state.collapseIndex" @change="onDirChange" accordion>
        <el-collapse-item v-for="(dir,dIndex) in props.dirs" :name="dir.hash" style="padding: 0;">
            <template #title>
                <div style="display:flex;justify-content: space-between;width: 100%;align-items: center;padding: 0 10px">
                    <div>
                        <el-button size="small" type="danger" @click="delDir(dIndex)">删除</el-button>
                        <el-button size="small" type="success" @click="onClipboard" class="clipboard"
                                   :data-clipboard-text="clipboardText(dir)">分享
                        </el-button>
                    </div>
                    <el-tag>{{dir.name}}</el-tag>
                </div>
            </template>

            <el-card :body-style="{padding:'2px'}" v-if="props.dirs[dIndex].videos && props.dirs[dIndex].videos.length">
                <el-card v-for="(video,vIndex) in dir.videos" :key="vIndex"
                         :body-style="{padding:'2px'}">
                    <div style="display: flex;justify-content: space-between;padding: 2px">
                        <div>
                            <el-tag>{{video.title}}</el-tag>
                        </div>
                        <div>
                            <el-button size="small" type="success"
                                       @click="onPlayVideo(video.hash,video.title)">
                                播放
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-card>
            <div style="text-align: center" v-else>
                <el-tag>加载中...</el-tag>
            </div>
            <video-dir :dirs="props.dirs[dIndex].dirs" :hosts="props.hosts" @onPlayVideo="onPlayVideo"
                       v-if="props.dirs[dIndex].dirs && props.dirs[dIndex].dirs.length"></video-dir>
        </el-collapse-item>
    </el-collapse>
</template>

<script setup>
    import {defineProps, reactive, defineEmits} from 'vue'
    import Clipboard from "clipboard";

    const emit = defineEmits(['onPlayVideo'])

    const state = reactive({
        collapseIndex: 0,
        input: {
            newDirName: "",
            newDirHash: ""
        }
    })

    const props = defineProps({
        dirs: Array,
        hosts: String
    })

    const onPlayVideo = (hash, title) => {
        emit("onPlayVideo", hash, title)
    }

    // 添加目录
    const addDir = async () => {
        const name = state.input.newDirName
        const hash = state.input.newDirHash
        let isExist = false
        for (let i = 0; i < props.dirs.length; i++) {
            if (props.dirs[i].name === name) isExist = true
        }
        if (!isExist) {
            props.dirs.push({name, hash})
            localStorage.setItem("dirs", JSON.stringify(props.dirs))
            alert("目录添加成功")
            state.input.newDirName = ""
            state.input.newDirHash = ""
        } else {
            alert("目录已经存在")
        }
    }

    // 处理复制链接逻辑
    const onClipboard = () => {
        const clipboard = new Clipboard('.clipboard')
        clipboard.on('success', () => {
            alert("目录连接已经复制粘贴板")
            clipboard.destroy()
        })
    }

    // 删除目录
    const delDir = (dirIndex) => {
        props.dirs.splice(dirIndex, 1)
        localStorage.setItem("dirs", JSON.stringify(props.dirs))
        alert("目录删除完毕")
    }

    // 取当前应复制的文本
    const clipboardText = (dir) => {
        if (dir && dir.hash) {
            const urlArr = location.href.split("#")
            return urlArr[0] + "#" + "?shareUrl=" + dir.hash + "==" + dir.name + "&type=dir"
        }
    }

    // 切换打开的目录
    const onDirChange = async (hash) => {
        let dirIndex = 0
        for (let i = 0; i < props.dirs.length; i++) {
            if (props.dirs[i].hash === hash) dirIndex = i
        }

        if (props.dirs[dirIndex] && props.dirs[dirIndex].videos) {
            return false
        }

        const response = await fetch(`${props.hosts}/api/v0/ls?arg=${hash}&output-codec=dag-json`)
        if (response.status === 200) {
            const result = await response.json()
            const videos = []
            const dirs = []
            const links = result.Objects[0].Links
            for (let i = 0; i < links.length; i++) {
                const item = links[i]
                if (item.Size === 0) {
                    dirs.push({name: item.Name, hash: item.Hash})
                } else {
                    videos.push({title: item.Name, hash: item.Hash})
                }
            }
            props.dirs[dirIndex].videos = videos
            props.dirs[dirIndex].dirs = dirs
        } else {
            alert("资源请求失败 建议切换其他线路")
        }
    }
</script>

<style scoped></style>
