// pages/admins/bannerAdd/bannerAdd.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
Page({

    data: {
        banner_id: "",
        banner_title: "",
        banner_type: true,
        fileUrl: "",
        isSaveBack: false,
        imageUrl: "",
        showImage: false,
        editOrAddFlag: false
    },
    bandleChange(e) {
        let bandle = e.detail.value;
        if (bandle === 'url') {
            this.setData({
                banner_type: true
            })
        } else if (bandle === 'file') {
            this.setData({
                banner_type: false
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
        if (e.id != null && e.id.length != 0) {
            console.log(e);
            this.setData({
                editOrAddFlag: true,
                banner_id: e.id
            })
            db.collection(databases.banner).doc(e.id).get().then(res => {
                this.setData({
                    banner_title: res.data.banner_title,
                    fileUrl: res.data.banner_url,
                    showImage: true
                })
            })
        }
    },
    onUnload: function () {
        if (!this.data.isSaveBack) {
            this.cancelLogic();
        }
    },
    titleChange(e) {
        this.setData({
            banner_title: e.detail.value
        })
    },
    urlChange(e) {
        this.setData({
            fileUrl: e.detail.value
        })
    },
    updateBannerData() {
        if (this.data.banner_title.length === 0 || this.data.fileUrl.length === 0) {
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            let bannerData = {
                banner_title: this.data.banner_title,
                banner_url: this.data.fileUrl
            }
            db.collection(databases.banner).doc(this.data.banner_id).update({
                data: bannerData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateTo({
                    url: '/pages/admins/home/adminHome',
                })
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

    saveBannerData() {
        if (this.data.banner_title.length === 0 || this.data.fileUrl.length === 0) {
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            let bannerData = {
                banner_title: this.data.banner_title,
                banner_url: this.data.fileUrl
            }
            db.collection(databases.banner).add({
                data: bannerData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateTo({
                    url: '/pages/admins/home/adminHome',
                })
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