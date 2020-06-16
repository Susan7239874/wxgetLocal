const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [year].map(formatNumber)+'年'+  [month].map(formatNumber)+'月'+[day].map(formatNumber)+'日'
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const charts = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const random = n => {
  var res = '';
  for(var i = 0; i <n; i++){
    var id = Math.ceil(Math.random()*35);
    res += charts[id];
  }
  return res;
}

function myrequest(options) {
  return new Promise((resolve, reject) => {
    // 逻辑：发送请求到服务器
    wx.request({
      url: options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: options.header || {},
      success: res => {
        resolve(res);
      },
      fail: err => {
        reject(err);
      }
    });
  });
}

/*信息提示 */
function showToast(title = "未知错误，请重试！", icon = "none", duration = 2000) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration,
    mask: true
  });
}
/*加载提示 */
function showLoading(title = "正在加载") {
  wx.showLoading({
    title: title,
    mask: true
  });
}
Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
          ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return format;
}
// 2019-12-19T11:30:53.000+0000格式转换为2019-12-19 19:30
function getTimeHistory(datatime){
  datatime = datatime.replace(/-/g, '/');
  var date = new Date(datatime);
  // let date_value=date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日' + date.format('hh:mm');//hh:mm这样0分也是显示12:00而不是12:0
  let date_value=date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
  return date_value;
}
function getTimeHistory2(datatime){
  var date = new Date(datatime);
  let date_value=date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日' + date.format('hh:mm');//hh:mm这样0分也是显示12:00而不是12:0
  return date_value;
}
// 2020-06-05 10:30:17 改成2020-06-05 10:30
function getTimeHistory3(datatime){
  datatime = datatime.replace(/-/g, '/');
  var date = new Date(datatime);
  let date_value=date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'+date.format('hh:mm');
  return date_value;
}




function getTimeExpire(datatime){
  var date = new Date(datatime);
  let date_value=date.format('hh:mm:ss');
  return date_value;
}
var wxTimer = function (initObj){
  initObj = initObj || {};
  this.beginTime = initObj.beginTime || "00:00:00";	//开始时间
  this.interval = initObj.interval || 0;				//间隔时间
  this.complete = initObj.complete;					//结束任务
  this.intervalFn = initObj.intervalFn;				//间隔任务
  this.name = initObj.name;							//当前计时器在计时器数组对象中的名字

  this.intervarID;									//计时ID
  this.endTime;										//结束时间
  this.endSystemTime;									//结束的系统时间
}

wxTimer.prototype = {
  //开始
  start:function(self){
    this.endTime = new Date("1970/01/01 "+this.beginTime).getTime();//1970年1月1日的00：00：00的字符串日期
    this.endSystemTime = new Date(Date.now() + this.endTime);
    var that = this;
    //开始倒计时
    var count = 0;//这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
    function begin(){
      var tmpTime = new Date(that.endTime - 1000 * count++);
      //把2011年1月1日日 00：00：00换成数字型，这样就可以直接1s，1s的减，就变成了倒计时，为了看的更明确，又用new date把字符串换回来了
      var tmpTimeStr = tmpTime.toString().substr(16,8);//去掉前面的年月日就剩时分秒了
      var wxTimerSecond = (tmpTime.getTime() - new Date("1970/01/01 00:00:00").getTime()) / 1000;
      var wxTimerList = self.data.wxTimerList;

      //更新计时器数组
      wxTimerList[that.name] = {
        wxTimer:tmpTimeStr,
        wxTimerSecond:wxTimerSecond,
      }

      self.setData({
        wxTimer:tmpTimeStr,
        wxTimerSecond:wxTimerSecond,
        wxTimerList:wxTimerList
      });
      //时间间隔执行函数
      if( 0 == (count-1) % that.interval && that.intervalFn){
        that.intervalFn();
      }
      //结束执行函数
      if(wxTimerSecond <= 0){
        if(that.complete){
          that.complete();
        }
        that.stop();
      }
    }
    begin();
    this.intervarID = setInterval(begin,1000);
  },
  //结束
  stop:function(){
    clearInterval(this.intervarID);
  },
  //校准
  calibration:function(){
    this.endTime = this.endSystemTime - Date.now();
  }
}


module.exports = {
  formatTime: formatTime,
  random:random,
  myrequest:myrequest,
  showToast:showToast,
  showLoading:showLoading,
  getTimeHistory:getTimeHistory,
  getTimeHistory2:getTimeHistory2,
  getTimeHistory3:getTimeHistory3,
  getTimeExpires:getTimeExpire,
  wxTimer:wxTimer
}
