// components/athletes/info/info.js
const aes = require("../../../utils/aes_util")
const db = wx.cloud.database();
const databases = require('../../../const/database');
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    lifetimes: {
        attached: function () {
            this.updateCache()
        }
    },
    pageLifetimes:{
        show: function() {
            this.updateCache()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        althetes_info: "",
        all_source: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        updateInfo(){
            let id = this.data.althetes_info._id;
            wx.navigateTo({
                url: `/pages/admins/althetesEdit/althetesEdit?id=${id}`
            })
        },
        exitLogin(){
            wx.showModal({
               title: '提示',
               content: "确定要退出登录吗？",
               success: function(res) {
                    if(res.confirm){
                        wx.setStorageSync('althetes_info', null);
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                    }
               }
            })
        },
        updateCache(){
            let info = wx.getStorageSync('althetes_info');
            if(info.length !== 0){
                let tmp = [...info]
                db.collection(databases.athletes_user).where({
                    _id: tmp[0]._id
                }).get().then(res => {
                    tmp = [...res.data]
                    wx.setStorageSync('althetes_info', tmp)
                    tmp[0].althetes_name = aes.AesDecrypt(aes.Base64Decode(tmp[0].althetes_name))
                    this.getAllSource(tmp[0]._id)
                    const classes = tmp[0].althetes_ofClass
                    db.collection(databases.classes).where({
                        class_name: classes
                    }).get().then(res => {
                        tmp[0].althetes_ofCollege = res.data[0].class_ofCollege;
                        this.setData({
                            althetes_info: tmp[0]
                        })
                    })
                })
            }
        },
        getalthetesData(){
            let info = wx.getStorageSync('althetes_info');
            if(info.length !== 0){
                let tmp = [...info]
                db.collection(databases.athletes_user).where({
                    _id: tmp[0]._id
                }).get().then(res => {
                    tmp = [...res.data]
                    wx.setStorageSync('althetes_info', tmp)
                    tmp[0].althetes_name = aes.AesDecrypt(aes.Base64Decode(tmp[0].althetes_name))
                    this.getAllSource(tmp[0]._id)
                    const classes = tmp[0].althetes_ofClass
                    db.collection(databases.classes).where({
                        class_name: classes
                    }).get().then(res => {
                        tmp[0].althetes_ofCollege = res.data[0].class_ofCollege;
                        this.setData({
                            althetes_info: tmp[0]
                        })
                    })
                })
            }
        },
        getAllSource(id){
            db.collection(databases.matchs).get().then(res => {
                let tmp = [...res.data]
                let source = 0;
                tmp.forEach(t => {
                    let ath_tmp = [...t.match_join_althetes]
                    const result = ath_tmp.filter(m => m.althetes_id === id);
                    if(result.length !== 0){
                        source += result[0].source
                    }
                    
                })
                this.setData({
                    all_source: source
                })
            })
        }
    }
})
