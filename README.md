# Web编辑器技术演示集合

这个项目包含了一系列适用于Web环境的开源HTML编辑器与工具的演示页面，特别针对思维导图和类PPT页面的编辑需求整理而成，涵盖易用性、功能集成度和技术特点等维度。

## 项目结构

- `index.html` - 主导航页面，包含所有演示的链接
- `jsmind_demo.html` - jsMind思维导图演示
- `simple-mind-map_demo.html` - simple-mind-map思维导图演示
- `rmind_demo.html` - RMind思维导图演示
- `revealjs_demo.html` - reveal.js幻灯片演示
- `kindeditor_demo.html` - KindEditor富文本编辑器演示
- `contenttools_demo.html` - ContentTools区块化编辑器演示
- `grapesjs_demo.html` - GrapesJS可视化页面构建器演示

## 技术清单

### 思维导图编辑工具

1. **jsMind**
   - 技术特点：基于HTML5 Canvas/SVG绘制，支持动态节点操作与跨平台兼容
   - 核心功能：节点拖拽、折叠展开、JSON导入导出、主题切换
   - 开源协议：BSD协议，可免费商用
   - 适用场景：快速集成到现有Web系统，适合轻量级思维导图需求

2. **simple-mind-map**
   - 技术特点：框架无关（支持Vue/React/原生JS），插件化架构
   - 核心功能：六种结构支持（鱼骨图/时间轴等）、节点富文本（图片/图标/超链接）、导出PNG/SVG/PDF/Markdown
   - 特色：水印插件、自由节点拖拽、快捷键支持

3. **RMind**
   - 技术特点：基于React Hooks + Flex布局，仅用Canvas绘制连接线
   - 操作支持：键盘快捷键（Tab/Enter增删节点）、拖拽、主题切换
   - 导入导出：支持.km（百度脑图）、.md、.txt格式

### 类PPT页面编辑框架

1. **reveal.js**
   - 定位：HTML幻灯片框架（网页版PPT替代）
   - 核心优势：嵌套幻灯片、Markdown原生支持、LaTeX数学公式、代码高亮、PDF导出、演讲者注释

### 通用HTML内容编辑器

1. **KindEditor**
   - 特点：轻量级（约861KB）、所见即所得（WYSIWYG）
   - 兼容性：IE6+、Chrome、Firefox等主流浏览器
   - 集成方式：替换`<textarea>`标签，支持ASP/PHP/JSP后端

2. **ContentTools**
   - 特点：无框架依赖、区块化编辑（类似Medium编辑器）
   - 功能：表格/图片/视频插入、HTML源码编辑
   - 体积：压缩后仅49KB

3. **GrapesJS**
   - 定位：可视化网站模板构建器
   - 高级功能：拖拽组件+样式管理器、响应式设计调试、多格式代码生成
   - 适用场景：需要设计复杂HTML结构的场景（如邮件模板/落地页）

## 使用方法

1. 克隆或下载本仓库
2. 在浏览器中打开`index.html`文件
3. 点击任意演示链接查看对应技术的演示页面

## 注意事项

- 所有演示页面均使用CDN引入相关库，需要联网才能正常运行
- 部分功能（如文件上传）在本地演示环境中可能受限
- 这些演示仅用于技术评估和学习，实际项目中可能需要更多配置和优化

## 选型建议

| 需求类型 | 推荐工具 | 关键优势 |
|---------|---------|---------|
| 思维导图编辑 | simple-mind-map | 插件丰富/导出格式多 |
| 幻灯片演示 | reveal.js | 动画流畅/学术元素支持（公式/代码） |
| 轻量级内容编辑 | KindEditor | 部署简单/兼容老旧系统 |
| 区块化内容管理 | ContentTools | 现代编辑体验/低耦合集成 |
| 复杂页面构建 | GrapesJS | 可视化拖拽/响应式设计 |

建议优先尝试 simple-mind-map（思维导图）+ reveal.js（PPT式展示）组合，两者均以HTML为输出核心，可直接在浏览器中编辑并保存为独立HTML文件，无需后端支持。若需团队协作或历史版本管理，可结合Git版本控制或云存储API扩展功能。 