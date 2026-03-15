# VeletSolo 静态网站动态配置化 - 技术沉淀

> 基于 VeletSolo 官网项目的配置化改造实践

---

## 核心思想

**"配置驱动内容，代码负责呈现"**

将网站内容（文案、图片、数据）与表现层（HTML/CSS/JS）分离，实现：
- ✅ 非技术人员也能修改网站内容
- ✅ 批量修改一处生效，全站同步
- ✅ 降低维护成本，提高迭代效率

---

## 架构模式

### 三层架构

```
┌─────────────────────────────────────────┐
│  Layer 1: 配置层 (Configuration)         │
│  - website-config.json                  │
│  - 集中管理所有内容数据                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 2: 加载层 (Loader)                │
│  - config-loader.js                     │
│  - 配置解析、校验、DOM操作与渲染         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 3: 表现层 (Presentation)          │
│  - index.html                           │
│  - 只负责结构，内容从配置加载            │
└─────────────────────────────────────────┘
```

---

## 项目文件结构

```
velet/
├── website-config.json      # 核心配置文件（内容数据源）
├── config-loader.js         # 配置加载引擎
├── CONFIG_README.md         # 用户配置指南
├── STATIC_SITE_SKILL.md     # 本文档（技术沉淀）
├── index.html               # 首页（结构层）
└── images/                  # 图片资源
    ├── chastity_cage.jpg
    ├── latex_full.jpg
    └── ...
```

---

## 配置结构设计

### 全局配置 (`global`)

```json
{
  "global": {
    "company": {      // 公司信息
      "name": "VeletSolo",
      "tagline": "...",
      "description": "..."
    },
    "contact": {      // 联系方式
      "email": "...",
      "billingName": "..."
    },
    "social": {       // 社交媒体
      "instagram": "...",
      "twitter": "..."
    },
    "seo": {          // SEO默认配置
      "defaultTitle": "...",
      "defaultDescription": "..."
    },
    "trust": {        // 信任指标
      "customerCount": "40,000+",
      "rating": "4.9"
    }
  }
}
```

### 页面配置 (`home`)

```json
{
  "home": {
    "hero": {         // Hero区域
      "eyebrow": "...",
      "title": "...",
      "primaryCta": { "label": "...", "href": "..." }
    },
    "collections": {  // 产品分类
      "items": [...]
    },
    "spotlight": {    // 精选产品
      "products": [...]
    },
    "testimonials": { // 用户评价
      "items": [...]
    },
    "faq": {          // 常见问题
      "items": [...]
    }
  }
}
```

### 导航与页脚 (`navigation`, `footer`)

```json
{
  "navigation": {
    "logo": "VeletSolo",
    "links": [{ "label": "...", "href": "..." }],
    "cta": { "label": "...", "href": "..." }
  },
  "footer": {
    "columns": [...]
  }
}
```

---

## 配置加载引擎 (config-loader.js)

### 核心功能模块

```javascript
// 1. 配置加载
async function loadConfig() {
  const response = await fetch('website-config.json');
  return await response.json();
}

// 2. 配置获取器
function getGlobalConfig() { }
function getPageConfig(pageName) { }

// 3. DOM 操作工具
function setText(selector, content) { }
function setHTML(selector, html) { }
function renderTemplate(template, variables) { }

// 4. 页面渲染器
function renderHomePage() { }
function renderNavigation() { }
function renderHero() { }
// ... 更多渲染函数

// 5. 自动初始化
function autoInit() { }
```

### Public API

```javascript
window.ConfigLoader = {
  load: loadConfig,           // 手动加载配置
  getGlobal: getGlobal,       // 获取全局配置
  getPage: getPage,           // 获取页面配置
  onLoaded: onConfigLoaded,   // 配置加载回调
  renderHome: renderHomePage, // 重新渲染首页
  renderTemplate: renderTemplate  // 模板渲染
};
```

---

## 设计模式与最佳实践

### 1. 模板变量系统

支持在配置中使用 `{variable}` 占位符：

```json
{
  "hero": {
    "description": "Trusted by {customerCount} adults across the US."
  }
}
```

渲染时自动替换为全局配置中的值。

### 2. 错误处理机制

```javascript
// 配置加载失败时优雅降级
async function loadConfig() {
  try {
    const response = await fetch('website-config.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('配置加载失败:', error);
    return null;  // 页面显示默认内容
  }
}

// 安全设置文本
function setText(selector, content) {
  if (!content) return;  // 空值保护
  document.querySelectorAll(selector).forEach(el => {
    if (el) el.textContent = content;
  });
}
```

### 3. 滚动显示动画

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible { 
  opacity: 1; 
  transform: translateY(0); 
}
```

```javascript
// IntersectionObserver 监听元素进入视口
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
```

---

## 常见场景解决方案

### 场景 1: 批量修改公司联系方式

**传统方式：** 修改多处 HTML 中的联系方式
**配置化方式：** 修改 1 处配置

```json
"global": {
  "contact": {
    "email": "new-email@veletsolo.com"
  }
}
```

### 场景 2: 新增产品

**传统方式：** 复制 HTML 结构，修改内容
**配置化方式：** 在 JSON 数组中添加对象

```json
"spotlight": {
  "products": [
    { "id": 1, "name": "Existing Product" },
    { "id": 2, "name": "New Product" }  // 新增
  ]
}
```

### 场景 3: 修改页面标题

```json
"home": {
  "hero": {
    "title": "New Title",
    "titleEmphasis": "Emphasis"
  }
}
```

---

## 扩展性设计

### 添加新页面

1. 在 `website-config.json` 中添加页面配置：
```json
{
  "about": {
    "seo": { "title": "..." },
    "hero": { "title": "..." },
    "content": { ... }
  }
}
```

2. 在 `config-loader.js` 中添加渲染器：
```javascript
function renderAboutPage() {
  const about = getPage('about');
  // 渲染逻辑
}
```

3. 在 `autoInit()` 中注册页面：
```javascript
const pageName = path.includes('about') ? 'about' : 'home';
```

---

## 验证清单（发布前检查）

- [ ] `website-config.json` JSON 格式正确
- [ ] 所有页面引入 `config-loader.js`
- [ ] 全局配置（公司信息、联系方式）正确加载
- [ ] 各页面 SEO 配置正确
- [ ] 产品图片路径正确
- [ ] FAQ 分类筛选功能正常
- [ ] 移动端显示正常
- [ ] 修改配置后刷新页面生效
- [ ] 配置加载失败时页面正常显示（优雅降级）

---

## 优势总结

| 维度 | 传统静态网站 | 配置化静态网站 |
|------|-------------|---------------|
| 内容修改 | 改代码，风险高 | 改配置，零风险 |
| 批量更新 | 多文件修改 | 一处修改，全站生效 |
| 维护成本 | 高（需懂 HTML） | 低（只需改 JSON） |
| 迭代速度 | 慢 | 快（分钟级） |
| 可扩展性 | 差 | 好 |
| 非技术人员 | 无法参与 | 可独立更新内容 |

---

## 适用场景

**推荐使用：**
- 企业官网（内容相对稳定）
- 产品展示站点
- 营销落地页集合
- 需要频繁更新文案的网站

**不适用：**
- 大型电商平台（需要数据库）
- 用户生成内容站点
- 实时数据展示站点

---

## 后续演进方向

1. **多语言支持** - 配置文件中增加多语言字段
2. **可视化配置编辑器** - 界面化修改配置
3. **配置版本管理** - 变更历史记录
4. **配置热更新** - 不刷新页面实时更新
5. **配置校验工具** - 提交前自动检查 JSON 格式

---

## 技术栈

- **纯静态**：HTML5 + CSS3 + Vanilla JavaScript
- **无依赖**：无需 React/Vue/Angular 等框架
- **无构建**：无需 Webpack/Vite 等构建工具
- **易部署**：可直接部署到任何静态托管服务

---

> 本 Skill 基于 VeletSolo 官网项目实践总结，可作为后续同类项目的标准工作流程。
