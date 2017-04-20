<template lang="html">
    <div class="container-fluid">
        <div class="row" style="margin-left:10px;">
            <div class="page-header" style="margin-top:15px;">
                <h2 style="margin-top:0px;">
                    <span style="white-space:nowrap;">統義玻璃股份有限公司</span>
                    <small style="white-space:nowrap;">boilerplate project</small>
                </h2>
            </div>
        </div>
        <div class="row">
            <sidebar v-if="activeView!=='login'"></sidebar>
            <div :is="activeView"></div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { store } from '../store/store.js';

import login from './login.vue';
import sidebar from './sidebar.vue';
import admin from './admin/admin.vue';

export default {
    name: 'app',
    store: store,
    components: { login, sidebar, admin },
    computed: {
        ...mapGetters({ activeView: 'activeView' })
    },
    methods: {
        ...mapActions({ componentErrorHandler: 'componentErrorHandler' }),
        ...mapMutations({
            redirectUser: 'redirectUser',
            restoreToken: 'restoreToken'
        })
    },
    created: function() {
        // if jwt token exists in the sessionStorage
        if (
            (sessionStorage.token !== undefined) &&
            (sessionStorage.token !== null) &&
            (sessionStorage.token !== '')
        ) {
            this.restoreToken(sessionStorage.token); // restore token from session storage
            this.initData()
                .then((responseList) => {
                    this.buildStore(responseList);
                    this.redirectUser();
                })
                .catch((error) => {
                    this.componentErrorHandler({
                        component: 'app',
                        method: 'created',
                        situation: '初始化程序失敗',
                        systemMessage: error
                    });
                });
        }
    }
};
</script>

<style>
@import "./bower_components/bootstrap/dist/css/bootstrap.min.css";
@import "./bower_components/bootstrap/dist/css/bootstrap-theme.min.css";
body {
    overflow-x: hidden;
}
</style>
