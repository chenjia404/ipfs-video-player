import {createRouter, createWebHashHistory} from 'vue-router'

const simpleRoute = (name, views) => {
    const children = []
    for (let index = 0; index < views.length; index++) {
        const view = views[index]
        children[index] = {
            path: view,
            name: `${name}-${view}`,
            component: () => import(`../views/${name}/${view}.vue`)
        }
    }
    return {
        path: "/" + name, component: () => import(`../views/${name}/base.vue`),
        children
    }
}

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path: "/", name: "index", component: () => import("../views/index.vue")},
        {path: '/:pathMatch(.*)*', redirect: "/"},
    ],
})



export {router}
