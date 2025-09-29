import IndexPage from "./components/IndexPage.vue";
import NotesEdit from "./components/NotesEdit.vue";
import { createRouter,createWebHistory } from "vue-router";

const routes = [
    {
        path:"/index",
        redirect:'/'
    },
    {
        path: "/",
        name: "index",
        component: IndexPage,
    },
    {
        path: "/notes/edit",
        redirect:'/notes'

    },
    {
        path: "/notes",
        name: "notesEdit",
        component: NotesEdit
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

export default router;