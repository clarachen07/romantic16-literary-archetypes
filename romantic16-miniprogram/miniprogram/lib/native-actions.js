function invoke(api, method, options = {}) {
  return new Promise((resolve,reject) => {
    if(typeof api[method] !== 'function'){reject(Object.assign(new Error('请更新微信后再试'),{code:'UNSUPPORTED'}));return;}
    api[method]({...options,success:resolve,fail:reject});
  });
}
function localPath(path){if(typeof path!=='string'||!path||/^https?:/i.test(path))throw new Error('请先生成海报');}
async function saveToAlbum(api, path) {
  localPath(path);
  if(api.requirePrivacyAuthorize) await invoke(api,'requirePrivacyAuthorize');
  const setting = await invoke(api,'getSetting');
  if(setting.authSetting && setting.authSetting['scope.writePhotosAlbum'] === false) throw Object.assign(new Error('未获得相册写入权限'),{code:'ALBUM_PERMISSION'});
  try { return await invoke(api,'saveImageToPhotosAlbum',{filePath:path}); }
  catch(error){
    if(/auth deny|auth denied|authorize.*fail|permission denied/i.test(error.errMsg || '')) error.code='ALBUM_PERMISSION';
    throw error;
  }
}
function shareImage(api, path) {
  localPath(path);
  // Never report this callback as proof of delivery to a friend.
  return invoke(api,'showShareImageMenu',{path,needShowEntrance:false});
}
module.exports = {saveToAlbum, shareImage, invoke};
