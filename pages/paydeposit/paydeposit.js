// pages/paydeposit/paydeposit.js
const md5 = require('../../utils/md5.js')
const util = require('../../utils/util.js')
var qqMap = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk ;
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status:1,//1：填写信息，2：地区选择，3：选择经销商

    area3:0,

    dialogYn:false, //弹窗弹起否
    dialogYn2:false, //弹窗2弹起否

    arrowIcon:'',//箭头icon

    closeIcon:'',
    addressIcon:'',//icon
    phoneIcon:'',//icon
    chooseStoreIcon:'',//icon




    // 定位的几个数据
    isLocal: true,
    longitude: '',
    latitude: '',
    province: '',
    city: '',

    areastatus:1,//1：省份，2：城市，3：区县
    area:'',//省份、城市的树形列表
    area1:0,//省份---index
    area2:0,//城市---index
    area3name:null,
    seller:null,//最后一步选门店的index
    sellername:"",//最后一步选门店的name
    sellerlist:"",//门店列表

    //控制连点
    isCanClick:true,

    //是否拒绝授权
    isshouquan: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 上线--地图获取城市 -s
    qqmapsdk = new qqMap({
      key:app.globalData.localkey
    });

    this.setData({
      area:app.globalData.area,
    });

    var _this = this;
    //获取地区
    if(app.globalData.area == ""){
      wx.request({
        url: app.globalData.rerequesturl+'/api.php',
        data: {
          a: 'getArea'},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          app.globalData.area= res.data.data.area;
          wx.setStorageSync('area', res.data.data.area);
          _this.setData({
            area:app.globalData.area,
          })
        }
      })
    }
  },
  // 确定用户已授权可获得地理位置信息
  getLocal(){
    let that = this;
    wx.getSetting({
      success: (res)=>{
        console.log(1)
        if (!res.authSetting['scope.userLocation']){//先查询一下用户是否授权了 "scope.userLocation" 这个 scope,没有则进入
          console.log(2)
          wx.authorize({
            scope: 'scope.userLocation',//提前向用户发起授权请求。调用后会立刻弹窗询问用户是否同意授权====如果用户之前已经同意授权，这里则不会出现弹窗，
            success: (res)=>{
              console.log(3)
              that.showLocal();
              that.setData({
                isLocal: true
              })
            },
            fail: (err)=>{
              that.setData({
                isLocal: false,
                isshouquan:false
              });
              setTimeout(function () {
                that.dialogChange()
              }, 200)
            }
          })
        }else{//已授权过
          that.showLocal();
        }
      }
    })
  },
//获得当前用户的经度和维度
  showLocal(){
    console.log(4)
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {//获取当前的地理位置,经维度
        console.log(5)
        let latitude = res.latitude//维度
        let longitude = res.longitude//经度
        that.setData({
          latitude,
          longitude
        })
        that.getMapCity(latitude, longitude)
      }
    })

  },
  handleSetting(){
    var that = this;
    wx.getSetting({
      success: (res)=>{
        if (!res.authSetting['scope.userLocation']){
          console.log(11)
          wx.showModal({
            title: '提示',
            content: '不授权将无法获得位置',
            showCancel: false
          })
          that.setData({
            isLocal: false,
          })
        }else{
          console.log(22)
          wx.showModal({
            title: '提示',
            content: '位置授权成功',
            showCancel: false
          })
          that.setData({
            isLocal: true,
          })
        }
      }
    })
  },
  //用经纬度去腾讯地图获取用户所在的城市、省份
  getMapCity(latitude, longitude){
    console.log(6)
    var that = this;
    qqmapsdk.reverseGeocoder({//判断经纬度是在哪个城市
      location: {
        latitude: latitude,
        longitude: longitude
      },
      sig:app.globalData.sig,
      success: function(res){
        console.log(7)
        console.log(res)
        let province = res.result.ad_info.province;
        let city = res.result.ad_info.city;
        that.setData({
          province,
          city
        })
        console.log('省份：'+province)
        console.log('城市：'+city)
        that.getCityNow(province,city)
      },
      fail: function(err){
        console.log('7失败')
        console.log(err)
        util.showToast('获取失败！')
      },
      complete:function(res) {
        console.log('7完成')
      }
    })
  },
  //获取省份、城市后---根据城市名来给用户看当前的城市列表
  getCityNow(pro,ct){
    console.log(8+'pro:'+pro+'ct:'+ct)
    let province=pro?pro:''
    let city=ct?ct:''
    let proList=[...this.data.area]
    let get=false
    proList.forEach((item,index)=>{
      if(item.name==province){
        console.log(9)
        item.children.forEach((item2,index2)=>{
          if(item2.name==city){
            console.log(10)
            this.setData(
                {
                  area1:index,
                  area2:index2,
                }
            )
            let e={
              currentTarget:{
                dataset:{
                  index:index2
                }
              }
            }
            get=true
            this.areato2(e)
            console.log(11)
            this.setData({
              dialogYn: true
            })
          }
        })
      }
    })
    if(!get){
      let that=this
      console.log('无法定位')
      util.showToast('无法定位您的城市,请手动选择！');
      setTimeout(function () {
        that.setData({
          isLocal: false,
          isshouquan:false
        });
        that.dialogChange()//0511让用户拿到城市失败也能弹窗
      }, 2000)
    }
  },
  // 点击确认门店的按钮
  btnsubmit: function () {
    var _this = this;
    if(!_this.data.isCanClick){
      return false;
    }

    if(!_this.data.name){
      _this.showmessage("请输入姓名");return false;
    }
    if(!_this.data.sexindex){
      _this.showmessage("请选择性别");return false;
    }
    if(!_this.data.cardid || !(/(^\d{4}$)|(^\d{3}(\d|X|x)$)/.test(_this.data.cardid))){
      _this.showmessage("请输入正确身份证后四位");return false;
    }
    if(!_this.data.phone || !(/^1[123456789]\d{9}$/.test(_this.data.phone))){
      _this.showmessage("请输入正确联系电话");return false;
    }
    if(!_this.data.sellerlist[_this.data.seller]){
      _this.showmessage("请选择经销商");return false;
    }

    _this.setData({
      isCanClick:false
    });
    var nonce = util.random(16);
    var key=app.globalData.key;
    var timestamp = Date.parse(new Date())/1000;
    var stringA="nonce="+nonce+"&timestamp="+timestamp;
    var stringSignTemp=stringA+key;
    var sign=md5.hexMD5(stringSignTemp).toUpperCase();

    util.myrequest({
      url:app.globalData.rerequesturl+'/api.php?a=getPayParams&'+stringA+'&sign='+sign,
      method:"post",
      data: {
        unionId:app.globalData.userInfo.unionId,
        openid:app.globalData.userInfo.openId,
        modelId:app.globalData.modelList[app.globalData.carselect].id,
        name:_this.data.name,
        sex:_this.data.sexindex,
        phone:_this.data.phone,
        idCard:_this.data.cardid,
        dealerId:_this.data.sellerlist[_this.data.seller].id,
        price:app.globalData.modelList[app.globalData.carselect].price
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      }
    }).then((res) => {
      if(res.data.status == 1){
        var data = res.data.data.payInfo;
        var no = res.data.data.no;
        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: data.signType,
          paySign: data.paySign,
          success (res) {
            var nonce = util.random(16);
            var key=app.globalData.key;
            var timestamp = Date.parse(new Date())/1000;
            var stringA="nonce="+nonce+"&orderNo="+no+"&timestamp="+timestamp;
            var stringSignTemp=stringA+key;
            var sign=md5.hexMD5(stringSignTemp).toUpperCase();
            util.myrequest({
              url:app.globalData.rerequesturl+'/api.php',
              data: {
                a: 'successPay',
                nonce: nonce,
                timestamp:timestamp,
                orderNo:no,
                sign:sign,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
            }).then((res) => {
              console.log(res.data.data)
              if(res.data.status == 0){
                _this.showmessage(res.data.message);return false;
              }else{
                wx.navigateTo({
                  url: '/pages/completepay/completepay?num='+res.data.data.rank
                })
              }
              _this.setData({
                isCanClick:true
              });
            });
          },
          fail (res) {
            wx.navigateTo({
              url: '/pages/myorder/myorder'
            });
          }
        })
      }else if(res.data.status == 2){
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000,
          success:function(){
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/myorder/myorder'
              });
              _this.setData({
                isCanClick:true
              });
            }, 2000)
          },
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000,
          success:function(){
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/myorder/myorder'
              });
              _this.setData({
                isCanClick:true
              });
            }, 2000)
          },
        });
        _this.setData({
          isCanClick:true
        });
      }

    });

  },
  showmessage:function(message){
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    })
  },
  openPicker:function(e){//自定义pickder打开
    this.setData({
      dialogYn2:true,
      sexindex:[0]
    })
  },
  pickerClose:function(e){//自定义pickder关掉-没点确定的
    this.setData({
      sexindex:null,
      dialogYn2:false,
    })
  },
  sureSexIndex:function(e){//自定义pickder关掉--确定picker的值---一直同步它的值，这时候直接关
    // let num=this.data.sexindex[0];
    this.setData({
      dialogYn2:false
    })
  },
  setPartToSheng:function(e){//重新选择省份
    this.setData({
      status: 2
    })
  },
  setPartToCity:function(e){//重新选择城市
    this.data.status=3;
    this.setData({
      status: 3
    })
  },

  areato1: function (e) {//省份列表按钮点击
    // console.log('areato1:'+JSON.stringify(e.currentTarget));
    this.setData({
      area1: e.currentTarget.dataset.index,
      status: 3
    })
  },
  areato2: function (e) {//城市列表按钮点击
    this.setData({
      area2: e.currentTarget.dataset.index,
    })
    var area1 = app.globalData.area[this.data.area1].id;
    var area2 = this.data.area2 == -1 ? 0 : app.globalData.area[this.data.area1].children[this.data.area2].id;
    app.getDealer(area1,area2).then((res) => {
      this.setData({
        sellerlist:app.globalData.dealerList,
      })
      // 获取为空显示1-s
      if(this.data.sellerlist.length==0){
        this.setData({
          status:1
        })
      }else{
        this.setData({
          status:4
        })
      }
      // 获取为空显示1-e
    });
  },
  sellerClick: function (e) {//最后确认门店之前选门店
    this.setData({
      seller: e.currentTarget.dataset.index,
      sellername: this.data.sellerlist[e.currentTarget.dataset.index].name
    })
  },
  sureStore:function(e){//最后选完门店后关闭弹窗
    this.setData({
      dialogYn: false
    })
  },
  dialogChange: function () {//弹起弹窗
    this.setData({
      dialogYn: true
    })
  },
  dialogChange2: function () {//关闭弹窗
    this.setData({
      dialogYn: false,
      seller:null,
      sellername:''
    })
  },

  isagreechange:function(e) {
    if (e.detail.value == '') {
      this.setData({
        isagree:false
      })
    } else {
      this.setData({
        isagree:true
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.shareAppMessage()
  }
})
