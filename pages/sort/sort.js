// pages/sort/sort.js
const db = wx.cloud.database();
const databases = require('../../const/database');
const aes = require("../../utils/aes_util")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        sort_data:[],
        temp_source_ath: [],
        type: 1,
    },
    getSortData(t) {
        let type;
        if(typeof(t) === 'number'){
            type = t;
        }else{
            type = parseInt(t.currentTarget.dataset.type);
        }
        console.log(type);
        if(type === 1){
            this.getAlthetesSortData()
        }else if(type === 2){
            this.getClassesSortData()
        }else if(type === 3){
            this.getCollegeSortData()
        }

    },
    getAlthetesSortData(){
        this.setData({
            type: 1,
            sort_data: [],
            temp_source_ath: []
        })
        db.collection(databases.athletes_user).get().then(res => {
            const r = [...res.data]
            r.forEach(e => {
                let source = 0;
                db.collection(databases.matchs).get().then(res => {
                    const d = [...res.data]
                    let sort_re = [...this.data.sort_data]
                    let temp = [...this.data.temp_source_ath]
                    let cc;
                    d.forEach(t => {
                        cc = t.match_join_althetes.find(m => m.althetes_id == e._id)
                        if(cc === null || cc === undefined){
                            source += 0
                        }else{
                            source += cc.source
                        }
                    })
                    sort_re.push({id: e._id, sort_photo: e.althetes_url, sort_name: aes.AesDecrypt(aes.Base64Decode(e.althetes_name)), sort_source: source, sort_class: e.althetes_ofClass})
                    sort_re.sort((a, b) => b.sort_source - a.sort_source)
                    temp.push({id: e._id, sort_source: source, sort_class: e.althetes_ofClass})
                    this.setData({
                        sort_data: sort_re,
                        temp_source_ath: temp
                    })

                })
            })
        });
    },
    getClassesSortData(){
        let sourcelist = [...this.data.temp_source_ath]
        this.setData({
            type: 2,
            sort_data: []
        })
        let tm = []
        let sort_re = [...this.data.sort_data]
        sourcelist.forEach(c => tm.push(c.sort_class))
        tm = [...new Set(tm)]
        tm.forEach(t => {
            let source = 0
            db.collection(databases.classes).where({
                class_name: t
            }).get().then(res => {
                let class_re = [...res.data]
                let fil = sourcelist.filter(c => c.sort_class === t);
                fil.forEach(f => source += f.sort_source)
                
                sort_re.push({id: class_re[0]._id, sort_photo: class_re[0].class_url, sort_name: t, sort_source: source})
                sort_re.sort((a, b) => b.sort_source - a.sort_source)
                
                this.setData({
                    sort_data: sort_re
                })
            })
        })
    },
    getCollegeSortData(){
        let sourcelist = [...this.data.temp_source_ath]
        this.setData({
            type: 3,
            sort_data: []
        })
        let tm = []
        let sort_re = [...this.data.sort_data]
        sourcelist.forEach(c => tm.push(c.sort_class))
        db.collection(databases.college).get().then(res => {
            let college = [...res.data]
            college.forEach(c => {
                let source = 0;
                sort_re.push({id: c._id, sort_name: c.college_name, sort_photo: c.college_url, sort_source: 0});
                db.collection(databases.classes).where({
                    class_ofCollege: c.college_name
                }).get().then(cres => {
                    let classes = [...cres.data]
                    console.log(classes);
                    let fil = []
                    let tmp = ""
                    classes.forEach(ca => {
                        tmp = ca.class_ofCollege;
                        console.log(sourcelist);
                        fil.push(sourcelist.filter(so => so.sort_class === ca.class_name))
                        console.log(fil);
                    })
                    fil.forEach(f => {
                        f.forEach(ff => {
                            source += ff.sort_source;
                        })
                    })
                    console.log(source);
                    sort_re.forEach(s => {
                        if(s.sort_name === tmp){
                            s.sort_source = source
                        }
                    })
                    sort_re.sort((a, b) => b.sort_source - a.sort_source)
                    this.setData({
                        sort_data: sort_re
                    })
                })
            })
        })
    },

    onShow() {
        this.getSortData(1);
    },

})