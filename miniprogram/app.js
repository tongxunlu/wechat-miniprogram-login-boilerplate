//app.js
import auth from './util/auth';
import config from './util/config';

App({
  onLaunch: function() {
    let that = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: config.cloud_env,
        traceUser: true,
      });
    }

    this.globalData = {
      canIUse: wx.canIUse('button.open-type.getUserInfo'),
    };

    !this.globalData.isValidSession &&
      wx.checkSession({
        success: async res => {
          // session_key 未过期，并且在本生命周期一直有效
          await auth.getUserInfo(that.logincallback);
        },
        fail: async () => {
          // session_key 已经失效，需要重新执行登录流程
          await auth.updateSessionWithLogin(that.logincallback);
        },
      });
  },

  // logincallback: function() {
  //   console.log(
  //     'logincallback->' + JSON.stringify(wx.getStorageSync('userInfo')),
  //   );
  // },

  getLocalUserData: function() {
    let localData = {};
    try {
      localData.userInfo = wx.getStorageSync('userInfo');
      localData.isValidSession = wx.getStorageSync('isValidSession');
      localData.hasUserInfo = wx.getStorageSync('hasUserInfo');
      localData.hasPhoneNumber = wx.getStorageSync('hasPhoneNumber');
      this.globalData = { ...this.globalData, ...localData };
      return localData;
    } catch (e) {
      // Do something when catch error
    }
  },
});
