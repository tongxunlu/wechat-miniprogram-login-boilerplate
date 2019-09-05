//app.js
import auth from './util/auth';

App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'wework-tgtk0',
        traceUser: true,
      });
    }

    this.globalData = {
      canIUse: wx.canIUse('button.open-type.getUserInfo'),
      userInfo: {},
      isValidSession: false,
      hasUserInfo: false,
      hasPhoneNumber: false,
    };

    wx.checkSession({
      success: async res => {
        // session_key 未过期，并且在本生命周期一直有效
        await auth.getUserInfo();
      },
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        auth.updateSessionWithLogin();
      },
    });
  },
  updateGlobalData: function() {
    this.globalData.userInfo = wx.getStorageSync('userInfo');
    this.globalData.isValidSession = wx.getStorageSync('isValidSession');
    this.globalData.hasUserInfo = wx.getStorageSync('hasUserInfo');
    this.globalData.hasPhoneNumber = wx.getStorageSync('hasPhoneNumber');
  },
});
