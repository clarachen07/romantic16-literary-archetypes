# ROMANTIC16 · 文学原型探索

[English](README.md) · [简体中文](README.zh-CN.md)

ROMANTIC16 是一个受法国浪漫主义文学启发的文学原型探索项目，将简短的自适应问卷、16 种插画人物画像和结果分享海报结合起来，提供静态网站与原生微信小程序。

**[体验在线问卷](https://romantic16.netlify.app/)**

![ROMANTIC16 文学原型总览](output/posters/romantic16-4x4-poster-v3.png)

## 主要功能

- 15 道行为风格陈述、8 道“最像／最不像”情境题、2–4 道自适应追问，完整作答共 25–27 题。
- 支持倾向集中、双原型、倾向分散、信息不足四种结果。
- 16 种文学原型，包含插画、核心动机、人物故事与反思提示。
- 本机进度恢复、返回修改、重新开始与主动清除记录。
- 本地生成结果海报；小程序接入原生图片分享与保存相册。
- 随附可离线观看的课堂演示、逐页讲稿和原型总览海报。

产品界面、问卷、人物介绍及课堂内容保留中文；仓库文件名、开发文档和元信息使用英文，首页 README 提供中英两版。

## 本地运行

网站采用浏览器原生模块，静态资源已随仓库提供，无需安装 npm 依赖或执行构建。

```sh
git clone https://github.com/clarachen07/romantic16-literary-archetypes.git
cd romantic16-literary-archetypes
python3 -m http.server 4173 --directory romantic16-site/dist
```

打开 [localhost:4173](http://localhost:4173/)。请通过 HTTP 服务访问，不要直接双击网站的 `index.html`。

微信小程序：在微信开发者工具中导入 `romantic16-miniprogram/`，配置自己的 AppID。详见[小程序指南](romantic16-miniprogram/README.md)。

课堂材料：可直接用浏览器打开[互动演示](output/slides/romantic16-classroom.html)或[逐页讲稿](output/slides/romantic16-speaker-notes.html)。内嵌资源支持离线观看，外部参考链接和在线问卷需要网络。

## 仓库结构

| 路径 | 内容 |
| --- | --- |
| `romantic16-site/` | 静态网站、资源、维护脚本与浏览器检查 |
| `romantic16-miniprogram/` | 原生微信小程序、适配脚本与本地检查 |
| `questionnaire-engine/` | 参考评分引擎、原始中文题库与工程检查 |
| `docs/questionnaire-design.md` | 英文问卷设计说明与验证计划 |
| `output/slides/` | 课堂演示、讲稿与源文件 |
| `output/posters/` | 原型总览海报与生成提示词 |

## 验证

使用 Node.js 24 或更新版本运行现有检查，无需安装 npm 依赖。

```sh
node questionnaire-engine/test_engine.mjs
node romantic16-site/tests/package-integrity.mjs
npm --prefix romantic16-miniprogram test
```

检查覆盖评分行为、模拟作答路线、网站资源完整性、小程序内容一致性、进度恢复，以及模拟的原生分享和权限流程。网站另有浏览器检查，需要本地服务与 Chrome 调试会话，详见[网站指南](romantic16-site/README.md)。

## 设计与隐私

文学原型描述相对优先的动机，五个独立的连续风格线索描述表达方式；风格线索不参与原型排名。详见[设计说明](docs/questionnaire-design.md)与[引擎接入指南](questionnaire-engine/README.md)。

答案和结果海报均在本地处理，不要求注册账号，不上传答题记录。分享由用户主动发起，分享后的海报包含其展示的结果。答题进度保存在设备上，可从界面主动清除。

**这是原创、尚未验证的探索原型。** 工程检查不能证明心理测量效度。结果不是心理诊断、人格概率，也不能作为招聘或关系决策依据。3–5 分钟是设计目标，并非实测完成时间。

小程序尚未配置 AppID。本地检查不能证明已通过微信编译、真机兼容性验证、审核或正式发布。

## 资源与维护

随附 Cormorant Garamond 和 Noto Serif SC 字体及其 SIL Open Font License 声明；重新分发字体资源时应保留许可文件。项目尚未指定整体软件许可证。

ZIP 导出包、本机部署凭据、微信私有配置及缓存不纳入版本控制。网站服务目录为 `romantic16-site/dist/`；现有 Netlify 配置以 `romantic16-site/` 为基准发布该目录。
