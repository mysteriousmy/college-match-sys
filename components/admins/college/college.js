const db = wx.cloud.database();
const databases = require('../../../const/database');
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    pageLifetimes:{
        show: function(e) {
            this.getCollegeData()
        }
    },
    lifetimes: {
        attached: function () {
            this.getCollegeData()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        college_list: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getCollegeData() {
            db.collection(databases.college).get().then(res => {
                this.setData({
                    college_list: res.data
                });
            }).catch(err => {
                wx.showToast({
                    title: '获取college数据失败！',
                    icon: 'error',
                    duration: 2000
                });
                console.log(err);
            });
        },
        toAddCollege() {
            wx.navigateTo({
                url: '/pages/admins/collegeEdit/collegeEdit',
            })
        },
        editCollege(e) {
            wx.navigateTo({
                url: `/pages/admins/collegeEdit/collegeEdit?id=${e.currentTarget.dataset.id}`
            })

        },
        deleteCollege(e) {
            var that = this;
            let id = e.currentTarget.dataset.id;
            let fileUrl = "";
            this.data.college_list.forEach(d => {
                if (d._id === id) {
                    fileUrl = d.college_url
                }
            })
            wx.showModal({
                title: "警告",
                content: "确定要删除这个学院？",
                success: function (res) {
                    if (res.confirm) {
                        db.collection(databases.college).doc(id).remove().then(res => {
                            wx.showToast({
                                title: '删除成功！',
                                icon: 'success',
                                duration: 2000
                            })
                            that.getCollegeData()
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
