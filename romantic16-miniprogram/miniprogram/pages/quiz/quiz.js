const session = require('../../lib/session');
Page({
  data:{question:null,error:'',storageWarning:false,busy:false},
  onLoad() { this.state = session.read(wx); this.refresh(); },
  refresh(resetScroll = true) {
    try {
      if (!this.state.started) { wx.navigateBack({fail:()=>wx.reLaunch({url:'/pages/index/index'})}); return; }
      const question = session.publicQuestion(this.state);
      if (!question) { wx.redirectTo({url:'/pages/result/result'}); return; }
      this.setData({question,error:''},()=>{if(resetScroll)wx.pageScrollTo({scrollTop:0,duration:0});});
    } catch { this.setData({error:'这份答题记录暂时无法继续读取，可以返回首页重新开始。'}); }
  },
  choose(event) {
    if (this.data.busy) return;
    this.setData({busy:true});
    try {
      const raw = event.currentTarget.dataset.value;
      const value = this.data.question.kind === 'adaptive' ? raw : Number(raw);
      const completed = session.answer(this.state,value);
      const persisted = session.save(wx,this.state);
      this.setData({storageWarning:!persisted});
      this.refresh(completed);
    } catch { wx.showToast({title:'请重新选择这一题',icon:'none'}); }
    finally { this.setData({busy:false}); }
  },
  revise() { this.state.draft=null;session.save(wx,this.state);this.refresh(false); },
  back() { const hadDraft=Boolean(this.state.draft);session.back(this.state);session.save(wx,this.state);this.refresh(!hadDraft); },
  home() { wx.reLaunch({url:'/pages/index/index'}); }
});
