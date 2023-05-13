<template>
    <div class="main">
        <div class="player-box">
            <el-card :body-style="{padding:'2px'}">
                <div style="display: flex;justify-content: space-between;margin: 5px">
                    <el-tag>播放窗口</el-tag>
                    <el-tag>{{state.playingVideo.title}}</el-tag>
                    <el-button v-if="state.playingVideo" class="clipboard" size="small"
                               :data-clipboard-text="clipboardText()" @click="onClipboard">分享
                    </el-button>
                </div>
                <video style="width: 100%" crossorigin="anonymous" controls :autoplay="state.autoplay" preload="auto"
                       muted="muted">
                    <source :src="nowPlayUrl()" type="video/mp4">
                </video>
            </el-card>
        </div>

        <div class="dir-box">
            <el-card :body-style="{padding:'2px'}">
                <div style="margin: 5px">
                    <el-tag>视频目录</el-tag>
                </div>
                <video-dir :dirs="state.dirList" :hosts="state.activeHosts" @onPlayVideo="onPlayVideo"></video-dir>
                <div style="display: flex;margin: 5px 0;padding: 2px">
                    <el-input v-model="state.input.newDirName" placeholder="目录名称"></el-input>
                    <el-input v-model="state.input.newDirHash" placeholder="目录Hash" style="margin: 0 2px"></el-input>
                    <el-button @click="addDir" style="margin: 0 2px">添加目录</el-button>
                </div>
            </el-card>
        </div>

        <div class="favorite-box">
            <el-card :body-style="{padding:'2px'}">
                <div style="margin: 5px">
                    <el-tag>收藏视频</el-tag>
                </div>
                <el-card :body-style="{padding:'2px'}" v-for="(favorite,index) in state.favoriteList" :key="index">
                    <div style="display: flex;justify-content: space-between;padding: 2px">
                        <div>
                            <el-tag>{{favorite.title}}</el-tag>
                        </div>
                        <div>
                            <el-button size="small" type="danger" @click="delFavorite(index)">删除</el-button>
                            <el-button size="small" type="success" @click="onPlayVideo(favorite.hash,favorite.title)">
                                播放
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-card>
        </div>

        <div class="history-box">
            <el-card :body-style="{padding: '5px'}">
                <el-tag style="margin: 5px 0">播放历史</el-tag>
                <el-card v-for="(history,index) in state.histories" :key="index" :body-style="{padding: '2px'}">
                    <div style="display: flex;justify-content: space-between">
                        <div>
                            <el-tag style="margin: 0 2px">{{history.title}}</el-tag>
                            <el-tag>{{showTime(history.currentTime)}}</el-tag>
                        </div>
                        <div>
                            <el-button size="small" type="danger" @click="delHistory(index)">删除</el-button>
                            <el-button size="small" type="success"
                                       @click="onPlayVideo(history.hash,history.title,history.currentTime)">播放
                            </el-button>
                        </div>
                    </div>

                </el-card>
            </el-card>
        </div>

        <div class="hosts-box">
            <el-card :body-style="{padding:'2px'}">
                <div style="margin: 5px">
                    <el-tag>线路列表</el-tag>
                </div>
                <el-card v-for="(hosts,index) in state.hosts" :key="index" :body-style="{padding:'2px'}">
                    <div style="display: flex;justify-content: space-between">

                        <div>
                            <el-tag style="margin: 0 2px">{{hosts.url}}</el-tag>
                            <el-tag>延迟 {{hosts.distance}}</el-tag>
                        </div>
                        <div>
                            <el-button size="small" v-if="hostsIsActive(hosts)" type="primary">激活中</el-button>
                            <div v-else>
                                <el-button size="small" @click="onSetActiveHosts(hosts)" type="success">激活</el-button>
                                <el-button size="small" @click="delHosts(index)" type="danger">删除</el-button>
                            </div>
                        </div>
                    </div>

                </el-card>
                <div style="display: flex;margin: 5px 0;padding: 2px">
                    <el-input v-model="state.input.newHosts" placeholder="线路链接 http(s)://"></el-input>
                    <el-button @click="addHosts" style="margin: 0 2px">添加线路</el-button>
                </div>
            </el-card>
        </div>

        <div class="video-box">
            <el-card :body-style="{padding:'2px'}">
                <div style="margin: 5px">
                    <el-tag>视频列表</el-tag>
                </div>
                <el-card v-for="(video,index) in state.videos" :key="index" :body-style="{padding:'2px'}">
                    <div style="display: flex;justify-content: space-between">
                        <div>
                            <el-tag>{{video.title}}</el-tag>
                        </div>
                        <div>
                            <el-button type="danger" size="small" @click="delVideo(index)">删除</el-button>
                            <el-button type="success" size="small" v-if="isFavorite(video.hash)">已收藏</el-button>
                            <el-button size="small" v-else @click="addFavorite(video.hash,video.title)">收藏</el-button>
                            <el-button type="primary" size="small" @click="onPlayVideo(video.hash,video.title)">播放
                            </el-button>
                        </div>
                    </div>
                </el-card>

                <div style="display: flex;margin: 5px 0;padding: 2px">
                    <el-input v-model="state.input.newVideoTitle" placeholder="视频标题"></el-input>
                    <el-input style="margin: 0 2px" v-model="state.input.newVideoHash" placeholder="视频hash"></el-input>
                    <el-button @click="addVideo()" style="margin: 0 2px">添加视频</el-button>
                </div>
            </el-card>
        </div>

        <el-backtop></el-backtop>
    </div>
</template>

<script setup>
    import VideoDir from "./components/video-dir.vue"
    import Clipboard from 'clipboard'
    import {onMounted, reactive} from 'vue'
    import {useRoute} from "vue-router"

    const route = useRoute()


    const state = reactive({
        autoplay: true,
        playingVideo: {hash: "", title: ""},
        videos: {},
        clipboardUrl: "",
        cid: route.query.cid,
        hosts: {},
        activeHosts: localStorage.getItem("active_hosts") || null,
        videoPlayer: {},
        currentTime: 0, // 当前播放进度
        input: {
            newHosts: "",
            newDirName: "",
            newDirHash: "",
            newDirVideoTitle: "",
            newDirVideoHash: "",
            newVideoHash: "",
            newVideoTitle: ""
        },
        favoriteList: [],
        dirList: [],
        histories: [],
        collapseIndex: ""
    })


    onMounted(async () => {
        state.videoPlayer = document.querySelector("video")
        initHosts().then() // 初始化链接节点
        initVideos() // 初始化播放列表
        initDirList()
        initFavoriteList()
        initVideoPlay().then() // 处理分享链接
        setPlayingTime() // 设置视频播放的进度
        initHistories() // 初始化播放历史
        setVideoDuration() // 设置视频当前播放时间
        onHashChange() // 监听hash变更
    })

    // 初始化视频播放(处理分享链接)
    const initVideoPlay = async () => {
        const type = route.query.type
        if (state.shareUrl && type === "video") {
            const hash = state.shareUrl
            const title = route.query.filename
            console.log(hash)
            if (hash.length === 46) {
                onPlayVideo(hash, title)
            }
        } else {
            if (type === "dir") {
                const hash = state.shareUrl
                const title = route.query.filename
                if (hash.length === 46) {
                    saveShareDir(title, hash)
                }
            }
            let lastPlayVideo = localStorage.getItem("lastPlayVideo")
            if (lastPlayVideo) {
                lastPlayVideo = JSON.parse(lastPlayVideo)
                onPlayVideo(lastPlayVideo.hash, lastPlayVideo.title, lastPlayVideo.currentTime)
            } else if (state.histories.length) {
                onPlayVideo(state.histories[0].hash, state.histories[0].title)
            } else if (state.videos.length) {
                onPlayVideo(state.videos[0].hash, state.videos[0].title)
            }
        }
    }

    const saveShareDir = (name, hash) => {
        let isExist = false
        for (let i = 0; i < state.dirList.length; i++) {
            if (state.dirList[i].hash === hash) isExist = true
        }
        if (!isExist) {
            state.dirList.unshift({hash, name})
            localStorage.setItem("dirs", JSON.stringify(state.dirList))
            alert("成功接收分享的目录")
        }
    }

    // 设置视频播放的进度 每五秒
    const setPlayingTime = () => {
        setInterval(() => {
            if (state.playingVideo.hash && state.videoPlayer.currentTime) {
                localStorage.setItem("lastPlayVideo", JSON.stringify({
                    title: state.playingVideo.title,
                    hash: state.playingVideo.hash,
                    currentTime: state.videoPlayer.currentTime
                }))
            }
        }, 5000)
    }

    // 处理页面hash变更
    const onHashChange = () => {
        window.addEventListener('hashchange', () => {
            let arr = location.hash.split("#")
            if (arr[1]) {
                arr = arr[1].split("&")
                if (arr[0].length === 46) {
                    const hash = arr[0]
                    const title = arr[1] || "未命名视频"
                    unshiftNewVideo(hash, title) // 视频追加播放列表
                    onPlayVideo(hash, title) // 播放追加的视频
                }
            }
        })
    }

    // 置顶一条新的视频记录
    const unshiftNewVideo = (hash, title) => {
        let isExist = false
        for (let i = 0; i < state.videos.length; i++) {
            if (state.videos[i].hash === hash) isExist = true
        }
        if (!isExist) {
            state.videos.unshift({hash, title})
        }
    }

    // 设置视频的时长
    const setVideoDuration = () => {
        state.videoPlayer.addEventListener("loadedmetadata", () => {
            const hash = state.playingVideo.hash
            for (let i = 0; i < state.videos.length; i++) {
                if (state.videos[i].hash === hash) {
                    state.videos[i].duration = state.videoPlayer.duration
                    localStorage.setItem("videos", JSON.stringify(state.videos))
                }
            }
        })
    }

    // 设置新的当前激活的节点
    const onSetActiveHosts = (hosts) => {
        state.activeHosts = hosts.url
        localStorage.setItem("active_hosts", hosts.url)
    }

    // 节点是否是当前激活的节点
    const hostsIsActive = (hosts) => {
        return state.activeHosts === hosts.url
    }

    // 处理视频播放
    const onPlayVideo = (hash, title, currentTime = 0) => {
        if (state.playingVideo.hash && state.videoPlayer.currentTime) {
            if (state.playingVideo.hash !== hash) {
                addHistory(state.playingVideo.hash, state.playingVideo.title, state.videoPlayer.currentTime) // 保存播放历史
            }
        }
        state.playingVideo = {hash, title}
        state.videoPlayer.src = nowPlayUrl()
        state.videoPlayer.currentTime = currentTime
        state.videoPlayer.play()
    }

    // 当前播放视频的url
    const nowPlayUrl = () => {
        return `${state.activeHosts}/ipfs/${state.playingVideo.hash}`
    }


    // 初始化播放历史
    const initHistories = () => {
        const histories = localStorage.getItem("histories")
        state.histories = histories ? JSON.parse(histories) : []
    }

    // 目录添加视频
    const addDirVideo = (dIndex) => {
        const videos = state.dirList[dIndex].videos || []
        videos.push({
            hash: state.input.newDirVideoHash,
            title: state.input.newDirVideoTitle,
        })
        state.dirList[dIndex].videos = videos
        localStorage.setItem("dirs", JSON.stringify(state.dirList))
        state.input.newDirVideoTitle = ""
        state.input.newDirVideoHash = ""
        alert("视频添加完毕")
    }

    // 目录删除视频
    const dirDelVideo = (dIndex, vIndex) => {
        state.dirList[dIndex].videos.splice(vIndex, 1)
    }

    // 添加目录
    const addDir = async () => {
        const name = state.input.newDirName
        const hash = state.input.newDirHash
        let isExist = false
        for (let i = 0; i < state.dirList.length; i++) {
            if (state.dirList[i].name === name) isExist = true
        }
        if (!isExist) {
            state.dirList.push({name, hash})
            localStorage.setItem("dirs", JSON.stringify(state.dirList))
            alert("目录添加成功")
            state.input.newDirName = ""
            state.input.newDirHash = ""

        } else {
            alert("目录已经存在")
        }
    }

    // 删除视频
    const delVideo = (index) => {
        state.videos.splice(index, 1)
        localStorage.setItem("videos", JSON.stringify(state.videos))
        alert("视频删除完毕")
    }

    // 添加视频
    const addVideo = () => {
        const hash = state.input.newVideoHash
        const title = state.input.newVideoTitle
        let isExist = false
        for (let i = 0; i < state.videos.length; i++) {
            if (state.videos[i].hash === hash) isExist = true
        }
        if (!isExist) {
            state.videos.push({hash, title})
            localStorage.setItem("videos", JSON.stringify(state.videos))
            alert("视频添加成功")
            state.input.newVideoHash = ""
            state.input.newVideoTitle = ""
        } else {
            alert("视频已经存在")
        }
    }

    // 删除目录
    const delDir = (dirIndex) => {
        state.dirList.splice(dirIndex, 1)
        localStorage.setItem("dirs", JSON.stringify(state.dirList))
        alert("目录删除完毕")
    }

    // 取全部目录
    const initDirList = () => {
        const dirs = localStorage.getItem("dirs")
        state.dirList = dirs ? JSON.parse(dirs) : []
    }

    // 取全部收藏
    const initFavoriteList = () => {
        const favorites = localStorage.getItem("favorites")
        state.favoriteList = favorites ? JSON.parse(favorites) : []
    }

    const isFavorite = (hash) => {
        for (let i = 0; i < state.favoriteList?.length; i++) {
            if (state.favoriteList[i].hash === hash) return true
        }
        return false
    }

    // 添加收藏
    const addFavorite = (hash, title) => {
        let isExist = false
        for (let i = 0; i < state.favoriteList.length; i++) {
            if (state.favoriteList[i].hash === state.input.hash) isExist = true
        }
        if (!isExist) {
            state.favoriteList.push({hash, title})
            localStorage.setItem("favorites", JSON.stringify(state.favoriteList))
            alert("收藏成功")
        } else {
            alert("已经收藏过了")
        }
    }

    // 格式化播放进度
    const showTime = (num) => {
        let showStr = ""
        const uints = [{"num": 3600, "uint": "小时"}, {"num": 60, "uint": "分钟"}, {"num": 1, "uint": "秒"}]
        for (let i = 0; i < uints.length; i++) {
            const uint = uints[i]
            if (num > uint["num"]) {
                let uintNum = Math.floor(num / uint["num"])
                if (uintNum > 0) {
                    if (uintNum < 10) uintNum = "0" + uintNum
                    showStr += uintNum + uint["uint"]
                    num -= uintNum * uint["num"]
                }
            }
        }
        return showStr
    }

    // 删除收藏
    const delFavorite = (favoriteIndex) => {
        state.favoriteList.splice(favoriteIndex, 1)
        localStorage.setItem("favorites", JSON.stringify(state.favoriteList))
        alert("收藏删除完毕")
    }

    // 添加播放历史
    const addHistory = async (hash, title, currentTime) => {
        for (let i = 0; i < state.histories.length; i++) {
            if (state.histories[i].hash === hash) {
                state.histories.splice(i, 1)
            }
        }
        state.histories.unshift({hash, title, currentTime})
        localStorage.setItem("histories", JSON.stringify(state.histories))
    }

    // 删除播放历史
    const delHistory = (index) => {
        state.histories.splice(index, 1)
        localStorage.setItem("histories", JSON.stringify(state.histories))
    }

    // 添加链接节点
    const addHosts = async () => {
        let isExist = false
        for (let i = 0; i < state.hosts.length; i++) {
            if (state.hosts[i].url === state.input.newHosts) isExist = true
        }
        if (!isExist) {
            state.hosts.push({url: state.input.newHosts})
            localStorage.setItem("hosts", JSON.stringify(state.hosts))
            alert("节点添加成功")
        } else {
            alert("节点已经存在")
        }
    }

    // 删除链接节点
    const delHosts = async (index) => {
        state.hosts.splice(index, 1)
        localStorage.setItem("hosts", JSON.stringify(state.hosts))
        alert("节点已经删除")
    }

    // 配置初始节点数据
    const initHosts = async () => {
        let hosts = localStorage.getItem("hosts")
        if (!hosts) {
            const initHosts = [
                {url: "https://ipfs.io"},
                {url: "http://127.0.0.1:8080"},
                {url: "https://dweb.link"},
                {url: "https://infura-ipfs.io"},
            ]
            localStorage.setItem("hosts", JSON.stringify(initHosts))
            state.hosts = initHosts
        } else {
            state.hosts = JSON.parse(hosts)
        }

        if (!state.activeHosts) {
            onSetActiveHosts(state.hosts[0])
        }

        const hash = "bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m#x-ipfs-companion-no-redirect"

        for (let i = 0; i < state.hosts.length; i++) {
            const startAt = new Date().getTime()
            fetch(`${state.hosts[i].url}/ipfs/${hash}`).then(response => {
                state.hosts[i].status = response.status
                const endAt = new Date().getTime()
                state.hosts[i].distance = endAt - startAt
            }).catch(error => console.log('Error:', error))
        }
    }

    // 取视频播放列表，第一次请求初始化播放列表
    const initVideos = () => {
        let videos = localStorage.getItem("videos")
        if (!videos) {
            const initVideos = [
                {"title": "寄生虫", "hash": "Qmbek7RyQyWkgtTCHcLYA8em4738L2nLeZzxJx6Xn5aH1p"},
                {"title": "银翼杀手2049", "hash": "QmcUHdzKgRrcJrD5Ah46HgBHF7urWDhmAnLKYwcHaLgeGP"},
                {"title": "洛杉矶之战", "hash": "Qmb2dvm5SDSi6N6c7V9wuFZk3g6x2EwbMPWtbxovnPau76"},
                {"title": "阿丽塔：战斗天使", "hash": "QmZmZ2D7utSZT5HzYdcfUnYKdpLz5pTA5mnFxW7WaKYQ2m"},
                {"title": "春潮", "hash": "QmcfFAcN1TNnSCM9TMjfsyL4GJxRN2qWzyRCAo5bno5ZN8"},
                {"title": "极速车王", "hash": "QmYeQVGNtUKmvnxhLTPT8awWTQbysBgBBj8nYD73i97daZ"},
                {"title": "82年生的金智英", "hash": "QmZuH8Ja9E6rpXhucoP2rGPJpisvQmu6zMt2dtRh4p2BLj"},
                {"title": "V字仇杀队", "hash": "QmYfrUbpNE4ECisvTTVaugdbcmMfkto8S4CiUwG52ksiCv"},
                {"title": "大话西游之月光宝盒", "hash": "QmdwKsd27Re6xo799cVcaBpnV2xdozJmgE9xWW43rcHaiD"},
                {"title": "大话西游之大圣娶亲", "hash": "QmXtk8d2uGKn85w78E53xG2AfU6vjV24Cr1Bpu8m1tTkap"},
                {"title": "犬之岛", "hash": "QmRzNNWdiL2dTog4AKwBuLakzZPLHZL9WLQ6N35m8rN2dX"},
                {"title": "黑鹰坠落", "hash": "QmZcQbijvNn566N2617hXASwXxKR79Rp5jMhgQssjxbq8J"},
                {"title": "哈利·波特与火焰杯", "hash": "QmckH5UfXpcwHuRmBGb3PvcqVTisiLaSSCVsrELJg6pQbt"},
                {"title": "星际穿越", "hash": "QmcRAHSAD66XjBHAjLDhRbVdY72tjoBTtZ7Q1wR16GqWeM"},
                {"title": "头号玩家", "hash": "Qmc26SG7UeBeJYWWXaVsptiKhMauiqa1Ngy2GCxCtgM2w1"},
                {"title": "蜘蛛侠：平行宇宙", "hash": "Qmd7wZmbmDxC2bUeS5rfyrPySLY4f4H4BnksGSG4cs8jnf"},
                {"title": "阿基拉", "hash": "QmPaK46bpqqavGZXjipz3j79vSogF68VFKZsXBmUmHLnYJ"},
            ]
            localStorage.setItem("videos", JSON.stringify(initVideos))
            state.videos = initVideos
        } else {
            state.videos = JSON.parse(videos)
        }
    }

    // 取当前应复制的文本
    const clipboardText = () => {
        if (state.playingVideo.hash) {
            const urlArr = location.href.split("#")
            return urlArr[0] + "#" + "?cid=" + state.playingVideo.hash + "&filename=" + state.playingVideo.title + "&type=video"
        }
    }

    // 处理复制链接逻辑
    const onClipboard = () => {
        const clipboard = new Clipboard('.clipboard')
        clipboard.on('success', () => {
            alert("视频链接已经复制粘贴板")
            clipboard.destroy()
        })
    }


</script>

<style scoped>
    .el-card {
        margin: 5px 0;
    }
</style>
