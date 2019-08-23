const app = getApp();

function parse_url(url) {
    var match = url.match(/^(http|https|ftp)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i);
    var ret   = new Object();

    ret['protocol'] = '';
    ret['host']     = match[2];
    ret['port']     = '';
    ret['path']     = '';
    ret['query']    = '';
    ret['fragment'] = '';

    if(match[1]){
        ret['protocol'] = match[1];
    }

    if(match[3]){
        ret['port']     = match[3];
    }

    if(match[4]){
        ret['path']     = match[4];
    }

    if(match[5]){
        ret['query']    = match[5];
    }

    if(match[6]){
        ret['fragment'] = match[6];
    }

    return ret;
}

Page({
  data: {
  },
  onLoad(options) {
    let weburl = options.url ? decodeURIComponent(options.url) : "https://www.wework.cn";
    let urlObj = parse_url(weburl);
    let query = urlObj.query;
    if (app.globalData.userInfo.phoneNumber) {
      query ? query += "&" : "";
      query += "preset_user_phone=%2B" + app.globalData.userInfo.countryCode + app.globalData.userInfo.phoneNumber;
    }

    let url = "https://" + urlObj.host + urlObj.path + "?" + query;
    console.log(url);
    this.setData({"url": url});

  },
  onShareAppMessage: function (options) {
    return {
      title: 'WeWork 全球创造者社区，不仅是联合办公',
      path: '/pages/home/home?url=' + encodeURIComponent(options.webViewUrl)
    }
  }
});
