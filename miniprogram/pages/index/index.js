// eslint-disable-next-line no-unused-vars
import auth from '../../util/auth';

const app = getApp();

Page({
  data: {
    list: [
      {
        id: 'open-data',
        name: '使用open-data显示用户信息',
        open: false,
        pages: [],
      },
      {
        id: 'user-auth',
        name: '通过用户授权获取用户信息',
        open: false,
        pages: [],
      },
      {
        id: 'settings',
        name: '权限设置',
        open: false,
        pages: [],
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    app.logincallback = () => {
      let localData = app.getLocalUserData();
      that.setData({ ...localData });
    };
  },

  // 手动获取用户数据
  // 如果用户已经授权过，则不会再弹出授权窗口，直接获取到信息
  bindGetUserInfo(e) {
    let that = this;
    auth.updateUserInfo(e, () => {
      let localData = app.getLocalUserData();
      that.setData({ ...localData });
    });
  },

  // 获取用户手机号码
  bindGetPhoneNumber(e) {
    let that = this;
    auth.updatePhoneNumber(e, () => {
      let localData = app.getLocalUserData();
      that.setData({ ...localData });
    });
  },

  kindToggle(e) {
    var id = e.currentTarget.id,
      list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      list: list,
    });
  },

  onDeleteUser() {
    let that = this;
    auth.deleteUserInfo(() => {
      let localData = app.getLocalUserData();
      that.setData({ ...localData });
    });
  },
});
