var app = getApp()
Component({
  properties: {
    title:{
      type:String,
      value:''
    }
    // lists: {
    //   type: Object,
    //   value: [],
    // }
  },
  lifetimes: {
    ready() {
      this.attached()
    }},
  data: {
    // 自定义导航栏
    screenHeight:0,
    statusBarHeight: 0, // 状态栏高度
    navbarHeight: 0, // 顶部导航栏高度
    navbarBtn: { // 胶囊位置信息
      height: 0,
      width: 0,
      top: 0,
      bottom: 0,
      right: 0
    },
    cusnavH: 0
  },
  methods: {
    attached: function () {
      let statusBarHeight = app.globalData.systeminfo.statusBarHeight // 状态栏高度
      let headerPosi = app.globalData.headerBtnPosi // 胶囊位置信息
      // console.log('statusBarHeight:'+JSON.stringify(statusBarHeight))
      // console.log(headerPosi)
      let btnPosi = { // 胶囊实际位置，坐标信息不是左上角原点
        height: headerPosi.height,
        width: headerPosi.width,
        top: headerPosi.top - statusBarHeight, // 胶囊top - 状态栏高度
        bottom: headerPosi.bottom - headerPosi.height - statusBarHeight, // 胶囊bottom - 胶囊height - 状态栏height （胶囊实际bottom 为距离导航栏底部的长度）
        right: app.globalData.systeminfo.screenWidth - headerPosi.right // 屏幕宽度 - 胶囊right
      }

      var cusnavH = btnPosi.height + btnPosi.top + btnPosi.bottom // 导航高度
      var searchW = app.globalData.systeminfo.screenWidth - headerPosi.width - btnPosi.right * 2 - 30
      // console.log(searchW, app.globalData.systeminfo.screenWidth, headerPosi.width)
      this.setData({
        statusBarHeight: statusBarHeight,
        navbarHeight: headerPosi.bottom + btnPosi.bottom, // 胶囊bottom + 胶囊实际bottom
        navbarBtn: btnPosi,
        cusnavH: cusnavH,
        searchW: searchW,
        screenHeight: app.globalData.systeminfo.screenHeight
      })
    },
  }
})