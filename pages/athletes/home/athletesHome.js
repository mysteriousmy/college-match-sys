// pages/athletes/home/athletesHome.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        match: false,
        info: true,
        source: false,
        selected: 0,
        color: "#7A7E83",
        selectedColor: "#3cc51f",
        "list": [
            {
                "text": "个人信息",
                "iconPath": "/resource/user.png",
                "selectedIconPath": "/resource/user_select.png"
            },
            {
                "text": "比赛报名",
                "iconPath": "/resource/match.png",
                "selectedIconPath": "/resource/match_select.png"
            },
            {
                "text": "成绩查询",
                "iconPath": "/resource/source.png",
                "selectedIconPath": "/resource/source_select.png"
            },
        ],
    },
    onLoad: function(e) {
        let id = wx.getStorageSync('althetes_id');
        if(id.length === 0){
            wx.showToast({
                title: '警告: 不允许未登录使用运动员系统',
                icon: 'error',
                duration: 2000
              });
            wx.reLaunch({
                url: '/pages/index/index',
            })
        }
    },
    switchTab(e) {
        const data = e.currentTarget.dataset
        this.setData({
                //切换tab时，改变当前激活的序号，改变tab颜色图标等样式  
            selected: data.index,
            match: data.index === 1 ? true : false,
            info: data.index === 0 ? true : false,
            source: data.index === 2 ? true : false
        })
    }

    
})