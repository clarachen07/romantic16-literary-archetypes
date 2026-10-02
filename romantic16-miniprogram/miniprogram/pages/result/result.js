const session = require('../../lib/session');
Page({
  data:{report:null,error:''},
  onShow() {
    try {
      this.state=session.read(wx);
      if(!this.state.started){wx.reLaunch({url:'/pages/index/index'});return;}
      if(session.current(this.state)){wx.redirectTo({url:'/pages/quiz/quiz'});return;}
      this.setData({report:session.report(this.state),error:''});
    }catch{this.setData({error:'这份画像暂时无法读取，请返回首页重新开始。'});}
  },
  poster(){wx.navigateTo({url:'/pages/poster/poster'});},
  edit(){session.back(this.state);session.save(wx,this.state);wx.redirectTo({url:'/pages/quiz/quiz'});},
  restart(){wx.showModal({title:'重新开始一份问卷？',content:'当前答案将被新问卷替换，已保存的海报不受影响。',confirmColor:'#823b58',success:res=>{if(res.confirm){session.save(wx,session.fresh(true));wx.redirectTo({url:'/pages/quiz/quiz'});}}});},
  home(){wx.reLaunch({url:'/pages/index/index'});},
  onShareAppMessage(){return {title:'你的故事，会是哪一种？· ROMANTIC16',path:'/pages/index/index',imageUrl:'/assets/portraits/free.jpg'};}
});
