// pages/admins/home/adminHome.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        banner: true,
        match: false,
        college: false,
        classes: false,
        althetes: false,
        selected: 0,
        color: "#7A7E83",
        selectedColor: "#3cc51f",
        admin_name: "",
        "list": [
            {
                "text": "Banner管理",
                "iconPath": "/resource/banner.png",
                "selectedIconPath": "/resource/banner-select.png"
            },
            {
                "text": "学院管理",
                "iconPath": "/resource/college_single.png",
                "selectedIconPath": "/resource/college_single_select.png"
            },
            {
                "text": "班级管理",
                "iconPath": "/resource/class_admin.png",
                "selectedIconPath": "/resource/class_admin_select.png"
            },
            {
                "text": "运动员管理",
                "iconPath": "/resource/althetes_admin.png",
                "selectedIconPath": "/resource/althetes_admin_select.png"
            },
            {
                "text": "比赛管理",
                "iconPath": "/resource/match.png",
                "selectedIconPath": "/resource/match_select.png"
            },
        ],
    },
    switchTab(e) {
        const data = e.currentTarget.dataset
        this.setData({
                //切换tab时，改变当前激活的序号，改变tab颜色图标等样式  
            selected: data.index,
            banner: data.index === 0 ? true : false,
            college: data.index === 1 ? true : false,
            classes: data.index === 2 ? true : false,
            althetes: data.index === 3 ? true : false,
            match: data.index === 4 ? true : false
        })
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let admin_Name = wx.getStorageSync('admin_info');
        if (admin_Name.length === 0) {
            wx.showToast({
              title: '警告: 不允许未登录使用后台管理系统',
              icon: 'error',
              duration: 2000
            })
            wx.redirectTo({
              url: '/pages/index/index',
            })
        }else{
            this.setData({
                admin_name: admin_Name
            });
        }
    },
})