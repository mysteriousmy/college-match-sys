// pages/athletes/login/athletesLogin.js
const aes = require("../../../utils/aes_util")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        athletes_name: "",
        athletes_password: ""
    },
    onLoad: function(options) {
        let admin_Name = wx.getStorageSync('althetes_info');

        if(admin_Name !== null){
            wx.redirectTo({
                url: `/pages/athletes/home/athletesHome`,
            })
        }
    },
    inputedit: function(e) {
        this.setData({
            athletes_name: e.target.id === 'athletes_name' ? e.detail.value : this.data.athletes_name,
            athletes_password: e.target.id === 'athletes_password' ? e.detail.value : this.data.athletes_password,
        });
    },
    async doLogin(){
        if(this.data.athletes_name.length === 0 ||  this.data.athletes_password.length === 0){
            wx.showToast({
              title: '请输入数据',
              icon: 'error',
              duration: 2000
            });
        }
        console.log(aes.Base64Encode(aes.AesEncrypt(this.data.athletes_name)))
        console.log(aes.Base64Encode(aes.AesEncrypt(this.data.athletes_password)))
        let res = await wx.cloud.callFunction({
            name: 'athletesLogin',
            data:{
                athletes_name: this.data.athletes_name,
                athletes_password: this.data.athletes_password
            }
        })
        console.log(res);
        wx.showToast({
          title: res.result.msg,
          icon: res.result.code === 200 ? 'success' : 'error',
          duration: 1000
        })

        if(res.result.code === 200){
            wx.setStorageSync('althetes_info', res.result.data)
            wx.redirectTo({
                url: `/pages/athletes/home/athletesHome`,
            })
        }
    }
})