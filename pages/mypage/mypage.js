const db = wx.cloud.database();
const databases = require("../../const/database");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginOk: true,
    nickName: "",
    avatarUrl: "",
  },

  //页面加载的时候，将load页面传过来的值获取过来
  //   onLoad: function (options) {
  //     console.log("这里的options",options);
  //     this.setData({
  //       nickName:options.nickName,
  //       avatarUrl:options.avatarUrl
  //     })
  //   },

  //小程序声明周期的可见性函数里面来控制显示
  onShow() {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        loginOk: true,
        nickName: userInfo.nickName, //从缓存中拿数据
        avatarUrl: userInfo.avatarUrl,
      });
    } else {
      this.setData({
        loginOk: false,
      });
    }
  },
  //微信授权登录
  loadByWechat() {
    wx.getUserProfile({
      desc: "用户完善会员资料",
    })
      .then((res) => {
        //注意：此时不能使用 wx.switchTab，不支持参数传递
        this.setData({
          loginOk: true,
          nickName: res.userInfo.nickName, //从缓存中拿数据
          avatarUrl: res.userInfo.avatarUrl,
        });
        //保存用户登录信息到缓存

        //保存用户信息到数据库

        wx.login({
          success: (loginRes) => {
            let code = loginRes.code;
            wx.request({
              url: `https://api.weixin.qq.com/sns/jscode2session?appid=&secret=&js_code=${code}&grant_type=authorization_code`,
              success: (codeRes) => {
                this.saveUserCloudDatabase(codeRes.data.openid, res.userInfo);
              },
            });
          },
        });
      })
      .catch((err) => {
        console.log("用户拒绝了微信授权登录", err);
      });
  },
  toCommentPage() {
    wx.navigateTo({
      url: "/pages/myComments/myComments",
    });
  },
  toCollectPage() {
    wx.navigateTo({
      url: "/pages/myCollect/myCollect",
    });
  },
  saveUserCloudDatabase(openid, userInfo) {
    console.log(openid);
    db.collection(databases.normal_user)
      .where({
        _openid: openid,
      })
      .get()
      .then((res) => {
        if (res.data.length === 0) {
          db.collection(databases.normal_user)
            .add({
              data: userInfo,
            })
            .then((res) => {
              db.collection(databases.normal_user)
                .where({
                  _openid: openid,
                })
                .get()
                .then((res) => {
                  console.log(res.data);
                  userInfo._id = res.data[0]._id;
                  wx.setStorageSync("userInfo", userInfo);
                });
            });
        } else {
          db.collection(databases.normal_user)
            .where({
              _openid: openid,
            })
            .get()
            .then((res) => {
              console.log(res.data);
              userInfo._id = res.data[0]._id;
              wx.setStorageSync("userInfo", userInfo);
            });
        }
      });
  },
  //点击登录
  load() {
    this.loadByWechat();
  },
  about() {
    wx.showModal({
      content: "本程序由xx届xx班制作",
      showCancel: false,
    });
  },
  athletesLogin() {
    wx.navigateTo({
      url: "../athletes/login/athletesLogin",
    });
  },
  adminsLogin() {
    if (wx)
      wx.navigateTo({
        url: "../admins/login/adminLogin",
      });
  },
  //退出登录
  exit() {
    wx.showModal({
      content: "确定退出吗",
    }).then((res) => {
      if (res.confirm) {
        this.setData({
          loginOk: false,
        });
        //清空登录的缓存
        wx.setStorageSync("userInfo", null);
      } else if (res.cancel) {
        console.log("用户点击了取消");
      }
    });
  },
});
