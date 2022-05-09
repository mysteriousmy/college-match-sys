// pages/myComments/myComments.js
const db = wx.cloud.database();
const databases = require('../../const/database');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        comment_list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getAllComments()
    },
    getAllComments(){
        let userInfo = wx.getStorageSync('userInfo');
        let comment_list = [];
        db.collection(databases.matchs).get().then(res => {
            let tmp = [...res.data]
            tmp.forEach(t => {
                let comments = [...t.match_comments]
                let fil = comments.filter(m => m.user_id === userInfo._id);
                console.log(fil);
                if(fil.length !== 0){
                    fil.forEach(f => {
                        comment_list.push({id: t._id, comment_id: f.id, match_title: t.match_title, comment_url: f.comments_user_photo, comments_content: f.comments_content, comments_time: f.comments_time})
                    })
                    this.setData({
                        comment_list: comment_list
                    })
                    console.log(comment_list);
                }
            })
        })
    },
    gotoDetail(e){
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: `/pages/detail/detail?id=${id}`,
        })
    },
    deleteComment(e){
        let id = e.currentTarget.dataset.id;
        let tid = e.currentTarget.dataset.tid;
        console.log(id , tid);
        db.collection(databases.matchs).doc(tid).get().then(res =>{
            let tmp = [...res.data.match_comments];
            tmp.pop(tmp.findIndex(t => t.id === id));
            db.collection(databases.matchs).doc(tid).update({
                data: {
                    match_comments: tmp
                }
            }).then(res => {
                wx.showToast({
                  title: '删除成功',
                });
                this.getAllComments()
            })
        })
    }
})