// components/admins/althetes/althetes.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
const aes = require("../../../utils/aes_util");
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    pageLifetimes:{
        show: function(e) {
            this.getalthetesData()
        }
    },
    lifetimes: {
        attached: function () {
            this.getalthetesData()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        althetes_list: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getalthetesData() {
            db.collection(databases.athletes_user).get().then(res => {
                let temp = [...res.data];
                temp.forEach(t => {
                    t.althetes_name = aes.AesDecrypt(aes.Base64Decode(t.althetes_name))
                })
                this.setData({
                    althetes_list: temp
                });
            }).catch(err => {
                wx.showToast({
                    title: '获取althetes数据失败！',
                    icon: 'error',
                    duration: 2000
                });
                console.log(err);
            });
        },
        toAddalthetesPage() {
            db.collection(databases.classes).get().then(res => {
                if(res.data.length != 0){

                    wx.navigateTo({
                        url: '/pages/admins/althetesEdit/althetesEdit',
                    })
                }else{
                    wx.showModal({
                      title: "提示",
                      content: "若要创建运动员，请先在班级管理中创建班级！",
                      showCancel: false
                    })
                }
            })
           
        },
        editalthetes(e) {
            wx.navigateTo({
                url: `/pages/admins/althetesEdit/althetesEdit?id=${e.currentTarget.dataset.id}`
            })

        },
        deletealthetes(e) {
            var that = this;
            let id = e.currentTarget.dataset.id;
            let fileUrl = "";
            this.data.althetes_list.forEach(d => {
                if (d._id === id) {
                    fileUrl = d.althetes_url
                }
            })
            wx.showModal({
                title: "警告",
                content: "确定要删除这个运动员？",
                success: function (res) {
                    if (res.confirm) {
                        db.collection(databases.athletes_user).doc(id).remove().then(res => {
                            wx.showToast({
                                title: '删除成功！',
                                icon: 'success',
                                duration: 2000
                            })
                            that.getalthetesData()
                            wx.cloud.deleteFile({
                                fileList: [fileUrl]
                            });
                        }).catch(err => {
                            wx.showToast({
                                title: '删除失败',
                                icon: 'error',
                                duration: 2000
                            })
                            console.log(err);
                        })
                    }
                }
            })
        }
    }
})
