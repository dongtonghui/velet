# VeletSolo 配置系统自动化测试文档

本文档说明如何运行配置系统的自动化测试，确保 `website-config.json` 配置文件的完整性和正确性。

---

## 📁 测试文件结构

```
velet/
├── config-tester.js      # 测试框架核心
├── config-tests.js       # 测试用例集合
├── test-runner.html      # 浏览器端测试界面
├── test-node.js          # Node.js 测试脚本
└── TEST_README.md        # 本文档
```

---

## 🚀 运行测试

### 方法一：浏览器测试（推荐开发调试）

1. 启动本地服务器：
```bash
python3 -m http.server 8000
```

2. 打开浏览器访问：
```
http://localhost:8000/test-runner.html
```

3. 点击 **"Run All Tests"** 按钮运行测试

4. 可选：添加 `?autorun` 参数自动运行
```
http://localhost:8000/test-runner.html?autorun
```

**浏览器测试界面功能：**
- 📊 实时统计通过/失败/跳过的测试数量
- 🔍 筛选查看不同类型的测试结果
- 📥 导出测试结果 JSON 文件
- 🎨 美观的可视化界面

---

### 方法二：Node.js 测试（推荐 CI/CD）

```bash
# 运行所有测试
node test-node.js

# 显示详细输出
node test-node.js --verbose

# 输出 JSON 格式（用于自动化处理）
node test-node.js --json

# CI 模式（失败时返回非零退出码）
node test-node.js --ci
```

**CI/CD 集成示例（GitHub Actions）：**

```yaml
name: Config Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run Config Tests
        run: node test-node.js --ci
```

---

### 方法三：快速验证（Python）

如果环境中没有 Node.js，可以使用 Python 快速验证：

```bash
python3 -c "
import json
with open('website-config.json') as f:
    config = json.load(f)
print('✅ JSON 格式正确')
print(f'产品数量: {len(config[\"home\"][\"spotlight\"][\"products\"])}')
print(f'FAQ 数量: {len(config[\"home\"][\"faq\"][\"items\"])}')
"
```

---

## 📋 测试覆盖范围

### 1. 配置加载测试
- ✅ JSON 格式验证
- ✅ 文件可访问性检查
- ✅ 必需字段存在性验证

### 2. 全局配置测试
- ✅ 公司信息完整性（名称、标语、描述）
- ✅ 联系方式有效性（邮箱格式验证）
- ✅ SEO 配置检查（标题、描述、关键词）
- ✅ 社交媒体链接
- ✅ 信任指标（评分格式、客户数量）

### 3. 导航配置测试
- ✅ Logo 定义
- ✅ 导航链接（label + href）
- ✅ CTA 按钮配置

### 4. 年龄验证门测试
- ✅ 配置完整性
- ✅ 按钮文案定义
- ✅ 法律文本

### 5. 首页配置测试
- ✅ Hero 区域配置
- ✅ 产品分类数据
- ✅ 精选产品数据
- ✅ FAQ 配置
- ✅ 用户评价数据
- ✅ 品牌理念配置

### 6. 产品数据测试
- ✅ 字段完整性（id, name, price, description）
- ✅ 价格格式验证（$X 或 $X.XX）
- ✅ 标签数组
- ✅ 图片路径格式
- ✅ 分类 ID 唯一性

### 7. FAQ 测试
- ✅ 分类定义
- ✅ 问题/答案非空检查
- ✅ 答案长度合理性
- ✅ 分类引用有效性

### 8. 模板渲染测试
- ✅ 变量替换
- ✅ 多变量处理
- ✅ 未定义变量保留
- ✅ 空值处理

### 9. 边界情况测试
- ✅ 空数组处理
- ✅ 特殊字符处理
- ✅ 评分范围（1-5）
- ✅ JSON 序列化/反序列化

### 10. 集成测试（浏览器）
- ✅ DOM 元素存在性
- ✅ 导航链接数量匹配
- ✅ Hero 标题显示
- ✅ 产品卡片渲染
- ✅ FAQ 交互功能

### 11. 性能测试
- ✅ 配置加载时间（< 5s）
- ✅ 模板渲染性能（1000次 < 100ms）

---

## 🎯 测试断言类型

测试框架支持以下断言方法：

```javascript
// 基本断言
t.assert(condition, message)
t.assertTrue(value)
t.assertFalse(value)
t.assertNull(value)
t.assertNotNull(value)
t.assertUndefined(value)
t.assertDefined(value)

// 相等性断言
t.assertEquals(actual, expected)
t.assertArrayEquals(actual, expected)
t.assertObjectEquals(actual, expected)

// 内容断言
t.assertContains(haystack, needle)
t.assertMatch(string, regex)
t.assertThrows(fn, ErrorType)

// 异步断言
t.assertResolves(promise)
t.assertRejects(promise, ErrorType)
```

---

## 🛠 添加新测试

在 `config-tests.js` 中添加新测试：

```javascript
suite.test('测试名称 - 应达到预期结果', async function(t) {
  // 准备数据
  const config = await suite.loadTestConfig();
  
  // 执行断言
  t.assertDefined(config.newSection);
  t.assertEquals(config.newSection.value, 'expected');
});
```

或在 `test-node.js` 中添加：

```javascript
{
  name: '新测试名称',
  fn: () => {
    const value = this.suite.configData.some.path;
    this.suite.assertTrue(value > 0);
  }
}
```

---

## 📊 测试结果解读

### 测试状态
- ✅ **PASS** - 测试通过
- ❌ **FAIL** - 测试失败（会显示错误信息）
- ⏭️ **SKIP** - 测试被跳过

### 失败排查

**JSON 格式错误：**
```
❌ 配置加载失败: Unexpected token }
```
→ 使用 [JSONLint](https://jsonlint.com/) 验证格式

**缺少必需字段：**
```
❌ 全局配置 - 公司信息应完整: Missing company.name
```
→ 检查 `website-config.json` 中对应字段

**邮箱格式错误：**
```
❌ 联系信息应有效: Expected to match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```
→ 修正邮箱地址格式

---

## 🔧 持续集成建议

### 1. 提交前检查
配置 Git 钩子自动运行测试：

```bash
# .git/hooks/pre-commit
#!/bin/bash
python3 -c "import json; json.load(open('website-config.json'))" || exit 1
```

### 2. 自动部署检查
在部署流水线中添加测试步骤：

```bash
# 部署脚本
npm test  # 或 node test-node.js --ci
if [ $? -ne 0 ]; then
  echo "配置测试失败，中止部署"
  exit 1
fi
```

### 3. 定期健康检查
设置定时任务检查配置：

```cron
# 每天凌晨运行测试
0 0 * * * cd /path/to/velet && node test-node.js --json > /var/log/velet-tests.json
```

---

## 📝 测试报告示例

```
============================================================
🧪 VeletSolo Config Test Suite
============================================================

Total:   35
Passed:  33 ✅
Failed:  1 ❌
Skipped: 1 ⏭️
Time:    245ms

============================================================

❌ Failed Tests:

  • 产品数据 - 价格格式应正确
    Product 3 price format invalid: $49.9
    
============================================================
```

---

## 💡 最佳实践

1. **修改配置前运行测试** - 确保当前配置有效
2. **修改后再次运行测试** - 验证更改没有破坏任何功能
3. **使用版本控制** - 配置变更也应提交到 Git
4. **定期审查测试** - 随着配置结构变化更新测试用例
5. **监控测试时间** - 如果测试变慢，可能有性能问题

---

## 📞 问题反馈

如遇到测试问题，请提供：
1. 测试输出日志
2. `website-config.json` 的相关部分
3. 运行环境信息（Node.js/Python 版本）

---

> 自动化测试是配置化架构的重要组成部分，确保网站内容的可靠性和一致性。
