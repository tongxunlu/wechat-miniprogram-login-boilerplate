const cloud = require('wx-server-sdk');

cloud.init();

/**
input: event.user 传入的用户信息
*/
exports.main = async event => {
  const { ENV, OPENID, UNIONID, APPID } = cloud.getWXContext();
  // 更新默认配置，将默认访问环境设为当前云函数所在环境
  cloud.updateConfig({
    env: ENV,
  });

  const db = cloud.database();
  const users = await db
    .collection('users')
    .where({
      openid: OPENID,
    })
    .get();

  console.log('[INPUT: event.user] ' + JSON.stringify(event.user));

  if (!users.data.length) {
    return {
      message: 'user not found',
      code: 1,
    };
  }

  // 进行数据解密
  const user = users.data[0];

  try {
    const result = await db
      .collection('users')
      .where({
        openid: OPENID,
      })
      .update({
        data: {
          ...event.user,
        },
      });

    if (!result.stats.updated) {
      return {
        message: 'update failure',
        code: 1,
      };
    }
  } catch (e) {
    return {
      message: e.message,
      code: 1,
    };
  }

  return {
    message: 'success',
    code: 0,
    data: {
      ...event.user,
    },
  };
};
