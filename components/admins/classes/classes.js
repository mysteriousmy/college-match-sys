// components/admins/classes/classes.js
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
            this.getClassData()
        }
    },
    lifetimes: {
        attached: function () {
            this.getClassData()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        classes_list: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getClassData() {
            db.collection(databases.classes).get().then(res => {
                this.setData({
                    classes_list: res.data
                });
            }).catch(err => {
                wx.showToast({
                    title: '获取classes数据失败！',
                    icon: 'error',
                    duration: 2000
                });
                console.log(err);
            });
        },
        toAddClass() {
            db.collection(databases.college).get().then(res => {
                if(res.data.length != 0){
                    wx.navigateTo({
                        url: '/pages/admins/classesEdit/classesEdit',
                    })
                }else{
                    wx.showModal({
                      title: "提示",
                      content: "若要创建班级，请先在学院管理当中创建学院！",
                      showCancel: false
                    })
                }
            })
           
        },
        editClass(e) {
            wx.navigateTo({
                url: `/pages/admins/classesEdit/classesEdit?id=${e.currentTarget.dataset.id}`
            })

        },
        deleteClass(e) {
            var that = this;
            let id = e.currentTarget.dataset.id;
            let fileUrl = "";
            this.data.classes_list.forEach(d => {
                if (d._id === id) {
                    fileUrl = d.class_url
                }
            })
            wx.showModal({
                title: "警告",
                content: "确定要删除这个班级？",
                success: function (res) {
                    if (res.confirm) {
                        db.collection(databases.classes).doc(id).remove().then(res => {
                            wx.showToast({
                                title: '删除成功！',
                                icon: 'success',
                                duration: 2000
                            })
                            that.getClassData()
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
