// pages/admins/althetesAdd/althetesAdd.js
const db = wx.cloud.database();
const databases = require('../../../const/database');
const aes = require('../../../utils/aes_util')
Page({

    data: {
        althetes_id: "",
        althetes_name: "",
        althetes_password: "",
        althetes_high: "",
        althetes_weight: "",
        althetes_adept: "",
        althetes_desc: "",
        althetes_gender: "男",
        althetes_type: true,
        fileUrl: "",
        isSaveBack: false,
        imageUrl: "",
        showImage: false,
        editOrAddFlag: false,
        options: [], //数据集
        topsHeight: "30%", //高度
        opacity: "0.5", //透明度
        IsSingle: true, //是否单选
        select_class: ""
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
    genderChange(e){
        let gender = e.detail.value;
        this.setData({
            althetes_gender: gender
        })
    },
    validateNumber(val) {
        //正则表达式指定字符串只能为数字
        return val.replace(/\D/g, '')
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
                althetes_id: e.id
            })
            db.collection(databases.athletes_user).doc(e.id).get().then(res => {
                this.setData({
                    althetes_name: aes.AesDecrypt(aes.Base64Decode(res.data.althetes_name)),
                    althetes_password: aes.AesDecrypt(aes.Base64Decode(res.data.althetes_password)),
                    althetes_high: res.data.althetes_high,
                    althetes_weight: res.data.althetes_weight,
                    althetes_adept: res.data.althetes_adept,
                    althetes_desc: res.data.althetes_desc,
                    althetes_gender: res.data.althetes_gender,
                    fileUrl: res.data.althetes_url,
                    select_class: res.data.althetes_ofClass,
                    showImage: true
                })
            })
        }
    },
    initCollegeData() {
        db.collection(databases.classes).get().then(res => {
            let datas = []
            res.data.forEach(r => {
                datas.push({
                    "Text": r.class_name,
                    "Value": r._id
                })
            })
            this.setData({
                options: datas
            })
        })
    },
    SelectFinish: function (even) {
        let tmp = even.detail;
        tmp.forEach(t => {
            if (t.Selected) {
                this.setData({
                    select_class: t.Text
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
            althetes_name: e.target.id === "althetes_name" ? e.detail.value : this.data.althetes_name,
            althetes_password: e.target.id === "althetes_password" ? e.detail.value : this.data.althetes_password,
            althetes_high: e.target.id === "althetes_high" ? this.validateNumber(e.detail.value) : this.data.althetes_high,
            althetes_weight: e.target.id === "althetes_weight" ? this.validateNumber(e.detail.value) : this.data.althetes_weight,
            althetes_adept: e.target.id === "althetes_adept" ? e.detail.value : this.data.althetes_adept,
            althetes_desc: e.target.id === "althetes_desc" ? e.detail.value : this.data.althetes_desc,
            fileUrl: e.target.id === 'fileUrl' ? e.detail.value : this.data.fileUrl,
        })
    },
    updateAlthetesData() {
        if (this.data.althetes_name.length === 0 || this.data.fileUrl.length === 0) {
            
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            let althetesData = {
                althetes_name: aes.Base64Encode(aes.AesEncrypt(this.data.althetes_name)),
                althetes_password: this.data.althetes_password.length === 0 ? aes.Base64Encode(aes.AesEncrypt("12345678")) : aes.Base64Encode(aes.AesEncrypt(this.data.althetes_password)),
                althetes_high: this.data.althetes_high,
                althetes_weight: this.data.althetes_weight,
                althetes_adept: this.data.althetes_adept,
                althetes_desc: this.data.althetes_desc,
                althetes_url: this.data.fileUrl,
                althetes_gender: this.data.althetes_gender,
                althetes_ofClass: this.data.select_class
            }
            db.collection(databases.athletes_user).doc(this.data.althetes_id).update({
                data: althetesData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateBack()
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

    saveAlthetesData() {
        if (this.data.althetes_name.length === 0 || this.data.fileUrl.length === 0 || this.data.select_class.length === 0 || this.data.althetes_high.length === 0 || this.data.althetes_weight.length === 0 || this.data.althetes_adept.length === 0) {
            console.log(this.data.althetes_name, this.data.fileUrl, this.data.select_class,this.data.althetes_password,   this.data.althetes_high,this.data.althetes_weight,this.data.althetes_adept);
            wx.showToast({
                title: '请填入参数',
                icon: 'error',
                duration: 2000
            })
        } else {
            let althetesData = {
                althetes_name: aes.Base64Encode(aes.AesEncrypt(this.data.althetes_name)),
                althetes_password: this.data.althetes_password.length === 0 ? aes.Base64Encode(aes.AesEncrypt("12345678")) : aes.Base64Encode(aes.AesEncrypt(this.data.althetes_password)),
                althetes_high: this.data.althetes_high,
                althetes_weight: this.data.althetes_weight,
                althetes_adept: this.data.althetes_adept,
                althetes_desc: this.data.althetes_desc,
                althetes_url: this.data.fileUrl,
                althetes_gender: this.data.althetes_gender,
                althetes_ofClass: this.data.select_class
            }
            db.collection(databases.athletes_user).add({
                data: althetesData
            }).then(res => {
                wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 2000
                });
                this.setData({
                    isSaveBack: true
                })
                wx.navigateBack()
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