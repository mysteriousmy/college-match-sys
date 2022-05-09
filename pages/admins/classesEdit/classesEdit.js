// pages/admins/classAdd/classAdd.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
Page({

    data: {
        class_id: "",
        class_name: "",
        class_desc: "",
        class_type: true,
        fileUrl: "",
        isSaveBack: false,
        imageUrl: "",
        showImage: false,
        editOrAddFlag: false,
        options: [], //数据集
        topsHeight: "30%", //高度
        opacity: "0.5", //透明度
        IsSingle: true, //是否单选
        select_college: ""
    },
    bandleChange(e) {
        let bandle = e.detail.value;
        if (bandle === 'url') {
            this.setData({
                class_type: true
            })
        } else if (bandle === 'file') {
            this.setData({
                class_type: false
            })
        }
    },
    chooseImg() {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                console.log("选择成功", res);
                wx.showLoading({
                    title: '上传中',
                })
                // tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = res.tempFilePaths

                //调用uploadImg(tempFile)函数，实现图片上传功能
                //that.uploadImg(tempFilePaths[0])

                //调用uploadFile()实现上传文件功能
                let timestamp = (new Date()).valueOf()
                that.uploadFile(tempFilePaths[0], +timestamp + '.png') //传递三个参数
            }
        })
    },
    uploadFile(tempFile, fileName) {
        console.log("要上传文件的临时路径", tempFile)
        if (this.data.fileUrl.length !== 0) {
            let fileList = [this.data.fileUrl]
            wx.cloud.deleteFile({
                fileList: fileList
            })
        }
        wx.cloud.uploadFile({
                cloudPath: `images/${fileName}`, //云存储的路径
                filePath: tempFile, // 文件路径
            }).then(res => {
                console.log("上传成功", res)
                wx.showToast({
                    title: '上传成功',
                    icon: "success",
                    duration: 2000
                })
                let that = this;
                setTimeout(function () {
                    that.setData({
                        fileUrl: res.fileID,
                        showImage: true, //显示图片
                    })
                }, 1000);
            })
            .catch(err => {
                wx.showToast({
                    title: '上传失败',
                    icon: 'error',
                    duration: 2000
                })
                console.log("上传失败", err);
            })
    },
    onLoad: function (e) {
        this.initCollegeData();
        if (e.id != null && e.id.length != 0) {
            this.setData({
                editOrAddFlag: true,
                class_id: e.id
            })
            db.collection(databases.classes).doc(e.id).get().then(res => {
                this.setData({
                    class_name: res.data.class_name,
                    class_desc: res.data.class_desc,
                    fileUrl: res.data.class_url,
                    select_college: res.data.class_ofCollege,
                    showImage: true
                })
            })
        }
    },
    initCollegeData(){
        db.collection(databases.college).get().then(res => {
            let datas = []
            res.data.forEach(r => {
                datas.push({"Text": r.college_name, "Value": r._id})
            })
            this.setData({
                options: datas
            })
        })
    },
    SelectFinish: function (even) {
        let tmp = even.detail;
        tmp.forEach(t => {
            if(t.Selected){
                this.setData({
                    select_college: t.Text
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
    inputChange(e) {
        this.setData({
            class_name: e.target.id === 'class_name' ? e.detail.value : this.data.class_name,
            fileUrl: e.target.id === 'fileUrl' ? e.detail.value : this.data.fileUrl,
            class_desc: e.target.id === 'class_desc' ? e.detail.value : this.data.class_desc,
        })
    },
    updateClassData() {
        if (this.data.class_name.length === 0 || this.data.fileUrl.length === 0) {
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            db.collection(databases.classes).where({
                class_name: this.data.class_name
            }).get().then(res => {
                if(res.data.length != 0){
                    wx.showToast({
                      title: '班级名已存在！',
                        icon: 'error',
                        duration: 2000
                    })
                }else{
                    let classData = {
                        class_name: this.data.class_name,
                        class_url: this.data.fileUrl,
                        class_desc: this.data.class_desc,
                        class_ofCollege: this.data.select_college
                    }
                    db.collection(databases.classes).doc(this.data.class_id).update({
                        data: classData
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
            })
           
        }
    },

    saveClassData() {
        if (this.data.class_name.length === 0 || this.data.fileUrl.length === 0 || this.data.select_college.length === 0) {
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            db.collection(databases.classes).where({
                class_name: this.data.class_name
            }).get().then(res => {
                if(res.data.length != 0){
                    wx.showToast({
                      title: '班级名已存在！',
                        icon: 'error',
                        duration: 2000
                    })
                }else{
                    let classData = {
                        class_name: this.data.class_name,
                        class_url: this.data.fileUrl,
                        class_desc: this.data.class_desc,
                        class_ofCollege: this.data.select_college
                    }
                    db.collection(databases.classes).add({
                        data: classData
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
            });
           
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
    }
})