/**
 * VeletSolo Config Tester
 * 配置加载引擎自动化测试框架
 * 
 * 支持浏览器环境和 Node.js 环境
 */

(function(global) {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════════
  // Test Framework Core
  // ═════════════════════════════════════════════════════════════════════════════

  class TestFramework {
    constructor() {
      this.tests = [];
      this.results = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        failures: []
      };
      this.beforeEachFn = null;
      this.afterEachFn = null;
      this.beforeAllFn = null;
      this.afterAllFn = null;
    }

    // 注册测试用例
    test(name, fn) {
      this.tests.push({ name, fn, skip: false });
    }

    // 跳过测试
    skip(name, fn) {
      this.tests.push({ name, fn, skip: true });
    }

    // 独占测试（仅运行此测试）
    only(name, fn) {
      this.tests.forEach(t => t.skip = true);
      this.tests.push({ name, fn, skip: false, only: true });
    }

    // 生命周期钩子
    beforeEach(fn) { this.beforeEachFn = fn; }
    afterEach(fn) { this.afterEachFn = fn; }
    beforeAll(fn) { this.beforeAllFn = fn; }
    afterAll(fn) { this.afterAllFn = fn; }

    // 断言方法
    assert(condition, message) {
      if (!condition) {
        throw new AssertionError(message || 'Assertion failed');
      }
    }

    assertEquals(actual, expected, message) {
      if (actual !== expected) {
        throw new AssertionError(
          message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
        );
      }
    }

    assertTrue(value, message) {
      this.assert(value === true, message || `Expected true, but got ${value}`);
    }

    assertFalse(value, message) {
      this.assert(value === false, message || `Expected false, but got ${value}`);
    }

    assertNull(value, message) {
      this.assert(value === null, message || `Expected null, but got ${value}`);
    }

    assertNotNull(value, message) {
      this.assert(value !== null, message || `Expected non-null value`);
    }

    assertUndefined(value, message) {
      this.assert(value === undefined, message || `Expected undefined, but got ${value}`);
    }

    assertDefined(value, message) {
      this.assert(value !== undefined, message || `Expected defined value`);
    }

    assertArrayEquals(actual, expected, message) {
      if (!Array.isArray(actual) || !Array.isArray(expected)) {
        throw new AssertionError(message || 'Both values must be arrays');
      }
      if (actual.length !== expected.length) {
        throw new AssertionError(
          message || `Array length mismatch: expected ${expected.length}, but got ${actual.length}`
        );
      }
      for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
          throw new AssertionError(
            message || `Array mismatch at index ${i}: expected ${expected[i]}, but got ${actual[i]}`
          );
        }
      }
    }

    assertObjectEquals(actual, expected, message) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new AssertionError(
          message || `Object mismatch:\nExpected: ${expectedStr}\nActual: ${actualStr}`
        );
      }
    }

    assertThrows(fn, expectedError, message) {
      try {
        fn();
        throw new AssertionError(message || 'Expected function to throw, but it did not');
      } catch (e) {
        if (expectedError && !(e instanceof expectedError)) {
          throw new AssertionError(
            message || `Expected ${expectedError.name}, but got ${e.constructor.name}`
          );
        }
      }
    }

    assertContains(haystack, needle, message) {
      const contains = typeof haystack === 'string' 
        ? haystack.includes(needle)
        : Array.isArray(haystack) && haystack.includes(needle);
      this.assert(contains, message || `Expected to contain "${needle}"`);
    }

    assertMatch(string, regex, message) {
      this.assert(regex.test(string), message || `Expected to match ${regex}`);
    }

    // 异步断言
    async assertResolves(promise, message) {
      try {
        await promise;
      } catch (e) {
        throw new AssertionError(message || `Expected promise to resolve, but rejected: ${e}`);
      }
    }

    async assertRejects(promise, expectedError, message) {
      try {
        await promise;
        throw new AssertionError(message || 'Expected promise to reject, but resolved');
      } catch (e) {
        if (expectedError && !(e instanceof expectedError)) {
          throw new AssertionError(
            message || `Expected ${expectedError.name}, but got ${e.constructor.name}`
          );
        }
      }
    }

    // 运行所有测试
    async run() {
      console.log('\n' + '='.repeat(60));
      console.log('🧪 VeletSolo Config Tester');
      console.log('='.repeat(60) + '\n');

      const startTime = Date.now();

      // 执行 beforeAll
      if (this.beforeAllFn) {
        try {
          await this.beforeAllFn();
        } catch (e) {
          console.error('❌ beforeAll failed:', e.message);
          return this.results;
        }
      }

      // 运行测试
      for (const test of this.tests) {
        this.results.total++;

        if (test.skip) {
          console.log(`⏭️  SKIP: ${test.name}`);
          this.results.skipped++;
          continue;
        }

        // 执行 beforeEach
        if (this.beforeEachFn) {
          try {
            await this.beforeEachFn();
          } catch (e) {
            console.error(`❌ beforeEach failed for "${test.name}":`, e.message);
            this.results.failed++;
            this.results.failures.push({ test: test.name, error: e, phase: 'beforeEach' });
            continue;
          }
        }

        // 执行测试
        try {
          await test.fn(this);
          console.log(`✅ PASS: ${test.name}`);
          this.results.passed++;
        } catch (e) {
          console.error(`❌ FAIL: ${test.name}`);
          console.error(`   ${e.message}`);
          this.results.failed++;
          this.results.failures.push({ test: test.name, error: e, phase: 'test' });
        }

        // 执行 afterEach
        if (this.afterEachFn) {
          try {
            await this.afterEachFn();
          } catch (e) {
            console.error(`⚠️  afterEach failed for "${test.name}":`, e.message);
          }
        }
      }

      // 执行 afterAll
      if (this.afterAllFn) {
        try {
          await this.afterAllFn();
        } catch (e) {
          console.error('⚠️  afterAll failed:', e.message);
        }
      }

      const duration = Date.now() - startTime;

      // 输出结果
      console.log('\n' + '='.repeat(60));
      console.log('📊 Test Results');
      console.log('='.repeat(60));
      console.log(`Total:   ${this.results.total}`);
      console.log(`Passed:  ${this.results.passed} ✅`);
      console.log(`Failed:  ${this.results.failed} ❌`);
      console.log(`Skipped: ${this.results.skipped} ⏭️`);
      console.log(`Time:    ${duration}ms`);
      console.log('='.repeat(60));

      if (this.results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        this.results.failures.forEach(({ test, error, phase }) => {
          console.log(`\n  • ${test} (${phase})`);
          console.log(`    ${error.message}`);
          if (error.stack) {
            const stack = error.stack.split('\n').slice(1, 3).join('\n');
            console.log(stack);
          }
        });
      }

      console.log('');
      return this.results;
    }
  }

  // 断言错误类
  class AssertionError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AssertionError';
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Config Specific Tests
  // ═════════════════════════════════════════════════════════════════════════════

  class ConfigTester extends TestFramework {
    constructor() {
      super();
      this.configData = null;
      this.originalConfig = null;
    }

    // 加载测试配置
    async loadTestConfig() {
      try {
        const response = await fetch('website-config.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        this.configData = await response.json();
        this.originalConfig = JSON.parse(JSON.stringify(this.configData));
        return this.configData;
      } catch (error) {
        throw new Error(`Failed to load config: ${error.message}`);
      }
    }

    // 验证配置结构
    validateConfigStructure(config) {
      this.assertObjectEquals(
        Object.keys(config).sort(),
        ['_comment', 'ageGate', 'footer', 'global', 'home', 'navigation'].sort(),
        'Config must have required top-level keys'
      );
    }

    // 验证全局配置
    validateGlobalConfig(global) {
      this.assertDefined(global, 'Global config must be defined');
      this.assertDefined(global.company, 'Global.company must be defined');
      this.assertEquals(typeof global.company.name, 'string', 'Company name must be string');
      this.assertTrue(global.company.name.length > 0, 'Company name must not be empty');
      
      this.assertDefined(global.contact, 'Global.contact must be defined');
      this.assertDefined(global.contact.email, 'Contact email must be defined');
      this.assertMatch(global.contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format must be valid');
      
      this.assertDefined(global.seo, 'Global.seo must be defined');
      this.assertDefined(global.trust, 'Global.trust must be defined');
    }

    // 验证导航配置
    validateNavigationConfig(nav) {
      this.assertDefined(nav, 'Navigation config must be defined');
      this.assertDefined(nav.logo, 'Navigation logo must be defined');
      this.assertArrayEquals(
        nav.links.map(l => typeof l.label),
        nav.links.map(() => 'string'),
        'All navigation link labels must be strings'
      );
      this.assertTrue(nav.links.length > 0, 'Navigation must have at least one link');
    }

    // 验证首页配置
    validateHomeConfig(home) {
      this.assertDefined(home, 'Home config must be defined');
      this.assertDefined(home.hero, 'Home.hero must be defined');
      this.assertDefined(home.collections, 'Home.collections must be defined');
      this.assertDefined(home.spotlight, 'Home.spotlight must be defined');
      this.assertDefined(home.faq, 'Home.faq must be defined');
      this.assertDefined(home.testimonials, 'Home.testimonials must be defined');
    }

    // 验证产品数据
    validateProducts(products) {
      this.assertTrue(Array.isArray(products), 'Products must be an array');
      this.assertTrue(products.length > 0, 'Must have at least one product');
      
      products.forEach((product, index) => {
        this.assertDefined(product.id, `Product ${index} must have id`);
        this.assertDefined(product.name, `Product ${index} must have name`);
        this.assertDefined(product.price, `Product ${index} must have price`);
        this.assertMatch(product.price, /^\$[\d,]+(\.[\d]{2})?$/, `Product ${index} price format must be valid`);
        this.assertTrue(Array.isArray(product.tags), `Product ${index} tags must be an array`);
      });
    }

    // 验证FAQ数据
    validateFAQ(faq) {
      this.assertDefined(faq, 'FAQ config must be defined');
      this.assertTrue(Array.isArray(faq.items), 'FAQ items must be an array');
      this.assertTrue(faq.items.length > 0, 'Must have at least one FAQ item');
      
      faq.items.forEach((item, index) => {
        this.assertDefined(item.category, `FAQ ${index} must have category`);
        this.assertDefined(item.question, `FAQ ${index} must have question`);
        this.assertDefined(item.answer, `FAQ ${index} must have answer`);
        this.assertTrue(item.question.length > 0, `FAQ ${index} question must not be empty`);
        this.assertTrue(item.answer.length > 0, `FAQ ${index} answer must not be empty`);
      });
    }

    // 验证页脚配置
    validateFooter(footer) {
      this.assertDefined(footer, 'Footer config must be defined');
      this.assertDefined(footer.logo, 'Footer logo must be defined');
      this.assertDefined(footer.columns, 'Footer columns must be defined');
      this.assertTrue(Array.isArray(footer.columns), 'Footer columns must be an array');
    }

    // 测试模板渲染
    testTemplateRender(template, variables, expected) {
      const result = this.renderTemplate(template, variables);
      this.assertEquals(result, expected, `Template "${template}" should render to "${expected}"`);
    }

    // 模板渲染函数
    renderTemplate(template, variables) {
      if (typeof template !== 'string') return template;
      return template.replace(/\{(\w+)\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
      });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // DOM Testing Utilities (Browser only)
  // ═════════════════════════════════════════════════════════════════════════════

  class DOMTester {
    constructor() {
      this.testContainer = null;
    }

    // 创建测试容器
    createContainer() {
      this.testContainer = document.createElement('div');
      this.testContainer.id = 'test-container';
      this.testContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(this.testContainer);
      return this.testContainer;
    }

    // 清理测试容器
    cleanup() {
      if (this.testContainer && this.testContainer.parentNode) {
        this.testContainer.parentNode.removeChild(this.testContainer);
      }
      this.testContainer = null;
    }

    // 检查元素存在
    elementExists(selector) {
      return document.querySelector(selector) !== null;
    }

    // 检查元素文本
    elementHasText(selector, expectedText) {
      const element = document.querySelector(selector);
      if (!element) return false;
      return element.textContent.includes(expectedText);
    }

    // 检查元素属性
    elementHasAttribute(selector, attribute, expectedValue) {
      const element = document.querySelector(selector);
      if (!element) return false;
      const actualValue = element.getAttribute(attribute);
      return expectedValue === undefined ? actualValue !== null : actualValue === expectedValue;
    }

    // 模拟点击
    simulateClick(selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
      }
    }

    // 等待元素出现
    waitForElement(selector, timeout = 5000) {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
        }, timeout);
      });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Export
  // ═════════════════════════════════════════════════════════════════════════════

  const tester = {
    TestFramework,
    ConfigTester,
    DOMTester,
    AssertionError,
    createSuite: () => new ConfigTester()
  };

  // 兼容 Node.js 和浏览器环境
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = tester;
  } else {
    global.ConfigTester = tester;
  }

})(typeof window !== 'undefined' ? window : global);
