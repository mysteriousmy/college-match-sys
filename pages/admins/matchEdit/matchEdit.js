// pages/admins/matchAdd/matchAdd.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
const aes = require('../../../utils/aes_util')
const uuid = require('../../../utils/uuid')
Page({
    data: {
        match_id: "",
        match_title: "",
        status: null,
        match_join_althetes: [],
        match_images: [],
        match_videos: [],
        match_comments: [],
        match_desc: "",
        match_time: "",
        fileUrl: "",
        isSaveBack: false,
        imageUrl: "",
        showImage: false,
        editOrAddFlag: false,
        options: [],
        topsHeight: "30%",
        opacity: "0.5",
        IsSingle: true,
        showModalOfImage: false,
        showModalOfVideo: false,
        showModalOfApply: false,
        showModalOfCheck: false,
        showModalOfSource: false,
        temp_text: "",
        showEditModal: false,
        select_status: "",
        temp_id: "",
        temp_type: 0,
    },
    bandleChange(e) {
        let bandle = e.detail.value;
        if (bandle === 'url') {
            this.setData({
                match_type: true
            })
        } else if (bandle === 'file') {
            this.setData({
                match_type: false
            })
        }
    },
    chooseVideo(t) {
        let that = this
        let type = parseInt(t.currentTarget.dataset.type)
        let timestamp = (new Date()).valueOf()
        wx.chooseVideo({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                wx.showLoading({
                    title: '上传中',
                })
                
                that.uploadFile(res.tempFilePath, timestamp + '.mp4', type, false)
                wx.showToast({
                    title: '上传成功',
                    icon: "success",
                    duration: 2000
                })
            }
        });

    },
    chooseImg(c) {
        let that = this
        let count = parseInt(c.currentTarget.dataset.count)
        let type = parseInt(c.currentTarget.dataset.type)
        let timestamp = (new Date()).valueOf()
        wx.chooseImage({
            count: count,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                wx.showLoading({
                    title: '上传中',
                })
                if (count == 1) {
                    // tempFilePath可以作为img标签的src属性显示图片
                    const tempFilePaths = res.tempFilePaths

                    //调用uploadImg(tempFile)函数，实现图片上传功能
                    //that.uploadImg(tempFilePaths[0])

                    //调用uploadFile()实现上传文件功能

                    that.uploadFile(tempFilePaths[0], timestamp + '.png', type, true) //传递三个参数
                }

                if (count > 1) {
                    let num = 0;
                    res.tempFilePaths.forEach((t) => {
                        num++;
                        that.uploadFile(t, timestamp + '-' + num + '.png', type, false)
                    })
                }
                wx.showToast({
                    title: '上传成功',
                    icon: "success",
                    duration: 2000
                })
            }
        })
    },
    uploadFile(tempFile, fileName, type, isIndex) {
        console.log("要上传文件的临时路径", tempFile)
        if (this.data.fileUrl.length !== 0 && isIndex) {
            let fileList = [this.data.fileUrl]
            wx.cloud.deleteFile({
                fileList: fileList
            })
        }
        let filesID = "";
        let path = type === 1 ? "images/" : "videos/"
        let that = this;
        console.log(that.data.match_images);
        wx.cloud.uploadFile({
                cloudPath: `${path}${fileName}`, //云存储的路径
                filePath: tempFile, // 文件路径
            }).then(res => {
                console.log("上传成功", res)
                if (isIndex) {
                    setTimeout(function () {
                        that.setData({
                            fileUrl: res.fileID,
                            showImage: true, //显示图片
                        })
                    }, 1000);
                } else {
                    let data = "";
                    if (type == 1) {
                        let local_data = [...that.data.match_images];
                        data = {
                            img_id: uuid.genUuid(),
                            img_url: res.fileID
                        }
                        local_data.push(data)
                        that.setData({
                            match_images: local_data
                        })
                    } else {
                        let local_data = [...that.data.match_videos]
                        data = {
                            video_id: uuid.genUuid(),
                            video_url: res.fileID
                        }
                        local_data.push(data)
                        that.setData({
                            match_videos: local_data
                        })
                    }
                }

            })
            .catch(err => {
                wx.showToast({
                    title: '上传失败',
                    icon: 'error',
                    duration: 2000
                })
                console.log("上传失败", err);
            })
        return filesID
    },
    onLoad: function (e) {
        this.initStatusData();
        if (e.id != null && e.id.length != 0) {
            this.setData({
                editOrAddFlag: true,
                match_id: e.id
            })
            db.collection(databases.matchs).doc(e.id).get().then(res => {
                this.setData({
                    match_title: res.data.match_title,
                    match_desc: res.data.match_desc,
                    match_join_althetes: res.data.match_join_althetes,
                    match_images: res.data.match_images,
                    match_videos: res.data.match_videos,
                    match_time: res.data.match_time,
                    match_comments: res.data.match_comments,
                    fileUrl: res.data.match_url,
                    status: res.data.status,
                    select_status: this.getStatusText(res.data.status),
                    showImage: true
                })

            })
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
    initStatusData() {
        let datas = [{
                "Text": "报名中",
                "Value": 0
            },
            {
                "Text": "检录中",
                "Value": 1
            },
            {
                "Text": "进行中",
                "Value": 2
            },
            {
                "Text": "已结束",
                "Value": 3
            }
        ]
        this.setData({
            options: datas
        })
    },
    SelectFinish: function (even) {
        let tmp = even.detail;
        tmp.forEach(t => {
            if (t.Selected) {
                this.setData({
                    select_status: t.Text,
                    status: t.Value
                })
            }
        })
    },
    selectStockOutType: function () {
        this.selectComponent("#select").showPopup();
    },
    onUnload: function () {
        if (!this.data.isSaveBack) {
            this.cancelLogic();
        }
    },
    validateNumber(val) {
        //正则表达式指定字符串只能为数字
        return val.replace(/\D/g, '')
    },
    inputChange(e) {
        this.setData({
            match_title: e.target.id === "match_title" ? e.detail.value : this.data.match_title,
            match_desc: e.target.id === "match_desc" ? e.detail.value : this.data.match_desc,
            temp_text: e.target.id === "edit" ? e.detail.value :(e.target.id === "edit_num" ? this.validateNumber(e.detail.value): this.data.temp_text)
        })
    },
    updatematchData() {
        let status = this.data.status
        let temp = "";
        switch (status) {
            case null:
                wx.showToast({
                    title: "选择比赛状态！",
                    icon: 'error',
                    duration: 2000
                })
                break;
            case 0:
                this.buildUpdateFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数")
                break;
            case 1:
                temp = this.data.match_join_althetes;
                console.log(temp.length);
                if(temp.length < 4){
                    wx.showModal({
                      title: '警告：',
                      content: '不存在报名人员或人数小于4个，无法切换至检录状态！',
                      showCancel: false,
                    });
                }else{
                    this.buildUpdateFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                }
                break;
            case 2:
                temp = this.data.match_join_althetes;
                const re = temp.filter(r => r.checkStatus === '检录通过')
                if(re.length < 4){
                    wx.showModal({
                        title: '警告：',
                        content: '不存在检录通过的人员或人数小于4个，无法切换至进行状态！',
                        showCancel: false,
                      });
                }else{
                    this.buildUpdateFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                }
                break;
            case 3:
                temp = this.data.match_join_althetes;
                const re2 = temp.filter(r => r.checkStatus === '检录通过')
                if(re2.length < 4){
                    wx.showModal({
                        title: '警告：',
                        content: '不存在检录通过的人员或人数小于4个，无法切换至进行状态！',
                        showCancel: false,
                      });
                }else{
                    this.buildUpdateFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                }
            default:
                break;
        }
    },
    getNowTime(){
        let date = new Date();
        const result = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDay()}日 ${date.getHours()}:${date.getMinutes()}`
        return result
    },
    buildUpdateFunction(condition, tips){
        if (condition) {
            wx.showToast({
                title: tips,
                icon: 'error',
                duration: 2000
            })
        } else {
            let matchData = {
                match_title: this.data.match_title,
                match_desc: this.data.match_desc,
                match_join_althetes: this.data.match_join_althetes,
                match_images: this.data.match_images,
                match_videos: this.data.match_videos,
                match_comments: this.data.match_comments,
                match_url: this.data.fileUrl,
                match_time: this.data.match_time,
                status: this.data.status
            }
            db.collection(databases.matchs).doc(this.data.match_id).update({
                data: matchData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateBack();
            }).catch(err => {
                wx.showToast({
                    title: '保存失败',
                    icon: 'error',
                    duration: 2000
                })
                console.log(err);
            })
        }
    },
    buildSaveFunction(condition,tips){
        if (condition) {
            wx.showToast({
                title: tips,
                icon: 'error',
                duration: 2000
            })
        } else {
            let matchData = {
                match_title: this.data.match_title,
                match_desc: this.data.match_desc,
                match_images: this.data.match_images,
                match_videos: this.data.match_videos,
                match_comments: this.data.match_comments,
                match_join_althetes: this.data.match_join_althetes,
                match_url: this.data.fileUrl,
                match_time: this.getNowTime(),
                status: this.data.status
            }
            db.collection(databases.matchs).add({
                data: matchData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateBack();
            }).catch(err => {
                wx.showToast({
                    title: '保存失败',
                    icon: 'error',
                    duration: 2000
                })
                console.log(err);
            })
        }
    },
    savematchData() {
        let status = this.data.status
        let temp = "";
        console.log(status);
        switch (status) {
            case null:
                wx.showToast({
                    title: "选择比赛状态！",
                    icon: 'error',
                    duration: 2000
                })
                break;
            case 0:
                this.buildSaveFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数")
                break;
            case 1:
                temp = this.data.match_join_althetes;
                console.log(temp.length);
                if(temp.length < 4){
                    wx.showModal({
                      title: '警告：',
                      content: '不存在报名人员或人数小于4个，无法切换至检录状态！',
                      showCancel: false,
                    });
                }else{
                    this.buildSaveFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                }
                break;
            case 2:
                temp = this.data.match_join_althetes;
                const re = temp.filter(r => r.checkStatus === '检录通过')
                if(re.length < 4){
                    wx.showModal({
                        title: '警告：',
                        content: '不存在检录通过的人员或人数小于4个，无法切换至进行状态！',
                        showCancel: false,
                      });
                }else{
                    this.buildSaveFunction((this.data.match_title.length === 0) || (this.data.match_desc.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                }
                break;
            default:
                this.buildSaveFunction((this.data.match_title.length === 0) || (this.data.fileUrl.length === 0), "请输入必要参数");
                break;
        }


        
    },
    cancelLogic() {
        if (this.data.fileUrl.length !== 0 && !this.data.editOrAddFlag) {
            let fileList = [this.data.fileUrl]
            wx.cloud.deleteFile({
                fileList: fileList
            })
        }
    },
    disableSave() {
        this.cancelLogic()
        wx.navigateBack()
    },
    openModal(t) {
        let type = parseInt(t.currentTarget.dataset.type);
        this.setData({
            showModalOfApply: type === 0 ? true : false,
            showModalOfCheck: type === 1 ? true : false,
            showModalOfSource: type === 2 ? true : false,
            showModalOfImage: type === 3 ? true : false,
            showModalOfVideo: type === 4 ? true : false
        })

    },
    closeModal() {
        this.setData({
            showModalOfApply: false,
            showModalOfCheck: false,
            showModalOfSource: false,
            showModalOfImage: false,
            showModalOfVideo: false
        })
    },
    sourceEdit() {

    },
    failDelete() {

    },
    trueCheck(t) {
        let that = this;
        wx.showModal({
            success: function(e) {
                if(e.confirm){
                    let id = t.currentTarget.dataset.id;
                    let tmp = [...that.data.match_join_althetes];
                    tmp.forEach(t => {
                        if(t.althetes_id === id){
                            t.checkStatus = "检录通过"
                            t.failCheckText = ""
                        }
                    })
                    that.setData({
                        match_join_althetes: tmp
                    })
                }
            },
            title: "提示：",
            content: "确定通过该运动员的检录？",
        })
    },
    falseCheck(t) {
        let id = t.currentTarget.dataset.id;
        console.log(id);
        let tmp = [...this.data.match_join_althetes];
        let re = tmp.find(t => t.althetes_id === id)
        console.log(re);
        this.setData({
            showEditModal: true,
            temp_id : re.althetes_id,
            temp_text: re.failCheckText,
            temp_type: 0
        })
    },
    editSource(t){
        let id = t.currentTarget.dataset.id;
        let tmp = [...this.data.match_join_althetes];
        let re = tmp.find(t => t.althetes_id === id)
        this.setData({
            showEditModal: true,
            temp_id : re.althetes_id,
            temp_text: re.source,
            temp_type: 1
        })
    },
    deletematchApplyPeople(t) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: "确认要删除该运动员的报名信息？",
            success: function(e) {
                if(e.confirm){
                    let id = t.currentTarget.dataset.id;
                    let tmp = [...that.data.match_join_althetes];
                    let re = tmp.find(t => t.althetes_id === id);
                    tmp.splice(tmp.indexOf(re), 1)
                    that.setData({
                        match_join_althetes: tmp
                    })
                }
            }
        })
    },
    deletematchImage(t) {
        let id = t.currentTarget.dataset.id;
        let tmp = [...this.data.match_images];
        let re = tmp.find(t => t.img_id === id);
        wx.cloud.deleteFile({
            fileList: [re.img_url]
        })
        tmp.splice(tmp.indexOf(re), 1)
        this.setData({
            match_images: tmp
        })
    },
    deletematchVideo(t){
        let id = t.currentTarget.dataset.id;
        let tmp = [...this.data.match_videos];
        let re = tmp.find(t => t.video_id === id);
        wx.cloud.deleteFile({
            fileList: [re.video_url]
        })
        tmp.splice(tmp.indexOf(re), 1)
        this.setData({
            match_videos: tmp
        })
    },
    submitEdit(t){
        let tmp = [...this.data.match_join_althetes];
        let t_id = this.data.temp_id;
        let text = this.data.temp_text;
        let type = this.data.temp_type;
        if(type === 0){
            tmp.forEach(t => {
                if(t.althetes_id === t_id){
                    t.failCheckText = text
                    t.checkStatus = "未通过"
                }
            })
        }else{
            tmp.forEach(t => {
                if(t.althetes_id === t_id){
                    t.source = parseInt(text)
                }
            })
        }
        
        this.setData({
            showEditModal: false,
            match_join_althetes: tmp
        })
    },
    cancelEdit(){
        this.setData({
            showEditModal: false
        })
    }
})