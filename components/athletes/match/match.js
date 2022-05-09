// components/athletes/match/match.js
const aes = require("../../../utils/aes_util")
const db = wx.cloud.database();
const databases = require('../../../const/database');
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    lifetimes: {
        attached: function () {
            this.getMatchData()
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        match_data: [],
        showModalOfMatch: false,
        match_data_real: [],
        seach_word: "",
    },
  
    /**
     * 组件的方法列表
     */
    methods: {
        inputChange(e) {
            this.setData({
                seach_word: e.detail.value
            })
        },
        openMatchModal(e) {
            let info = wx.getStorageSync('althetes_info');
            let ate = info[0]

            let id = e.currentTarget.dataset.id;
            let status = e.currentTarget.dataset.status;
            let check = e.currentTarget.dataset.check;
            if (check === '未通过') {
                console.log(this.data.match_data);
                wx.showModal({
                    title: `${aes.AesDecrypt(aes.Base64Decode(ate.althetes_name))}同学，你检录未通过原因如下：`,
                    content: this.data.match_data.filter(m => m.id === id)[0].match_failCheck,
                    showCancel: false
                })
            } else {
                if (status === 0 || status === 1) {
                    db.collection(databases.matchs).where({
                        _id: id
                    }).get().then(res => {
                        const r = res.data[0]
                        const ate_status = r.match_join_althetes.filter(a => a.althetes_id === ate._id)
                        const content = {
                            id: id,
                            match_url: r.match_url,
                            match_title: r.match_title,
                            match_time: r.match_time,
                            match_desc: r.match_desc,
                            join_num: r.match_join_althetes.length,
                            status: ate_status.length === 0 ? "未报名" : "已报名"
                        }
                        this.setData({
                            showModalOfMatch: true,
                            match_data_real: content
                        })
                    })

                }
            }

        },
        seachMatchData() {
            if (this.data.seach_word.length === 0) {
               this.getMatchData()
            } else {
                let info = wx.getStorageSync('althetes_info');
                let id = info[0]._id;
                const _ = db.command
                db.collection(databases.matchs).where(_.or([{
                        status: 0
                    },
                    {
                        status: 1
                    }
                ]).and([{
                    match_title: db.RegExp({
                        regexp: ".*" + this.data.seach_word + ".*",
                        options: 'i'
                    })
                }])).get().then(res => {
                    this.logicData(res.data, id)
                });
            }
        },
        closeModal() {
            this.setData({
                match_data_real: [],
                showModalOfMatch: false
            })
        },
        joinThis(e) {
            let that = this;
            let id = e.currentTarget.dataset.id;
            wx.showModal({
                title: "提示：",
                content: "确定要报名该比赛吗",
                success: function (e) {
                    if (e.confirm) {
                        let ate = wx.getStorageSync('althetes_info')[0]
                        db.collection(databases.matchs).where({
                            _id: id
                        }).get().then(res => {
                            const tmp = [...res.data]
                            tmp[0].match_join_althetes.push({
                                althetes_id: ate._id,
                                althetes_name: aes.AesDecrypt(aes.Base64Decode(ate.althetes_name)),
                                althetes_photo: ate.althetes_url,
                                checkStatus: "检录中",
                                failCheckText: "",
                                source: 0
                            })
                            db.collection(databases.matchs).doc(id).update({
                                data: {
                                    match_join_althetes: tmp[0].match_join_althetes
                                }
                            }).then(res => {
                                that.getMatchData()
                                wx.showToast({
                                    title: '报名成功！',
                                    icon: 'success',
                                    duration: 2000
                                })
                                that.closeModal();
                            }).catch(res => {
                                wx.showToast({
                                    title: '报名失败！',
                                    icon: 'error',
                                    duration: 2000
                                })
                                console.error(res);
                            })
                        })

                    }
                }
            })
        },
        cancelThis(e) {
            let that = this;
            let id = e.currentTarget.dataset.id;
            wx.showModal({
                title: "提示：",
                content: "确定要报名该比赛吗",
                success: function (e) {
                    if (e.confirm) {
                        let ate = wx.getStorageSync('althetes_info')[0]
                        db.collection(databases.matchs).where({
                            _id: id
                        }).get().then(res => {
                            const tmp = [...res.data]
                            const rIndex = tmp[0].match_join_althetes.findIndex(m => m.althetes_id === ate._id)
                            tmp[0].match_join_althetes.pop(rIndex);
                            db.collection(databases.matchs).doc(id).update({
                                data: {
                                    match_join_althetes: tmp[0].match_join_althetes
                                }
                            }).then(res => {
                                that.getMatchData()
                                wx.showToast({
                                    title: '取消成功！',
                                    icon: 'success',
                                    duration: 2000
                                })
                                that.closeModal();
                            }).catch(res => {
                                wx.showToast({
                                    title: '取消失败！',
                                    icon: 'error',
                                    duration: 2000
                                })
                                console.error(res);
                            })
                        })

                    }
                }
            })
        },
        getMatchData() {
            let info = wx.getStorageSync('althetes_info');
            let id = info[0]._id;
            let that = this;
            const _ = db.command;
            db.collection(databases.matchs).where(_.or([{
                    status: 0
                },
                {
                    status: 1
                }
            ])).get().then(res => {
                that.logicData(res.data, id)
            })
        },
        showError() {
            wx.showModal({
                showCancel: false,
                title: "李三同学，你检录未通过的原因如下:",
                content: "1.你的参赛鞋子不符合比赛要求的规范，请更换鞋子。2.你的腿部在检录当日存在轻微抽筋，注意安全！"
            })
        },
        logicData(data, id) {
            let tmp = [...data]
            let content = []
            tmp.forEach(t => {
                let status = ""
                let checkStatus = ""
                let failcheckText = ""
                let re = t.match_join_althetes.filter(m => m.althetes_id === id)
                if (re.length === 0) {
                    status = "未报名"
                } else {
                    status = "已报名";
                    checkStatus = re[0].checkStatus;
                    failcheckText = re[0].failCheckText;
                }
                content.push({
                    id: t._id,
                    match_url: t.match_url,
                    match_title: t.match_title,
                    match_status: t.status,
                    status: status,
                    match_check: checkStatus,
                    match_failCheck: failcheckText,
                    match_desc: t.match_desc
                })
            })
            this.setData({
                match_data: content
            })
        }
    }
})