// components/admins/banner/banner.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
Component({
    /**
     * 组件的属性列表
     */
    pageLifetimes:{
        show: function(e) {
            this.getBannerData()
        }
    },
    lifetimes: {
        attached: function () {
            this.getBannerData()
        }
    },
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        banner_list: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getBannerData() {
            db.collection(databases.banner).get().then(res => {
                this.setData({
                    banner_list: res.data
                });
            }).catch(err => {
                wx.showToast({
                    title: '获取banner数据失败！',
                    icon: 'error',
                    duration: 2000
                });
                console.log(err);
            });
        },
        toAddBannerPage() {
            wx.navigateTo({
                url: '/pages/admins/bannerAdd/bannerAdd',
            })
        },
        editBanner(e) {
            wx.navigateTo({
                url: `/pages/admins/bannerAdd/bannerAdd?id=${e.currentTarget.dataset.id}`
            })

        },
        deleteBanner(e) {
            var that = this;
            let id = e.currentTarget.dataset.id;
            let fileUrl = "";
            this.data.banner_list.forEach(d => {
                if (d._id === id) {
                    fileUrl = d.banner_url
                }
            })
            wx.showModal({
                title: "警告",
                content: "确定要删除这个Banner？",
                success: function (res) {
                    if (res.confirm) {
                        db.collection(databases.banner).doc(id).remove().then(res => {
                            wx.showToast({
                                title: '删除成功！',
                                icon: 'success',
                                duration: 2000
                            })
                            that.getBannerData()
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