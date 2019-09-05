// eslint-disable-next-line no-unused-vars
import auth from '../../util/auth';

const app = getApp();

Page({
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    try {
      await app.updateGlobalData();
      this.setData({ ...app.globalData });
    } catch (e) {
      // Do something when catch error
    }
  },

  // 手动获取用户数据
  // 如果用户已经授权过，则不会再弹出授权窗口，直接获取到信息
  async bindGetUserInfo(e) {
    await auth.updateUserInfo(e, app.updateGlobalData);
  },

  // 获取用户手机号码
  async bindGetPhoneNumber(e) {
    await auth.updatePhoneNumber(e, app.updateGlobalData);
  },
});
