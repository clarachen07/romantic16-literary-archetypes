const session = require('../../lib/session');
Page({
  data: {hasProgress:false, complete:false},
  onShow() {
    const state = session.read(wx);
    this.setData({hasProgress:state.started, complete:state.started && !session.current(state)});
  },
  begin() {
    const state = session.read(wx);
    if (state.started) { wx.navigateTo({url:this.data.complete?'/pages/result/result':'/pages/quiz/quiz'}); return; }
    session.save(wx, session.fresh(true));
    wx.navigateTo({url:'/pages/quiz/quiz'});
  },
  reset() {
    wx.showModal({title:'清除本机答题记录？',content:'已有答案与结果将从本机移除。已保存到相册的海报不会删除。',confirmText:'清除记录',confirmColor:'#823b58',success:result=>{if(result.confirm){session.clear(wx);this.onShow();}}});
  },
  onShareAppMessage() { return {title:'在故事里，遇见自己 · ROMANTIC16',path:'/pages/index/index',imageUrl:'/assets/portraits/free.jpg'}; }
});
