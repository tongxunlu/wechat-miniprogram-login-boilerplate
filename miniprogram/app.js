//app.js
App({

  // 检查用户是否登录态还没过期
  checkSession(expireTime = 0) {
    if (Date.now() > expireTime) {
      return false;
    }

    return true;
  },

  // 设置用户数据
  updateLocalUserInfo(userInfo = {}) {
    // 去掉敏感信息 session_key
    if (Object.prototype.hasOwnProperty.call(userInfo, "session_key")) {
      delete userInfo.session_key;
    }
    try {
      wx.setStorageSync('userinfo', userInfo);
      if(userInfo._openid) {
        wx.setStorageSync('isValidUser', false);
      } else {
        wx.setStorageSync('isValidUser', true);
      }
    } catch (e) { }
  },

  updateSessionWithLogin() {
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
      }
    });
  },

  onLaunch: function() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: "wework-tgtk0",
        traceUser: true
      });
    }

    this.globalData = {
      systemInfo: null,
      windowHeight: null, // rpx换算px后的窗口高度
      screenHeight: null // rpx换算px后的屏幕高度
    };

    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
        this.globalData.windowHeight =
          res.windowHeight / (res.windowWidth / 750);
        this.globalData.screenHeight =
          res.screenHeight / (res.screenWidth / 750);
      }
    });

    wx.checkSession({
      success: async (res) => {
        // session_key 未过期，并且在本生命周期一直有效
        // 数据里有用户，则直接获取
        try {
          const resp = await wx.cloud.callFunction({
            name: "get-user-info"
          });
          const user = resp.result;
          if (user && user.expireTime && this.checkSession(user.expireTime)) {
            this.updateLocalUserInfo(user);
          } else {
            this.updateLocalUserInfo();
            // 强制更新并新增了用户
            this.updateSessionWithLogin();
          }

        } catch (e) {
          console.log(e);
        }
      },
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        this.updateSessionWithLogin();
      }
    });

  }
});
