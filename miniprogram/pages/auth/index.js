// eslint-disable-next-line no-unused-vars

const app = getApp();

Page({
  db: null, // db instance
  data: {
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    scope: "userInfo"
    // scope: "phoneNumber"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    this.db = wx.cloud.database();

    try {
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo && userInfo._openid) {
        // Do something with return value
      }
    } catch (e) {
      // Do something when catch error
    }
  },

  // 手动获取用户数据
  // 如果用户已经授权过，则不会再弹出授权窗口，直接获取到信息
  async bindGetUserInfo(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮或者之前已经授权过
      const userInfo = e.detail.userInfo;
      wx.showLoading({
        title: "正在获取"
      });
      const result = await wx.cloud.callFunction({
        name: "update-user-info",
        data: {
          user: userInfo
        }
      });
      wx.hideLoading();
      console.log(result);
      app.updateLocalUserInfo(userInfo);
      //TODO: 成功的逻辑
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: "警告",
        content: "您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!",
        showCancel: false,
        confirmText: "返回授权",
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log("用户点击了“返回授权”");
          }
        }
      });
    }
  },

  // 获取用户手机号码
  async bindGetPhoneNumber(e) {
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      return;
    }
    wx.showLoading({
      title: "正在获取"
    });

    try {
      // const data = this.data.userInfo;
      const result = await wx.cloud.callFunction({
        name: "user-login-register",
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv //,
          // user: {
          //   nickName: data.nickName,
          //   avatarUrl: data.avatarUrl,
          //   gender: data.gender
          // }
        }
      });
      console.log(result);

      if (!result.result.code && result.result.data) {
        app.setUserInfo(result.result.data);
      }

      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: "获取手机号码失败，请重试",
        icon: "none"
      });
    }
  },

  // 退出登录
  async bindLogout() {
    const userInfo = this.data.userInfo;

    await this.db
      .collection("users")
      .doc(userInfo._id)
      .update({
        data: {
          expireTime: 0
        }
      });

    app.setUserInfo();
  }
});
