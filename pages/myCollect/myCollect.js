// pages/myCollect/myCollect.js
const db = wx.cloud.database();
const databases = require('../../const/database');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        match_list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    goToDetailPage(e){
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: `/pages/detail/detail?id=${id}`,
        })
    },
    onLoad: function (options) {
        let userInfo = wx.getStorageSync('userInfo');
        db.collection(databases.focus).where({
            focus_user: userInfo._id
        }).get().then(res => {
            let tmp = [...res.data]
            let collect_ids = []
            let collect = []
            tmp.forEach(p => {
                collect_ids.push(p.focus_id)
            })
            collect_ids.forEach(c => {
                db.collection(databases.matchs).doc(c).get().then(res => {
                    collect = [...this.data.match_list];
                    collect.push(res.data);
                    this.setData({
                        match_list: collect
                    })
                })
            })
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})