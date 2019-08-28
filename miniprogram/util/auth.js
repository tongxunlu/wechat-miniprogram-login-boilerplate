let auth = {
  // 设置用户数据
  updateLocalUserInfo: function (userInfo = {}) {
    // 去掉敏感信息 session_key
    if (Object.prototype.hasOwnProperty.call(userInfo, "session_key")) {
      delete userInfo.session_key;
    }
    try {
      wx.setStorageSync('userInfo', userInfo);
      if(userInfo.openid) {
        wx.setStorageSync('isValidSession', true);
      } else {
        wx.setStorageSync('isValidSession', false);
      }

      if(userInfo.nickName) {
        wx.setStorageSync('hasUserInfo', true);
      } else {
        wx.setStorageSync('hasUserInfo', false);
      }

      if(userInfo.phoneNumber) {
        wx.setStorageSync('hasPhoneNumber', true);
      } else {
        wx.setStorageSync('hasPhoneNumber', false);
      }
    } catch (e) { }
  },

  updateSessionWithLogin: async function () {
    let that = this;
    wx.login({
      success: async res => {
        console.log(res);
        try {
          await wx.cloud.callFunction({
            name: "update-session-with-login",
            data: {
              code: res.code
            }
          });
        } catch (e) {
          console.log(e);
        }
        await this.getUserInfo();
      }
    });
  },

  getUserInfo: async function () {
    let that = this;
    try {
      const resp = await wx.cloud.callFunction({
        name: "get-user-info"
      });
      const user = resp.result;
      if (user) {
        this.updateLocalUserInfo(user);
      } else {
        this.updateLocalUserInfo();
        // 强制更新并新增了用户
        this.updateSessionWithLogin();
      }

    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = auth;
