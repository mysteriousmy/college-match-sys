// components/admins/match/match.js
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
            this.getmatchData()
        }
    },
    lifetimes: {
        attached: function () {
            this.getmatchData()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        match_list: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getmatchData() {
            db.collection(databases.matchs).get().then(res => {
                let temp = [...res.data];
                temp.forEach(t => {
                    t.match_title = t.match_title
                })
                this.setData({
                    match_list: temp
                });
            }).catch(err => {
                wx.showToast({
                    title: '获取match数据失败！',
                    icon: 'error',
                    duration: 2000
                });
                console.log(err);
            });
        },
        toAddmatchPage() {
            db.collection(databases.classes).get().then(res => {
                if(res.data.length != 0){
                    wx.navigateTo({
                        url: '/pages/admins/matchEdit/matchEdit',
                    })
                }else{
                    wx.showModal({
                      title: "提示",
                      content: "若要创建比赛，请先在运动员管理创建运动员！",
                      showCancel: false
                    })
                }
            })
           
        },
        editmatch(e) {
            wx.navigateTo({
                url: `/pages/admins/matchEdit/matchEdit?id=${e.currentTarget.dataset.id}`
            })

        },
        deletematch(e) {
            var that = this;
            let id = e.currentTarget.dataset.id;
            let fileUrl = [];
            this.data.match_list.forEach(d => {
                if (d._id === id) {
                    fileUrl.push(d.match_url)
                    if(d.match_images.length !== 0){
                        d.match_images.forEach(i => {
                            fileUrl.push(i.img_url)
                        })
                    }
                    if(d.match_videos.length !== 0){
                        d.match_videos.forEach(i => {
                            fileUrl.push(i.video_url)
                        })
                    }
                }
            })
            wx.showModal({
                title: "警告",
                content: "确定要删除这个比赛？所有比赛人员信息和照片视频都将被清除！",
                success: function (res) {
                    if (res.confirm) {
                        db.collection(databases.matchs).doc(id).remove().then(res => {
                            wx.showToast({
                                title: '删除成功！',
                                icon: 'success',
                                duration: 2000
                            })
                            that.getmatchData()
                            wx.cloud.deleteFile({
                                fileList: fileUrl
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
