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
        showModalOfAlthetes: false,
        sort_data: [],
        althetes_modal_info: "",
        seach_word: "",
        all_source: ""
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
        openAlthetesMoal(e){
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
                    const classes = tmp[0].althetes_ofClass
                    db.collection(databases.classes).where({
                        class_name: classes
                    }).get().then(res => {
                        tmp[0].althetes_ofCollege = res.data[0].class_ofCollege;
                        this.setData({
                            all_source: source,
                            althetes_modal_info: tmp[0],
                            showModalOfAlthetes: true,
                        })
                    })
                    
                })
               
            })
        },
        closeAthModal(){
            this.setData({
                showModalOfAlthetes: false
            })
        },
        openMatchModal(e) {
            let id = e.currentTarget.dataset.id;
            db.collection(databases.matchs).where({
                _id: id
            }).get().then(res => {
                const r = res.data[0]
                const results = r.match_join_althetes
                console.log(results);
                let content = []
                results.forEach(s => {
                    content.push({
                        id: s.althetes_id,
                        althetes_name: s.althetes_name,
                        althetes_photo: s.althetes_photo,
                        source: s.source,
                    })
                })
                console.log(content);
                content.sort((a,b) => b.source - a.source)
                this.setData({
                    showModalOfMatch: true,
                    sort_data: content
                })
            })


        },
        seachMatchData() {
            if (this.data.seach_word.length === 0) {
               this.getMatchData()
            } else {
                let info = wx.getStorageSync('althetes_info');
                let id = info[0]._id;
                db.collection(databases.matchs).where({
                    match_title: db.RegExp({
                        regexp: ".*" + this.data.seach_word + ".*",
                        options: 'i'
                    }),
                    status: 3
                }).get().then(res => {
                    this.logicData(res.data, id)
                });
            }
        },
        closeModal() {
            this.setData({
                sort_data: [],
                showModalOfMatch: false
            })
        },

        getMatchData() {
            let info = wx.getStorageSync('althetes_info');
            let id = info[0]._id;
            let that = this;
            const _ = db.command;
            db.collection(databases.matchs).where({
                status: 3
            }).get().then(res => {
                that.logicData(res.data, id)
            })
        },
        logicData(data, id) {
            let tmp = [...data]
            let content = []
            tmp.forEach(t => {
                let source = ""
                let re = t.match_join_althetes.filter(m => m.althetes_id === id)
                console.log(re);
                source = re[0].source;
                content.push({
                    id: t._id,
                    match_url: t.match_url,
                    match_title: t.match_title,
                    match_status: t.status,
                    source: source,
                    match_desc: t.match_desc
                })
            })
            this.setData({
                match_data: content
            })
        },
    }
})