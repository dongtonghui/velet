# VeletSolo 网站配置指南

> 本文档面向非技术人员，说明如何通过修改配置文件来更新网站内容，无需编写代码。

---

## 📁 配置文件位置

所有网站内容都在 **`website-config.json`** 文件中配置。

```
项目根目录/
├── website-config.json   ← 修改这个文件
├── config-loader.js      ← 配置加载引擎（勿动）
├── index.html            ← 页面结构（勿动）
└── images/               ← 图片文件夹
```

---

## 🚀 快速开始

### 修改网站内容的基本步骤：

1. **打开** `website-config.json` 文件
2. **找到** 需要修改的内容对应的配置项
3. **修改** 文本内容（保持JSON格式正确）
4. **保存** 文件
5. **刷新** 网页查看效果

---

## 📋 配置结构说明

### 1. 全局配置 (`global`)

影响整个网站的基础信息：

```json
"global": {
  "company": {
    "name": "VeletSolo",           // 公司名称
    "tagline": "Where Latex...",   // 品牌标语
    "description": "..."           // 公司描述
  },
  "contact": {
    "email": "support@veletsolo.com",
    "billingName": "VS Commerce LLC"  // 账单显示名称
  },
  "trust": {
    "customerCount": "40,000+",    // 客户数量
    "rating": "4.9",               // 评分
    "reviewCount": "1240"          // 评论数
  }
}
```

**常用修改场景：**
- ✅ 更新公司联系邮箱
- ✅ 修改客户数量/评分数据
- ✅ 更新品牌描述

---

### 2. 导航栏配置 (`navigation`)

```json
"navigation": {
  "logo": "VeletSolo",
  "links": [
    { "label": "Collections", "href": "#collections" },
    { "label": "Our Story", "href": "#story" }
  ],
  "cta": { "label": "Shop Now", "href": "#collections" }
}
```

**修改方法：**
- 修改 `label` 更改显示文字
- 修改 `href` 更改链接目标（`#section-id` 格式为页面内锚点）
- 添加/删除对象来增删导航项

---

### 3. Hero 主视觉区 (`home.hero`)

```json
"hero": {
  "eyebrow": "顶部小标题",
  "title": "Where Latex",
  "titleEmphasis": "Becomes",      // 斜体强调部分
  "titleEnd": "Velvet.",
  "subtitle": "副标题",
  "description": "描述文字",
  "primaryCta": { "label": "按钮文字", "href": "#link" }
}
```

**可用变量：**
- `{customerCount}` - 自动替换为客户数量

---

### 4. 产品分类 (`home.collections`)

```json
"collections": {
  "items": [
    {
      "id": "chastity",
      "tag": "Bestseller",           // 标签
      "name": "Chastity Devices",    // 分类名称
      "description": "描述文字",      // 分类描述
      "icon": "🔑",                  // Emoji 图标
      "image": "./images/chastity_cage.jpg",  // 图片路径
      "href": "#"                    // 链接
    }
  ]
}
```

**添加新分类：**
复制一个现有分类对象，修改其中的值即可。

---

### 5. 精选产品 (`home.spotlight`)

```json
"spotlight": {
  "products": [
    {
      "name": "产品名称",
      "subtitle": "副标题",
      "badge": "Top Seller",         // 徽章标签
      "description": "产品描述",
      "price": "$49",
      "tags": ["标签1", "标签2"],     // 产品标签
      "icon": "🔑",
      "image": "./images/xxx.jpg"
    }
  ]
}
```

---

### 6. 用户评价 (`home.testimonials`)

```json
"testimonials": {
  "items": [
    {
      "stars": 5,                    // 评分（1-5）
      "text": "评价内容",
      "author": "Michael T.",        // 作者名
      "location": "Austin, TX",      // 地点
      "initial": "M",                // 头像字母
      "verified": true               // 是否显示"已验证"
    }
  ]
}
```

---

### 7. FAQ 常见问题 (`home.faq`)

```json
"faq": {
  "categories": [
    { "id": "shipping", "label": "Shipping & Privacy" }
  ],
  "items": [
    {
      "category": "shipping",        // 所属分类
      "question": "问题？",
      "answer": "答案内容（支持HTML标签如<strong>粗体</strong>）",
      "tags": ["标签1", "标签2"]      // 可选
    }
  ]
}
```

---

### 8. 页脚配置 (`footer`)

```json
"footer": {
  "logo": "VeletSolo",
  "tagline": "品牌标语",
  "copyright": "© 2025 VeletSolo · All Rights Reserved",
  "columns": [
    {
      "title": "Collections",        // 列标题
      "links": [
        { "label": "链接文字", "href": "#" }
      ]
    }
  ]
}
```

---

## ⚠️ 重要注意事项

### JSON 格式规则

1. **引号**：所有字符串必须用双引号 `"` 包裹
2. **逗号**：对象之间用逗号分隔，最后一个对象后不加逗号
3. **转义**：内容中如果要使用双引号 `"`，需要写成 `\"`

```json
// ✅ 正确
"text": "This is \"quoted\" text"

// ❌ 错误
'text': 'single quotes'
"text": "missing comma"
```

### 图片路径

- 图片放在 `images/` 文件夹中
- 配置中引用时使用相对路径：`./images/xxx.jpg`

### 多语言支持

目前仅支持英文内容。如需添加其他语言，请联系开发团队。

---

## 🔧 故障排除

### 修改后页面没有变化？

1. **强制刷新**浏览器（Windows: Ctrl+F5 / Mac: Cmd+Shift+R）
2. 检查 `website-config.json` 格式是否正确（使用在线JSON校验工具）
3. 检查浏览器控制台（F12）是否有红色错误信息

### JSON 格式错误？

使用在线工具检查：
- https://jsonlint.com/
- https://jsonformatter.org/

### 图片不显示？

1. 确认图片存在于 `images/` 文件夹
2. 检查路径是否正确：`./images/xxx.jpg`
3. 检查文件名大小写是否匹配

---

## 📞 需要帮助？

如遇到配置问题，请联系：
- 技术支持：support@veletsolo.com

---

> 💡 **提示**：修改配置文件前建议先备份，以防误操作。
