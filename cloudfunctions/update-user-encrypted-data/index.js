const cloud = require("wx-server-sdk");
const WXBizDataCrypt = require("./WXBizDataCrypt");

const duration = 24 * 3600 * 1000; // 开发侧控制登录态有效时间

cloud.init();

// 云函数入口函数
exports.main = async event => {
  const {
    ENV,
    OPENID,
    APPID
  } = cloud.getWXContext();
  // 更新默认配置，将默认访问环境设为当前云函数所在环境
  cloud.updateConfig({
    env: ENV
  });

  const db = cloud.database();
  const users = await db
    .collection("users")
    .where({
      _openid: OPENID
    })
    .get();

  if (!users.data.length) {
    return {
      message: "user not found",
      code: 1
    };
  }

  // 进行数据解密
  const user = users.data[0];
  const wxBizDataCrypt = new WXBizDataCrypt(APPID, user.session_key);
  const data = wxBizDataCrypt.decryptData(event.encryptedData, event.iv);

  const expireTime = Date.now() + duration;

  try {
    // 将用户数据和手机号码数据更新到该用户数据中
    const result = await db
      .collection("users")
      .where({
        _openid: OPENID
      })
      .update({
        data: {
          // ...event.user,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
          expireTime
        }
      });

    if (!result.stats.updated) {
      return {
        message: "update failure",
        code: 1
      };
    }

    user.phoneNumber = data.phoneNumber;
    user.countryCode = data.countryCode;
    user.expireTime = expireTime;
  } catch (e) {
    return {
      message: e.message,
      code: 1
    };
  }

  return {
    message: "success",
    code: 0,
    data: {
      ...user
    }
  };
};
