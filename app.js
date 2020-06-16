//app.js
const util = require('utils/util.js')
const md5 = require('utils/md5.js')
App({
    onLaunch: function () {


        var _this = this;

        //获取地区信息

        if (wx.getStorageSync('area')) {
            _this.globalData.area = wx.getStorageSync('area');
        }

    },
    globalData: {
        userInfo: null,
        mobile: "",
        imgurl: "https://img.intech.gdinsight.com/byd/a20200403han/",
        rerequesturl: "https://ky.intech.gdinsight.com/bydeg/api",
        imgurlbyd: "http://bydadm.intech.gdinsight.com/upload/",


        // 地图
        localkey: 'ZUVBZ-BRT34-GNNUU-X4ZGZ-63DWV-TWF35',//地点
        area: '',//地区信息
        d: "",//中转值
        key: "&key=k82zzYcRBexPsH7jumIji6iTXYzEk2yN",
        sig: "EH1cz7jT4YWhtcsy2tnlp0rf8Kr19",
        sessionKey: "",
        // 地图

    },

    //获取配置信息
    getConf: function (alias) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            wx.request({
                url: _this.globalData.rerequesturl + '/api.php',
                data: {
                    a: 'getConf',
                    alias: alias
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                    _this.globalData.d = res.data.data.config;
                    resolve();
                }
            });
        });
    },
    //获取经销商信息
    getDealer: function (area1, area2) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            wx.request({
                url: _this.globalData.rerequesturl + '/api.php',
                data: {
                    a: 'getDealer',
                    provinceId: area1,
                    cityId: area2,
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success(res) {
                    _this.globalData.dealerList = res.data.data.dealer;
                    resolve();
                }
            });
        });
    },




})