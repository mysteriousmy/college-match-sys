const db = wx.cloud.database();
const databases = require('../../const/database');
const aes = require("../../utils/aes_util")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        search_type: "比赛",
        search_word: "",
        search_data: [],
        althetes_modal_info: [],
        showModalOfAlthetes: false,
        showModalOfCollege: false,
        showModalOfClasses: false,
        college_modal_info: [],
        classes_modal_info: []
    },
    inputChange(e) {
        this.setData({
            search_word: e.detail.value
        })
    },
    onLoad: function (e) {
        const type = e.type;

        this.setData({
            search_type: this.getTypeText(parseInt(type))
        })
    },
    goToSearchResult(e) {
        const type = parseInt(e.currentTarget.dataset.type);
        const id = e.currentTarget.dataset.id;
        if (type === 0) {
            this.goToDetailPage(id)
        } else if (type === 1) {
            this.openAlthetesMoal(id)
        } else if (type === 2) {
            this.openClassesModel(id)
        } else if (type === 3) {
            this.openCollegeModel(id)
        }
    },
    openClassesModel(e) {
        let id = e;
        db.collection(databases.classes).where({
            _id: id
        }).get().then(res => {
            let tmp = [...res.data]
            let result = {
                id: tmp[0].id,
                class_name: tmp[0].class_name,
                class_ofCollege: tmp[0].class_ofCollege,
                class_athnum: 0,
                class_source: 0,
                class_desc: tmp[0].class_desc,
                class_url: tmp[0].class_url
            }
            let source = 0;
            const classname = tmp[0].class_name;
            db.collection(databases.athletes_user).where({
                althetes_ofClass: classname
            }).get().then(res => {
                let aths = [...res.data]
                aths.forEach(a => {
                    db.collection(databases.matchs).get().then(res => {
                        let joins = [...res.data]
                        let join = []
                        joins.forEach(j => {
                            join.push(j.match_join_althetes)
                        })
                        console.log(join, a._id);
                        join.forEach(jj => {
                            let fil = [];
                            fil = jj.filter(jj => jj.althetes_id === a._id)
                            fil.forEach(f => {
                                source += f.source
                            })
                        })
                        result.class_source = source;
                        result.class_athnum = aths.length;
                        this.setData({
                            classes_modal_info: result,
                            showModalOfClasses: true
                        })
                    })
                })
            })
        })
    },
    openCollegeModel(e) {
        let id = e;
        db.collection(databases.college).where({
            _id: id
        }).get().then(res => {
            let tmp = [...res.data]
            let result = {
                id: tmp[0].id,
                college_name: tmp[0].college_name,
                college_classnum: 0,
                college_athnum: 0,
                college_source: 0,
                college_desc: tmp[0].college_desc,
                college_url: tmp[0].college_url
            }
            let source = 0;
            db.collection(databases.classes).where({
                class_ofCollege: tmp[0].college_name
            }).get().then(res => {
                let classtmp = [...res.data];
                result.college_classnum = classtmp.length;
                classtmp.forEach(c => {
                    db.collection(databases.athletes_user).where({
                        althetes_ofClass: c.class_name
                    }).get().then(res => {
                        let aths = [...res.data]
                        aths.forEach(a => {
                            db.collection(databases.matchs).get().then(res => {
                                let joins = [...res.data]
                                let join = []
                                joins.forEach(j => {
                                    join.push(j.match_join_althetes)
                                })
                                console.log(join, a._id);
                                join.forEach(jj => {
                                    let fil = [];
                                    fil = jj.filter(jj => jj.althetes_id === a._id)
                                    fil.forEach(f => {
                                        source += f.source
                                    })
                                })
                                result.college_source = source;
                                result.college_athnum = aths.length;
                                this.setData({
                                    college_modal_info: result,
                                    showModalOfCollege: true
                                })
                            })
                        })
                    })
                })
            })
        })
    },
    openAlthetesMoal(e) {
        let id = e;
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
                    if (result.length !== 0) {
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
    goToDetailPage(id) {
        wx.navigateTo({
            url: `/pages/detail/detail?id=${id}`,
        })
    },
    seachData() {
        let type = this.getType(this.data.search_type);
        if (this.data.search_word.length === 0) {
            wx.showModal({
                showCancel: false,
                title: "警告",
                content: "搜索关键字不可为空！"
            })
        } else {
            if (type === 0) {
                db.collection(databases.matchs).where({
                    match_title: db.RegExp({
                        regexp: ".*" + this.data.search_word + ".*",
                        options: 'i'
                    }),
                }).get().then(res => {
                    const result = [...res.data]
                    if (result.length === 0) {
                        this.setData({
                            search_data: []
                        })
                    }
                    let transData = [];
                    result.forEach(r => {
                        transData.push({
                            id: r._id,
                            images: r.match_url,
                            data_title: r.match_title,
                            data_text: r.match_desc,
                            status: r.status,
                            status_text: this.getStatusText(r.status),
                            type: 0
                        })
                        this.setData({
                            search_data: transData
                        })
                    })
                })
            } else if (type === 1) {
                db.collection(databases.athletes_user).get().then(res => {
                    const result = [...res.data]
                    result.forEach(r => {
                        r.althetes_name = aes.AesDecrypt(aes.Base64Decode(r.althetes_name))
                    });
                    let real_result = [...result]
                    real_result = real_result.filter(item => {
                        return item.althetes_name.includes(this.data.search_word);
                    })
                    if (real_result.length === 0) {
                        this.setData({
                            search_data: []
                        })
                    }
                    let transData = [];
                    real_result.forEach(r => {
                        transData.push({
                            id: r._id,
                            images: r.althetes_url,
                            data_title: r.althetes_name,
                            data_text: "简介：" + r.althetes_desc.length === 0 ? "这个人很懒，没有简介。" : r.althetes_desc,
                            type: 1
                        })
                        this.setData({
                            search_data: transData
                        })
                    })
                })
            } else if (type === 2) {
                db.collection(databases.classes).where({
                    class_name: db.RegExp({
                        regexp: ".*" + this.data.search_word + ".*",
                        options: 'i'
                    }),
                }).get().then(res => {
                    const result = [...res.data]
                    if (result.length === 0) {
                        this.setData({
                            search_data: []
                        })
                    }
                    let transData = [];
                    result.forEach(r => {
                        transData.push({
                            id: r._id,
                            images: r.class_url,
                            data_title: r.class_name,
                            data_text: r.class_desc.length === 0 ? "班级没有介绍信息" : r.class_desc,
                            type: 2
                        })
                        this.setData({
                            search_data: transData
                        })
                    })
                })
            } else {
                db.collection(databases.college).where({
                    college_name: db.RegExp({
                        regexp: ".*" + this.data.search_word + ".*",
                        options: 'i'
                    }),
                }).get().then(res => {
                    const result = [...res.data]
                    if (result.length === 3) {
                        this.setData({
                            search_data: []
                        })
                    }
                    let transData = [];
                    result.forEach(r => {
                        transData.push({
                            id: r._id,
                            images: r.college_url,
                            data_title: r.college_name,
                            data_text: r.college_desc.length === 0 ? "班级没有介绍信息" : r.college_desc,
                            type: 3
                        })
                        this.setData({
                            search_data: transData
                        })
                    })
                })
            }
        }

    },
    getTypeText(type) {
        switch (type) {
            case 0:
                return "比赛";
            case 1:
                return "运动员";
            case 2:
                return "班级";
            case 3:
                return "学院";
        }
    },
    getType(type) {
        console.log(type);
        switch (type) {
            case "比赛":
                return 0;
            case "运动员":
                return 1;
            case "班级":
                return 2;
            case "学院":
                return 3;
        }
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
    closeAthModal() {
        this.setData({
            showModalOfAlthetes: false
        })
    },
    closeClassModal() {
        this.setData({
            showModalOfClasses: false
        })
    },
    closeCollegeModal(){
        this.setData({
            showModalOfCollege: false
        })
    }
})