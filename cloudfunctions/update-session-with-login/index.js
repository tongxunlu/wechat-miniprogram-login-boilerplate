const cloud = require("wx-server-sdk");
const { WXMINIUser } = require("wx-js-utils");

const secret = "fbe846dbad32cd4c47ac736efc7f5aee";

const duration = 24 * 3600 * 1000;

cloud.init();

// 云函数入口函数
exports.main = async event => {
  console.log(event);

  const {
    ENV,
    OPENID,
    APPID //wx70f790e831bd24f5
  } = cloud.getWXContext();
  // 更新默认配置，将默认访问环境设为当前云函数所在环境
  cloud.updateConfig({
    env: ENV
  });

  const db = cloud.database();

  const wXMINIUser = new WXMINIUser({
    appId: APPID,
    secret
  });

  const code = event.code; // 从小程序端的 wx.login 接口传过来的 code 值
  const info = await wXMINIUser.codeToSession(code);

  console.log("ENV:" + ENV);
  console.log("info.session_key:" + info.session_key);

  try {
    // 查询有没用户数据
    const user = await db
      .collection("users")
      .where({
        _openid: OPENID
      })
      .get();

    const expireTime = Date.now() + duration;

    // 如果有数据，则只是更新 `session_key`，如果没数据则添加该用户并插入 `sesison_key`
    if (user.data.length) {
      console.log("[update session]:" + JSON.stringify(user));
      await db
        .collection("users")
        .where({
          _openid: OPENID
        })
        .update({
          data: {
            session_key: info.session_key,
            expireTime: expireTime
          }
        });
    } else {
      console.log("[add new session]");
      await db.collection("users").add({
        data: {
          session_key: info.session_key,
          _openid: OPENID,
          expireTime: expireTime
        }
      });
    }
  } catch (e) {
    return {
      message: e.message,
      code: 1
    };
  }

  return {
    message: "login success",
    code: 0
  };
};
