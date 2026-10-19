# BlueTrace — 项目与网站制作规范

> **Reference audit updated: 2026-07-23**
>
> 每次让 Codex、Claude 或其他 AI 修改网站前，必须先完整阅读本文件。  
> 三位成员都以本文件为共同标准。若改变项目逻辑、配色、字体或交互规则，应先更新本文件，再修改代码。

## 一、项目是什么

BlueTrace 是一个以潜水者视角展开的沉浸式海洋教育网站。用户进入一片已经退化的海：水体浑浊、珊瑚白化、微塑料漂浮。用户先观察问题，再理解水质因素，最后练习真正负责任的潜水行为，并获得一份属于自己的 Responsible Diver Passport。

网站不是单纯的多结局剧情，也不是复杂的科研平台，而是一段可以参与的互动式学习旅程。

**一句话定义：**

> BlueTrace is a cinematic interactive ocean journey where users observe a damaged reef, understand the hidden factors behind it, and learn how to dive without leaving harm behind.

**核心概念：**

- 向上滑动或向下滚动 = 继续下潜并进入下一幕。
- 深度 = 用户的学习进度，而不是普通网页的百分比。
- 用户不是通过“拯救按钮”瞬间修复海洋，而是通过改变自己的行为，降低对海洋的干扰。
- 画面逐渐变清澈代表用户理解和行为的改善，是教育性的视觉反馈，不代表真实生态能瞬间恢复。

**核心主题：**

> 改变的不是海，而是潜水者自己——当人学会不再伤害它，海才有恢复的机会。

**产品形式：**

- 电影式、数据驱动的互动海洋纪录体验。
- 网站首版使用单个 `index.html`，包含 HTML、CSS 和原生 JavaScript。
- 第一幕允许使用本地固定版本的 Three.js 建立连续海底世界；依赖必须随项目托管、保留许可证，并避免额外大型游戏引擎。
- WebGL 场景必须使用单一世界坐标和连续相机轨迹；海床、礁石与珊瑚固定在世界中，不能通过分幕淡入伪装成镜头前进。
- 分层图片、CSS 渐变、遮罩、气泡和光线可作为 WebGL 的环境增强或无 WebGL 时的回退，不应承担主要空间结构。
- 网站所有面向用户的文字使用英文；本说明文件可以使用中文。

## 二、参考网站与借鉴边界

主要视觉参考：

[The Sea We Breathe — Blue Marine Foundation](https://www.bluemarinefoundation.com/the-sea-we-breathe/)

### 参考网站值得借鉴的设计方法

1. **一个屏幕只表达一个重点**  
   每个全屏画面只有一句核心旁白、一个主要动作或一个主要发现，不在同一屏堆叠大量信息。

2. **完整画面优先于传统网页布局**  
   使用全屏海洋画面、深色遮罩和少量界面信息，而不是常规的导航栏、卡片列表和大段正文。

3. **字体承担叙事作用**  
   大型标题负责情绪，小型坐标、深度、温度和进度负责建立“真实潜水记录”的感觉。

4. **滚动是一种体验动作**  
   用户不是在浏览页面，而是在“继续下潜”。深度、光线、颜色和信息随着滚动同步变化。

5. **先制造情绪，再提供事实**  
   先让用户目睹海洋问题，再出现数据、解释和行动，避免开场就像科普课件。

6. **节奏缓慢而克制**  
   动画用呼吸般的速度出现，不快速弹跳，不连续制造刺激。

7. **声音只作为增强层**  
   可以加入海水、呼吸或气泡环境音，但必须由用户主动开启；没有声音时网站仍然完整可用。

### 不得直接复制的内容

- 不复制参考网站的标题、文案、标志、影片、照片、音频、代码或项目案例。
- 不照搬其坐标排版、按钮造型或标题组合到难以区分的程度。
- 不把 BlueTrace 做成 Blue Marine Foundation 的仿制网站。
- 借鉴的是电影式节奏、信息层级和沉浸方法；BlueTrace 必须保留自己的四幕故事、采样学习、潜水练习和奖励系统。

## 三、视觉风格

### 整体基调

电影感、安静、深邃、沉浸、克制，有轻微的未知感，但不能像恐怖游戏。

画面应该更接近纪录片和环保展览，而不是卡通游戏、儿童科普网站或普通公益宣传页。

### 配色

所有颜色应使用 CSS 变量统一管理。

```css
:root {
  --ocean-blue: #0a2e4d;
  --deep-ocean: #04121f;
  --coral-accent: #ff7a5c;
  --degraded-grey: #7a8a92;
  --text-light: #e8f1f5;
}
```

- `#0a2e4d`：浅层海水、第一幕背景和主要海洋色。
- `#04121f`：深处背景、Lab 和重要信息区域。
- `#ff7a5c`：警告、珊瑚、关键交互和少量奖励高亮。
- `#7a8a92`：浑浊、退化、未完成状态。
- `#e8f1f5`：主要文字。
- 不随意加入高饱和紫色、荧光绿色或彩虹渐变。

### 字体与排版

- 全站只使用一种简洁无衬线字体，优先使用系统字体，避免额外加载造成卡顿。
- 章节标题可以使用大写、宽字距、描边字与实心字的组合。
- 正文像纪录片旁白：短、安静、明确。
- 一屏通常不超过一个标题、两至三行正文和一个主要操作。
- 保持大量留白，不把所有空白都填满。
- 小型 HUD 信息可使用大写字母、细字重和较宽字距。

### 水下氛围

可使用：

- 缓慢上升的小气泡。
- 透明度很低的漂浮颗粒。
- 顶部射入的柔和光束。
- 轻微的水下雾化和色彩偏移。
- 随深度变暗、变冷的背景。
- 非规则、非常缓慢的前景漂移。

避免：

- 高频闪烁。
- 快速漂动的大量粒子。
- 卡通鱼群循环贴图。
- 每个元素都使用相同的淡入上移动画。
- 过量毛玻璃卡片和圆角面板。

## 四、全站叙事结构

网站保持四幕，每幕是一个或数个全屏 section，但视觉上必须像一段连续下潜。

### 第一幕：WITNESS / 目睹

**目的：**让用户先看见问题，而不是立即接受知识测试。

用户进入已经退化的海，看到：

- 浑浊水体。
- 白化或失去活力的珊瑚。
- 漂浮塑料或微塑料颗粒。
- 被惊扰的海洋生物。

建议界面：

- 全屏退化海域。
- 左上角显示地点、时间或观察编号。
- 右侧或底部显示 Depth、Water Clarity、Dive Progress。
- 开场只出现一段极短旁白。
- 用户滚动后，深度增加，光线减少，异常逐渐显现。

用户在这一幕是旁观者，不设置“立即修复海洋”的按钮。

### 第二幕：TRACE LAB / 理解因素

**目的：**让用户理解看不见的水质因素如何影响生态。

核心因素：

- Dissolved Oxygen
- Turbidity
- pH
- Microplastics

呈现方式：

- Lab 不是传统白色实验室，也不是四张信息卡。
- 保留同一片海作为实验背景，一次只观察一个因素。
- 用户拖动一个刻度、移动采样器或比较两个水样。
- 海水颜色、颗粒密度、生物活动和珊瑚状态随因素变化。
- 每次操作后只弹出一个短事实和一个清楚的因果关系。
- 所有数值必须标注为 educational simulation、sample data 或 team-collected data，不能暗示模型能精确预测真实生态。

建议交互循环：

> Observe → Take a sample → Adjust or compare → See the ecological response → Learn one fact

结尾应把问题从环境因素带回潜水者：

> Some damage is invisible. Some begins with the way we enter the water.

### 第三幕：PRACTICE DIVE / 练习

**目的：**让用户真实体验“更环保的潜水方式应该怎样做”。

这一幕是网站最重要的招牌互动。它应像一次连续潜水任务，而不是四个互不相关的小游戏。

练习内容：

1. **Keep Your Distance**  
   控制潜水者与珊瑚的距离，避免脚蹼触碰和扬起沉积物。

2. **Photograph Without Contact**  
   调整位置和镜头，不触摸、移动或追逐生物。

3. **Leave or Retrieve?**  
   判断某件海中物体是否适合安全带走；避免把已经成为栖息地的物体贸然移除。

4. **Respect Marine Life**  
   选择减速、绕行、降低灯光或保持距离，不追逐和包围动物。

反馈规则：

- 正确行为带来即时而局部的变化，例如沉积物落下、动物恢复自然运动、视野变清晰。
- 错误行为不使用夸张失败画面，只显示清楚的后果和一次重试机会。
- 用户必须通过行为获得知识，不能只读文字后点击“正确答案”。
- 练习难度要低，重点是判断与体验，不考验复杂操作技巧。

### 第四幕：DIVER PASSPORT / 记录

**目的：**把学习结果转化为可记住、可分享、可带到真实生活中的行动。

Passport 可以包含：

- Dive depth reached
- Samples observed
- Skills practiced
- Responsible diving choices
- One personal ocean pledge
- Field notes unlocked

奖励形式：

- **Sample Stamp**：完成一次水质观察。
- **Skill Patch**：掌握一种负责任潜水行为。
- **Dive Memory**：解锁一条来自真实潜水经验的短记录。
- **Responsible Diver Passport**：汇总本次学习成果。

Passport 是教育成果记录，不是假装成正式潜水资格证书。奖励应精致、克制、有收藏感，避免金币、宝箱、排行榜和连续签到。

结尾不设置多个剧情结局，而是给出一个明确出口：

> The next dive happens in the real ocean. Take only memories. Leave only bubbles.

## 五、采样、知识与现实经验

用户可以参与“采样”，但采样的作用是连接观察、理解和行动，而不是把网站变成复杂科研系统。

### 用户采样的价值

- 让用户主动寻找水体中的异常。
- 把抽象指标变成具体视觉现象。
- 为后续潜水行为练习提供原因。
- 让 Passport 中的成果有来源。

### 科普信息规则

每条知识应回答三个问题：

1. What did I notice?
2. Why does it matter?
3. What can a diver do differently?

单次弹窗不超过约 35 个英文单词。详细解释可以通过 “Explore the science” 展开，但不能打断主线。

### 真实潜水经验

可以加入经过整理的 Field Notes，例如：

- 如何控制浮力，避免脚蹼触底。
- 如何选择 reef-safe 行为，而不做绝对化产品宣传。
- 什么时候不应触碰或带走海洋物体。
- 如何在拍摄时保持距离。
- 如何在动物出现压力反应时主动离开。

每条 Field Note 应标明来源类型，例如 Marine Biologist、Dive Instructor、Conservation Diver 或 Published Guidance。未经核实的个人观点不能包装成科学事实。

## 六、交互与动画规范

### 页面运动

- 主要节奏由滚动控制。
- 使用 `IntersectionObserver` 或简单滚动进度更新场景，不使用沉重的滚动框架。
- 元素进入时以透明度、轻微位移、模糊度或遮罩变化为主。
- 一般过渡时长为 0.8–1.8 秒；环境循环可以更慢。
- 不使用弹跳、甩入、快速缩放、不断旋转或游戏式震屏。

### 动画的因果关系

每个动画必须表达至少一种意义：

- 深度变化。
- 水质变化。
- 用户行为造成的干扰或减少干扰。
- 新知识被发现。
- 奖励被记录。

如果动画只是装饰、会分散注意力或没有叙事作用，应删除。

### 关键交互

- 主要按钮使用短英文动词，例如 `BEGIN DIVE`、`TAKE SAMPLE`、`TRY AGAIN`、`CONTINUE DESCENT`。
- 每屏最多一个主要按钮。
- 按钮可以使用细线或角括号式边界，但必须具有明显的 hover、focus 和 pressed 状态。
- 所有拖动交互必须同时提供键盘或点击替代方式。
- 手机端的点击区域不小于约 44 × 44 px。

### 声音

- 禁止有声自动播放。
- 提供明确的 Sound On / Sound Off 控件。
- 声音只增强氛围，不能承载唯一信息。
- 若项目时间有限，优先完成无声版本。

## 七、HUD 与进度设计

HUD 应像潜水记录仪，而不是游戏积分面板。

可显示：

- `DEPTH 08 M`
- `DIVE PROGRESS 42%`
- `WATER CLARITY LOW`
- `SAMPLES 2 / 4`
- `SKILLS 1 / 4`

规则：

- HUD 全程保持低调，不遮挡主体。
- 手机端只保留最重要的两到三项。
- 进度必须反映真实完成状态。
- 不使用虚假的温度、坐标或科学数值；若为叙事设定，应标明是模拟地点。

## 八、技术规范

### 文件与结构

首版保持：

```text
XA website/
├── AGENTS.md
├── index.html
└── assets/
```

若素材增加，可以建立：

```text
assets/
├── images/
├── audio/
└── video/
```

### 实现原则

- 优先使用语义化 HTML、CSS 变量和原生 JavaScript。
- 场景状态使用清楚的 class，例如 `.is-active`、`.is-restored`、`.is-complete`。
- 不把所有逻辑写在一个巨大的滚动事件中。
- 对滚动事件使用节流、`requestAnimationFrame` 或 `IntersectionObserver`。
- 气泡和颗粒使用少量 DOM 元素或伪元素，不创建数百个节点。
- 图片优先使用 WebP 或 AVIF，并提供合理尺寸。
- 若使用视频，只使用少量经过压缩的 MP4/WebM，并提供 poster；不能依赖多个超大背景视频。
- 所有图片有替代文本；装饰图使用空 `alt`。
- 不从来源不明的网站直接复制素材。

### 性能目标

- 首屏应快速出现文字和基础背景，不等待所有媒体加载完成。
- 动画在普通笔记本和手机上应保持流畅。
- 页面在媒体加载失败时仍能完成主要任务。
- 避免大型依赖、未经使用的库和远程字体堆叠。

### 无障碍与舒适度

- 支持 `prefers-reduced-motion`，减少视差、漂浮和持续运动。
- 保证文字与背景有足够对比度。
- 所有互动可通过键盘访问，并有清晰焦点状态。
- 不把关键文字只放在动画中短暂出现。
- 避免闪烁、突发大音量和可能造成眩晕的强视差。
- 网站在静音和关闭动画的情况下仍然完整可理解。

## 九、文案规范

网站可见文案全部使用英文。

文案语气：

- 像海洋纪录片旁白。
- 不夸张、不说教、不制造廉价罪恶感。
- 先描述用户正在看到的事实，再解释意义。
- 让用户理解责任，但不宣称一个人的点击已经“拯救海洋”。

推荐：

> The water looks calm. The reef tells another story.

避免：

> The ocean is dying! Click now to save everything!

按钮文字保持两到三个词。科普内容优先短句，长解释放在可展开区域。

## 十、三人协作分工

### A：骨架、第一幕与第四幕

- 全站 section 结构。
- 开场、深度 HUD 和滚动进度。
- Witness 场景。
- Passport、奖励展示和结尾。

### B：Trace Lab

- 四个水质因素。
- 采样与调节交互。
- 科学文案与数据标注。
- 不同因素造成的视觉状态。

### C：Practice Dive

- 连续潜水练习机制。
- 四种负责任潜水行为。
- 正确与错误行为反馈。
- Skill Patch 解锁。

### 合并约定

- 开始工作前先同步最新文件。
- 一次只让 AI 完成一个明确模块。
- 未经允许，禁止私自使用 subagents。
- 不让两个人同时重写同一段 HTML、CSS 或 JavaScript。
- 新增 class 时使用清楚的模块前缀，例如 `witness-`、`lab-`、`practice-`、`passport-`。
- 修改全局颜色、字体、section 高度或滚动逻辑前必须通知另外两人。
- 合并后至少检查桌面端、手机端、静音模式和 reduced-motion 模式。

## 十一、给 AI 的工作指令模板

每次使用 AI 时，先发送：

> Read AGENTS.md completely before editing. Follow its project logic, visual language, technical limits, English copy rules, accessibility requirements, and collaboration conventions. Do not redesign unrelated sections.

然后只给一个小任务，例如：

> Build only the Witness section in index.html. Keep the existing four-act structure. Use CSS and vanilla JavaScript only. Do not modify the Lab, Practice, or Passport content.

或：

> Improve only the turbidity interaction in Trace Lab. The user must observe, take a sample, compare the result, learn one fact, and receive one Sample Stamp. Preserve all existing styles and IDs outside this module.

AI 完成后必须要求它：

- 说明修改了哪些内容。
- 说明没有修改哪些模块。
- 检查控制台错误。
- 测试桌面和手机布局。
- 检查 reduced-motion 和键盘操作。

## 十二、完成标准

一个模块只有在满足以下条件时才算完成：

- 用户不看说明也知道下一步做什么。
- 交互确实表达了一个海洋知识或潜水行为。
- 动画有明确的叙事原因。
- 可见文案为英文且足够简短。
- 不依赖复杂 3D 或大型框架。
- 手机端可操作。
- 静音状态可完成。
- reduced-motion 状态可完成。
- 没有复制参考网站的素材、代码或专属文案。
- 与 Witness → Trace Lab → Practice Dive → Diver Passport 的整体逻辑一致。
