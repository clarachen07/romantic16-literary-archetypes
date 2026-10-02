let pending;
function load(api) {
  if (pending) return pending;
  if (!api.loadFontFace) return Promise.resolve(false);
  const data = require('./font-data');
  pending = Promise.all(Object.keys(data).map(family => new Promise(resolve => {
    let ended = false;
    const finish = value => { if(ended)return;ended=true;clearTimeout(timer);resolve(value); };
    const timer = setTimeout(()=>finish(false),3500);
    api.loadFontFace({family, source:data[family], global:true, scopes:['webview','native'], success:()=>finish(true), fail:()=>finish(false)});
  }))).then(results=>results.every(Boolean));
  return pending;
}
module.exports = {load};
