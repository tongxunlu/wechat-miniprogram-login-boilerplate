//app.js
import auth from "./util/auth";

App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
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
      success: async res => {
        // session_key 未过期，并且在本生命周期一直有效
        await auth.getUserInfo();
      },
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        auth.updateSessionWithLogin();
      }
    });
  }
});
