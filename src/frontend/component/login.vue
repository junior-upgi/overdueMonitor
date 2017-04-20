<template lang="html">
    <div class="col-xs-10 col-sm-6 col-md-5 col-lg-4">
        <form id="loginForm" @submit.prevent>
            <div class="form-group">
                <input class="form-control" name="loginId" type="text" placeholder="使用者帳號" v-model="loginId" required />
            </div>
            <div class="form-group">
                <input class="form-control" name="password" type="password" placeholder="密碼" v-model="password" required />
            </div>
            <button class="btn btn-md" type="submit" v-on:click="login">登入</button>
            <button class="btn btn-md" type="reset">重設</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapMutations } from 'vuex';
import { serverUrl } from '../clientConfig.js';

export default {
    name: 'login',
    data: function() {
        return {
            loginId: '',
            password: ''
        };
    },
    methods: {
        ...mapActions({
            // initData: 'initData',
            // componentErrorHandler: 'componentErrorHandler'
        }),
        ...mapMutations({
            // buildStore: 'buildStore',
            redirectUser: 'redirectUser',
            restoreToken: 'restoreToken'
        }),
        login: function() {
            if (document.getElementById('loginForm').checkValidity()) {
                axios.post(`${serverUrl}/login`, {
                    loginId: this.loginId,
                    password: this.password
                }).then((response) => {
                    this.password = '';
                    sessionStorage.token = response.data.token;
                    this.restoreToken(sessionStorage.token);
                    return this.initData();
                }).then((responseList) => {
                    this.password = '';
                    // this.buildStore(responseList);
                    this.redirectUser();
                }).catch((error) => {
                    this.password = '';
                    this.componentErrorHandler({
                        component: 'login',
                        method: 'login',
                        situation: '登入失敗，請檢查帳號密碼是否正確並重新登入...',
                        systemErrorMessage: error
                    });
                });
            }
        }
    }
};
</script>

<style></style>
