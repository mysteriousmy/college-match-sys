const database = require("../../../const/database");

// pages/athletes/login/athletesLogin.js
const db = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        admin_name: "",
        admin_password: ""
    },
    inputedit: function(e) {
        this.setData({
            admin_name: e.target.id === 'admin_name' ? e.detail.value : this.data.admin_name,
            admin_password: e.target.id === 'admin_password' ? e.detail.value : this.data.admin_password,
        });
    },
    // test(){
    //     db.collection(database.admin_user).add({
    //         data: {
    //             admin_name: "QTE5NTU4MENENUQxOEM5NzdFQkE4MEVGRkU5MUEzMjU=",
    //             admin_password: "MDU0NDUxQkM0OEFENDNBQUJERTIxMEJEMjRBNzBBMUM="
    //         }
    //     })
    // },
    onLoad: function(options) {
        let admin_Name = wx.getStorageSync('admin_info');
        if(admin_Name.length !== 0){
            wx.redirectTo({
                url: `/pages/admins/home/adminHome`,
            })
        }
    },
    async doLogin(){
        if(this.data.admin_name.length === 0 ||  this.data.admin_password.length === 0){
            wx.showToast({
              title: '请输入数据',
              icon: 'error',
              duration: 2000
            });
        }else{
            let res = await wx.cloud.callFunction({
                name: 'adminsLogin',
                data:{
                    admin_name: this.data.admin_name,
                    admin_password: this.data.admin_password
                }
            })
            console.log(res);
            wx.showToast({
              title: res.result.msg,
              icon: res.result.code === 200 ? 'success' : 'error',
              duration: 1000
            })
            
            if(res.result.code === 200){
                wx.setStorageSync('admin_info', this.data.admin_name);
                wx.redirectTo({
                  url: `/pages/admins/home/adminHome`,
                })
            }
        }
       

    }
})