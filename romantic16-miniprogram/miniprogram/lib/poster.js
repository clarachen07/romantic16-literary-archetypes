const {drawPoster,W,H} = require('./poster-draw');
const fonts = require('./fonts');
function loadImage(canvas, src) {
  return new Promise((resolve,reject)=>{
    const image=canvas.createImage();
    const timer=setTimeout(()=>{image.onload=image.onerror=null;reject(new Error('插画载入超时'));},10000);
    image.onload=()=>{clearTimeout(timer);resolve(image);};
    image.onerror=()=>{clearTimeout(timer);reject(new Error('插画未能载入'));};
    image.src=src;
  });
}
async function createPoster(api, canvas, report, page) {
  const expected={focused:1,dual:2,distributed:3,insufficient:0}[report.status];
  if(expected===undefined||report.profiles.length!==expected)throw new Error('画像信息不完整');
  const [loaded,qr,pictures]=await Promise.all([
    fonts.load(api),loadImage(canvas,'/assets/questionnaire-qr.png'),
    Promise.all((report.profiles.length?report.profiles:[{image:'/assets/portraits/free.jpg'}]).map(p=>loadImage(canvas,p.image)))
  ]);
  const font=loaded?{serif:'"Romantic Serif", serif',display:'Cormorant, Georgia, serif',sans:'sans-serif'}:{serif:'serif',display:'Georgia, serif',sans:'sans-serif'};
  drawPoster(canvas,{status:report.status,profiles:report.profiles,pictures,qr,font});
  // Canvas 2D is immediate mode; wait a frame before the native PNG export.
  await new Promise(resolve=>canvas.requestAnimationFrame(resolve));
  return new Promise((resolve,reject)=>api.canvasToTempFilePath({canvas,x:0,y:0,width:W,height:H,destWidth:W,destHeight:H,fileType:'png',success:r=>resolve(r.tempFilePath),fail:reject},page));
}
module.exports={createPoster};
