const session=require('../../lib/session');
const {createPoster}=require('../../lib/poster');
const {saveToAlbum,shareImage}=require('../../lib/native-actions');
Page({
  data:{posterPath:'',generating:true,error:'',message:'',action:'',showPrivacy:false,privacyName:'小程序隐私保护指引'},
  onLoad(){
    this.alive=true;
    this.privacyHandler=resolve=>{this.privacyResolve=resolve;this.setData({showPrivacy:true});};
    if(wx.onNeedPrivacyAuthorization)wx.onNeedPrivacyAuthorization(this.privacyHandler);
    if(wx.getPrivacySetting)wx.getPrivacySetting({success:r=>{if(this.alive&&r.privacyContractName)this.setData({privacyName:r.privacyContractName});}});
  },
  onReady(){this.generate();},
  onUnload(){
    this.alive=false;
    if(this.privacyResolve){this.privacyResolve({event:'disagree'});this.privacyResolve=null;}
    if(wx.offNeedPrivacyAuthorization)wx.offNeedPrivacyAuthorization(this.privacyHandler);
  },
  async generate(){
    if(this.working)return;
    this.working=true;
    this.setData({generating:true,error:'',message:'',posterPath:''});
    try{
      const state=session.read(wx);
      if(!state.started||session.current(state))throw new Error('请先完成问卷，再生成画像海报。');
      const report=session.report(state);
      const canvas=await new Promise((resolve,reject)=>wx.createSelectorQuery().in(this).select('#poster-canvas').fields({node:true,size:true}).exec(result=>result[0]&&result[0].node?resolve(result[0].node):reject(new Error('无法打开绘图画布，请更新微信后重试。'))));
      const posterPath=await createPoster(wx,canvas,report,this);
      if(this.alive)this.setData({posterPath});
    }catch(error){if(this.alive)this.setData({error:error.message||'海报未能生成，请重试。'});}
    finally{this.working=false;if(this.alive)this.setData({generating:false});}
  },
  async save(){
    if(this.data.action||!this.data.posterPath)return;
    this.setData({action:'save',message:''});
    try{
      await saveToAlbum(wx,this.data.posterPath);
      if(this.alive){this.setData({message:'海报已保存到手机相册。'});wx.showToast({title:'已保存到相册',icon:'success'});}
    }catch(error){
      if(!this.alive)return;
      if(error.code==='ALBUM_PERMISSION'){
        this.setData({message:'未获得相册写入权限，海报尚未保存。'});
        wx.showModal({title:'允许保存到相册',content:'请在小程序设置中允许“保存到相册”，然后再次点击保存。',confirmText:'打开设置',confirmColor:'#823b58',success:r=>{if(r.confirm&&this.alive)wx.openSetting({fail:()=>wx.showToast({title:'请在微信设置中开启相册权限',icon:'none'})});}});
      }else this.setData({message:/privacy|cancel|disagree/i.test(error.errMsg||'')?'你尚未同意授权，海报未保存。':'未能保存到相册。请确认系统已允许微信访问相册，然后重试。'});
    }finally{if(this.alive)this.setData({action:''});}
  },
  async share(){
    if(this.data.action||!this.data.posterPath)return;
    this.setData({action:'share',message:''});
    try{await shareImage(wx,this.data.posterPath);if(this.alive)this.setData({message:'请在微信图片分享面板中选择好友。'});}
    catch(error){if(this.alive)this.setData({message:/cancel/i.test(error.errMsg||'')?'已取消分享，海报仍可保存。':error.code==='UNSUPPORTED'?'当前微信版本不支持图片分享，请更新微信；也可先保存到相册。':'微信图片分享未能打开。请重试，或保存到相册后发送。'});}
    finally{if(this.alive)this.setData({action:''});}
  },
  preview(){if(this.data.posterPath)wx.previewImage({current:this.data.posterPath,urls:[this.data.posterPath]});},
  agreePrivacy(){const resolve=this.privacyResolve;this.privacyResolve=null;this.setData({showPrivacy:false});if(resolve)resolve({event:'agree',buttonId:'agree-privacy'});},
  declinePrivacy(){const resolve=this.privacyResolve;this.privacyResolve=null;this.setData({showPrivacy:false});if(resolve)resolve({event:'disagree'});},
  openPrivacy(){if(wx.openPrivacyContract)wx.openPrivacyContract({fail:()=>wx.showToast({title:'请先在小程序后台配置隐私指引',icon:'none'})});},
  stopTouch(){},
  onShareAppMessage(){return {title:'你的故事，会是哪一种？· ROMANTIC16',path:'/pages/index/index',imageUrl:'/assets/portraits/free.jpg'};}
});
