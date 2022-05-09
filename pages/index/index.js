// index.js
const db = wx.cloud.database();
const databases = require('../../const/database');
Page({
    data: {
        banner_list: [],
        match_list: [],
        banner: {
            //是否显示指示点：
            // 是否显示面板指示点
            indicatorDots: true,
            // 滑动方向是否为纵向
            vertical: false,
            // 自动切换
            autoplay: true,
            // 采用衔接滑动
            circular: true,
            // 自动切换时间间隔2s
            interval: 2000,
            // 滑动动画时长0.5s
            duration: 500,
            // 前边距，可用于露出前一项的一小部分，接受 px 和 rpx 值
            previousMargin: 0,
            // 后边距，可用于露出后一项的一小部分，接受 px 和 rpx 值
            nextMargin: 0
        }
    },
    search() {
        wx.redirectTo({
            url: '/pages/athletes/home/athletesHome',
        })
    },
    onLoad: function (e) {
        this.getAllBanner()
        this.getAllMatchs()
    },
    onShow: function (e) {
        this.getAllBanner()
        this.getAllMatchs()
    },
    getAllMatchs() {
        db.collection(databases.matchs).get().then(res => {
            let tmp = res.data
            tmp.forEach(t => t.status_text = this.getStatusText(t.status))
            this.setData({
                match_list: res.data
            })
        })
    },
    toSearchPage(e){
        const type = e.currentTarget.dataset.type;
        wx.navigateTo({
          url: `/pages/search/search?type=${type}`,
        })
    },
    goToDetailPage(e){
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: `/pages/detail/detail?id=${id}`,
        })
    },
    getAllBanner() {
        db.collection(databases.banner).get().then(res => {
            this.setData({
                banner_list: res.data
            })
        })
    },
    getStatusText(status) {
        switch (status) {
            case 0:
                return "报名中"
            case 1:
                return "检录中"
            case 2:
                return "进行中"
            case 3:
                return "已结束"
            default:
                break;
        }
    },
})