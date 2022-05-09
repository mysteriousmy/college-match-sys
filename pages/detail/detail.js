// pages/detail/detail.js
const db = wx.cloud.database();
const databases = require('../../const/database');
const uuid= require('../../utils/uuid')
const aes = require("../../utils/aes_util")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        match: {},
        classes: [],
        colleges: [],
        sort_data: [],
        showModalOfAlthetes: false,
        althetes_modal_info: "",
        showEditModal: false,
        temp_text: "",
        temp_target_id: "",
        loading: true,
        isFocus: false,
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
    inputChange(e) {
        this.setData({
            temp_text: e.detail.value
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let matchId = options.id;
        let userInfo = wx.getStorageSync('userInfo');
        db.collection(databases.focus).where({
            focus_id: matchId,
            focus_user: userInfo._id
        }).get().then(res => {

            if(res.data.length === 0){
                this.setData({
                    isFocus: false
                })
            }else{
                this.setData({
                    isFocus: true
                })
            }
        })
        db.collection(databases.matchs).doc(matchId).get().then(res => {
            let tmp = res.data;
            tmp.status_text = this.getStatusText(res.data.status);
            if (res.data.status === 2 || res.data.status === 3) {
                this.getSortData(res.data._id);
            }
            let ath_ids = [];
            tmp.match_join_althetes.forEach(m => {
                ath_ids.push(m.althetes_id);
            })
            if(tmp.match_join_althetes.length === 0){
                this.setData({
                    loading: false
                })
            }
            this.getClassesNum(ath_ids)
            const althetes_num = res.data.match_join_althetes.length;
            tmp.althetes_num = althetes_num
            this.setData({
                match: res.data
            })

        })
    },
    focusThisMatch(e) {
        let id = e.currentTarget.dataset.id;
        let data = {};
        let userInfo = wx.getStorageSync('userInfo');
        if(!this.data.isFocus){
            data = {
                focus_id: id,
                focus_user: userInfo._id
            }
            db.collection(databases.focus).add({
                data: data
            }).then(res => {
                wx.showToast({
                  title: '关注成功！',
                  icon: 'success',
                  duration: 2000
                })
                this.setData({
                    isFocus: true
                })
            }).catch(res => {
                wx.showToast({
                    title: '关注失败！',
                    icon: 'error',
                    duration: 2000
                })
            })
        }else{
            db.collection(databases.focus).where({
                focus_id: id,
                focus_user: userInfo._id
            }).get().then(res => {
                db.collection(databases.focus).doc(res.data[0]._id).remove().then(res => {
                    wx.showToast({
                        title: '取消关注',
                        icon: 'error',
                        duration: 2000
                    })
                    this.setData({
                        isFocus: false
                    })
                })
            })
        }
       
    },
    pubComments(e) {
        let id = e.currentTarget.dataset.id;
        console.log(id);
        this.setData({
            showEditModal: true,
            temp_target_id: id,
        })
    },
    getNowTime() {
        let date = new Date();
        const result = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDay()}日 ${date.getHours()}:${date.getMinutes()}`
        return result
    },
    cancelEdit() {
        this.setData({
            showEditModal: false,
        })
    },
    submitEdit() {
        let text = this.data.temp_text;
        let id = this.data.temp_target_id;
        console.log(id);
        let userInfo = wx.getStorageSync('userInfo');
        if (text.length === 0) {
            wx.showToast({
                title: '评论不可为空',
                icon: "error",
                duration: 2000
            })
        } else {
            db.collection(databases.matchs).doc(id).get().then(res => {
                let ori_comments = [...res.data.match_comments];
                const comments = {
                    id: uuid.genUuid(),
                    user_id: userInfo._id,
                    comments_user_name: userInfo.nickName,
                    comments_user_photo: userInfo.avatarUrl,
                    comments_content: text,
                    comments_time: this.getNowTime()
                }
                ori_comments.push(comments);
                db.collection(databases.matchs).doc(id).update({
                    data: {
                        match_comments: ori_comments
                    }
                })
                this.setData({
                    ['match.match_comments']:  ori_comments,
                    showEditModal: false,
                    temp_target_id: id
                });
            })
        }
    },
    getSortData(id) {
        db.collection(databases.matchs).where({
            _id: id
        }).get().then(res => {
            const r = res.data[0]
            const results = r.match_join_althetes
            let content = []
            results.forEach(s => {
                content.push({
                    id: s.althetes_id,
                    althetes_name: s.althetes_name,
                    althetes_photo: s.althetes_photo,
                    source: s.source,
                })
            })
            content.sort((a, b) => b.source - a.source)
            this.setData({
                sort_data: content
            })
        })

    },
    async getClassesNum(id) {
        let count = []
        let result = []
        let co = []
        await id.forEach(async (i) => {
            await db.collection(databases.athletes_user).doc(i).get().then(res => {
                const re = res.data.althetes_ofClass;
                count.push(re)
                count = [...new Set(count)];
                this.setData({
                    classes: count
                });
                count.forEach(cc => {
                    db.collection(databases.classes).where({
                        class_name: cc
                    }).get().then(res => {
                        result.push(res.data[0])
                        const re = res.data[0].class_ofCollege
                        co.push(re);
                        co = [...new Set(co)]
                        this.setData({
                            colleges: co
                        })
                    })
                })
            })
        })
    },
    openAlthetesMoal(e){
        console.log(e);
        let id = e.currentTarget.dataset.id;
        db.collection(databases.athletes_user).where({
            _id: id
        }).get().then(res => {
            let tmp = [...res.data]
            tmp[0].althetes_name = aes.AesDecrypt(aes.Base64Decode(tmp[0].althetes_name))
            db.collection(databases.matchs).get().then(res => {
                let tmpss = [...res.data]
                let source = 0;
                tmpss.forEach(t => {
                    let ath_tmp = [...t.match_join_althetes]
                    const result = ath_tmp.filter(m => m.althetes_id === id);
                    if(result.length !== 0){
                        source += result[0].source
                    }
                })
                tmp[0].all_source = source
                const classes = tmp[0].althetes_ofClass
                db.collection(databases.classes).where({
                    class_name: classes
                }).get().then(res => {
                    tmp[0].althetes_ofCollege = res.data[0].class_ofCollege;
                    this.setData({
                        althetes_modal_info: tmp[0],
                        showModalOfAlthetes: true,
                    })
                })
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
    closeAthModal(){
        this.setData({
            showModalOfAlthetes: false
        })
    },
})