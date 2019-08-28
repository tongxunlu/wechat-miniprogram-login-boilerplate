const cloud = require("wx-server-sdk");
const WXBizDataCrypt = require("./WXBizDataCrypt");

cloud.init();

/**
input: event.encryptedData, event.iv 传入的加密用户信息
*/
exports.main = async event => {
  const { ENV, OPENID, UNIONID, APPID } = cloud.getWXContext();
  // 更新默认配置，将默认访问环境设为当前云函数所在环境
  cloud.updateConfig({
    env: ENV
  });

  const db = cloud.database();
  const users = await db
    .collection("users")
    .where({
      openid: OPENID
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

  console.log("[decryptData] " + JSON.stringify(data));

  try {
    // 将用户数据和手机号码数据更新到该用户数据中
    const result = await db
      .collection("users")
      .where({
        openid: OPENID
      })
      .update({
        data: {
          // phoneNumber: data.phoneNumber,
          // countryCode: data.countryCode,
          ...data
        }
      });

    if (!result.stats.updated) {
      return {
        message: "update failure",
        code: 1
      };
    }
  } catch (e) {
    return {
      message: e.message,
      code: 1
    };
  }

  return {
    message: "success",
    code: 0
  };
};
