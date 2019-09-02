// eslint-disable-next-line no-unused-vars
import auth from "../../util/auth";

const app = getApp();

Page({
  data: {
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    isValidSession: false,
    hasUserInfo: false,
    hasPhoneNumber: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {

    try {
      this.updateData();
    } catch (e) {
      // Do something when catch error
    }
  },

  updateData() {
    var userInfo = wx.getStorageSync("userInfo");
    var isValidSession = wx.getStorageSync("isValidSession");
    var hasUserInfo = wx.getStorageSync("hasUserInfo");
    var hasPhoneNumber = wx.getStorageSync("hasPhoneNumber");
    this.setData({ userInfo, isValidSession, hasUserInfo, hasPhoneNumber });
  },

  // 手动获取用户数据
  // 如果用户已经授权过，则不会再弹出授权窗口，直接获取到信息
  async bindGetUserInfo(e) {
    await auth.updateUserInfo(e, this.updateData);
  },

  // 获取用户手机号码
  async bindGetPhoneNumber(e) {
    await auth.updatePhoneNumber(e, this.updateData);
  }
});
