let auth = {
  //根据用户的openid获取数据库中相关的用户信息
  getUserInfo: async function(cb) {
    let that = this;
    try {
      const resp = await wx.cloud.callFunction({
        name: 'get-user-info',
      });
      const user = resp.result;
      if (user) {
        this.updateLocalUserInfo(user);
        typeof cb == 'function' && cb();
      } else {
        this.clearLocalStorage();
        // 强制更新并新增了用户
        this.updateSessionWithLogin();
      }

      return user;
    } catch (e) {
      console.log(e);
    }
  },

  // 保存从数据库中获得的用户信息到本地的local storage.
  updateLocalUserInfo: function(userInfo = {}) {
    // 去掉敏感信息 session_key
    if (Object.prototype.hasOwnProperty.call(userInfo, 'session_key')) {
      delete userInfo.session_key;
    }
    try {
      wx.setStorageSync('userInfo', userInfo);
      if (userInfo.openid) {
        wx.setStorageSync('isValidSession', true);
      } else {
        wx.setStorageSync('isValidSession', false);
      }

      if (userInfo.nickName) {
        wx.setStorageSync('hasUserInfo', true);
      } else {
        wx.setStorageSync('hasUserInfo', false);
      }

      if (userInfo.phoneNumber) {
        wx.setStorageSync('hasPhoneNumber', true);
      } else {
        wx.setStorageSync('hasPhoneNumber', false);
      }
    } catch (e) {}
  },
  //清空本地local storage里保存的信息
  clearLocalStorage: function() {
    try {
      wx.clearStorage();
    } catch (e) {}
  },
  //调用wx.login获取用户信息并保存到数据库中
  updateSessionWithLogin: async function(cb) {
    let that = this;
    wx.login({
      success: async res => {
        try {
          await wx.cloud.callFunction({
            name: 'update-session-with-login',
            data: {
              code: res.code,
            },
          });
        } catch (e) {
          console.log(e);
        }
        await this.getUserInfo(cb);
      },
    });
  },
  //更新已有用户的信息到数据库中
  updateUserInfo: async function(e, callback) {
    let that = this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮或者之前已经授权过
      const userInfo = e.detail.userInfo;
      wx.showLoading({
        title: '正在获取...',
      });
      const result = await wx.cloud.callFunction({
        name: 'update-user-info',
        data: {
          user: userInfo,
        },
      });

      if (result.result.code === 0) {
        await that.getUserInfo(callback);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: result.result.message,
          icon: 'none',
        });
      }

      wx.hideLoading();
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        },
      });
    }
  },

  updatePhoneNumber: async function(e, callback) {
    let that = this;
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      return;
    }
    wx.showLoading({
      title: '正在获取...',
    });

    try {
      let result = await wx.cloud.callFunction({
        name: 'update-user-encrypted-data',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
        },
      });

      if (result.result.code === 0) {
        await that.getUserInfo(callback);
      }

      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '获取手机号码失败，请重试',
        icon: 'none',
      });
    }
  },

  deleteUserInfo: async function(cb) {
    wx.showLoading({
      title: '正在删除...',
    });
    try {
      await wx.cloud.callFunction({
        name: 'delete-user-info',
      });
      this.clearLocalStorage();
      typeof cb == 'function' && cb();
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'none',
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: '删除失败',
        icon: 'none',
      });
    }
  },
};

module.exports = auth;
