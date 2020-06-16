var app=getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabBar:{
            type:Object,
            value:{}
        }

    },
   lifetimes: {
       ready() {
           // const query = wx.createSelectorQuery().in(this)
           // query.select('.tab-bar').boundingClientRect((rect) => {
           //     console.log(rect.height)
           //     // wx.setStorageSync('tabbberHeight', rect.height)
           // }).exec()
       },
       attached(){
       }

   },
    /**
     * 组件的初始数据
     */
    data: {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        goPageTabbar:function(e){
            app.goPageTabbar(e)
        },
    }
})