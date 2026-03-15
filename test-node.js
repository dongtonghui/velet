#!/usr/bin/env node

/**
 * VeletSolo Config Test Runner (Node.js)
 * 用于 CI/CD 环境的配置系统自动化测试
 * 
 * 使用方法:
 *   node test-node.js              # 运行所有测试
 *   node test-node.js --verbose    # 显示详细输出
 *   node test-node.js --json       # 输出 JSON 格式结果
 *   node test-node.js --ci         # CI 模式（非零退出码表示失败）
 */

const fs = require('fs');
const path = require('path');

// ═════════════════════════════════════════════════════════════════════════════
// Console Colors
// ═════════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`)
};

// ═════════════════════════════════════════════════════════════════════════════
// Load Test Framework
// ═════════════════════════════════════════════════════════════════════════════

// 模拟浏览器环境
const mockFetch = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Failed to load ${filePath}: ${err.message}`));
      } else {
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(JSON.parse(data))
        });
      }
    });
  });
};

// 模拟全局对象
global.fetch = mockFetch;
global.performance = global.performance || { now: () => Date.now() };

// 加载测试框架
const { ConfigTester, AssertionError } = require('./config-tester.js');

// ═════════════════════════════════════════════════════════════════════════════
// Test Suite Definition
// ═════════════════════════════════════════════════════════════════════════════

class NodeTestRunner {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      json: options.json || false,
      ci: options.ci || false,
      ...options
    };
    this.suite = new ConfigTester();
    this.results = {
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
    };
  }

  // 运行所有测试
  async run() {
    const startTime = performance.now();
    
    if (!this.options.json) {
      log.header('🧪 VeletSolo Config Test Suite');
      log.divider();
    }

    try {
      // 加载配置
      await this.testConfigLoading();
      
      // 验证配置结构
      await this.testConfigStructure();
      
      // 验证全局配置
      await this.testGlobalConfig();
      
      // 验证导航配置
      await this.testNavigationConfig();
      
      // 验证首页配置
      await this.testHomeConfig();
      
      // 验证产品数据
      await this.testProductData();
      
      // 验证 FAQ
      await this.testFAQ();
      
      // 验证模板渲染
      this.testTemplateRendering();
      
      // 验证边缘情况
      this.testEdgeCases();
      
    } catch (e) {
      if (!this.options.json) {
        log.error(`Test suite failed: ${e.message}`);
      }
      this.addResult('Suite Setup', 'fail', e);
    }

    this.results.summary.duration = Math.round(performance.now() - startTime);
    
    // 输出结果
    if (this.options.json) {
      this.outputJSON();
    } else {
      this.outputText();
    }

    // CI 模式：失败时返回非零退出码
    if (this.options.ci && this.results.summary.failed > 0) {
      process.exit(1);
    }

    return this.results;
  }

  // 添加测试结果
  addResult(name, status, error = null, duration = 0) {
    this.results.tests.push({
      name,
      status,
      error: error ? error.message : null,
      duration
    });
    this.results.summary.total++;
    
    if (status === 'pass') this.results.summary.passed++;
    else if (status === 'fail') this.results.summary.failed++;
    else if (status === 'skip') this.results.summary.skipped++;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Individual Test Groups
  // ═══════════════════════════════════════════════════════════════════════════

  async testConfigLoading() {
    const testName = '配置加载 - 应成功加载 website-config.json';
    const start = performance.now();
    
    try {
      const config = await this.suite.loadTestConfig();
      this.suite.assertNotNull(config, 'Config should be loaded');
      this.addResult(testName, 'pass', null, performance.now() - start);
      
      if (this.options.verbose) {
        log.success(`${testName} (${Math.round(performance.now() - start)}ms)`);
      }
    } catch (e) {
      this.addResult(testName, 'fail', e, performance.now() - start);
      if (!this.options.json) log.error(`${testName}: ${e.message}`);
    }
  }

  async testConfigStructure() {
    const tests = [
      {
        name: '配置结构 - 应包含所有必需的顶级键',
        fn: () => {
          const requiredKeys = ['global', 'home', 'navigation', 'footer', 'ageGate'];
          requiredKeys.forEach(key => {
            this.suite.assertDefined(this.suite.configData[key], `Missing key: ${key}`);
          });
        }
      },
      {
        name: '配置结构 - _comment 应为字符串',
        fn: () => {
          this.suite.assertEquals(typeof this.suite.configData._comment, 'string');
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  async testGlobalConfig() {
    const tests = [
      {
        name: '全局配置 - 公司信息应完整',
        fn: () => {
          const company = this.suite.configData.global.company;
          this.suite.assertDefined(company, 'Company should be defined');
          this.suite.assertEquals(typeof company.name, 'string');
          this.suite.assertTrue(company.name.length > 0);
          this.suite.assertDefined(company.tagline);
          this.suite.assertDefined(company.description);
        }
      },
      {
        name: '全局配置 - 联系信息应有效',
        fn: () => {
          const contact = this.suite.configData.global.contact;
          this.suite.assertDefined(contact);
          this.suite.assertDefined(contact.email);
          this.suite.assertMatch(contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          this.suite.assertDefined(contact.billingName);
        }
      },
      {
        name: '全局配置 - SEO 配置应完整',
        fn: () => {
          const seo = this.suite.configData.global.seo;
          this.suite.assertDefined(seo);
          this.suite.assertDefined(seo.defaultTitle);
          this.suite.assertDefined(seo.defaultDescription);
          this.suite.assertDefined(seo.keywords);
          this.suite.assertMatch(seo.themeColor, /^#[0-9A-Fa-f]{6}$/);
        }
      },
      {
        name: '全局配置 - 信任指标应为有效值',
        fn: () => {
          const trust = this.suite.configData.global.trust;
          this.suite.assertDefined(trust);
          this.suite.assertDefined(trust.customerCount);
          this.suite.assertDefined(trust.rating);
          this.suite.assertMatch(trust.rating, /^\d(\.\d)?$/);
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  async testNavigationConfig() {
    const tests = [
      {
        name: '导航配置 - 应包含 logo 和链接',
        fn: () => {
          const nav = this.suite.configData.navigation;
          this.suite.assertDefined(nav);
          this.suite.assertDefined(nav.logo);
          this.suite.assertTrue(Array.isArray(nav.links));
          this.suite.assertTrue(nav.links.length > 0);
        }
      },
      {
        name: '导航配置 - 每个链接应有 label 和 href',
        fn: () => {
          const nav = this.suite.configData.navigation;
          nav.links.forEach((link, index) => {
            this.suite.assertDefined(link.label, `Link ${index} missing label`);
            this.suite.assertDefined(link.href, `Link ${index} missing href`);
          });
        }
      },
      {
        name: '导航配置 - CTA 按钮应配置正确',
        fn: () => {
          const cta = this.suite.configData.navigation.cta;
          this.suite.assertDefined(cta);
          this.suite.assertDefined(cta.label);
          this.suite.assertDefined(cta.href);
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  async testHomeConfig() {
    const tests = [
      {
        name: '首页配置 - Hero 应配置完整',
        fn: () => {
          const hero = this.suite.configData.home.hero;
          this.suite.assertDefined(hero);
          this.suite.assertDefined(hero.eyebrow);
          this.suite.assertDefined(hero.title);
          this.suite.assertDefined(hero.subtitle);
          this.suite.assertDefined(hero.description);
          this.suite.assertDefined(hero.primaryCta);
          this.suite.assertDefined(hero.secondaryCta);
        }
      },
      {
        name: '首页配置 - 应有产品分类',
        fn: () => {
          const collections = this.suite.configData.home.collections;
          this.suite.assertDefined(collections);
          this.suite.assertTrue(Array.isArray(collections.items));
          this.suite.assertTrue(collections.items.length > 0);
        }
      },
      {
        name: '首页配置 - 应有精选产品',
        fn: () => {
          const spotlight = this.suite.configData.home.spotlight;
          this.suite.assertDefined(spotlight);
          this.suite.assertTrue(Array.isArray(spotlight.products));
        }
      },
      {
        name: '首页配置 - 应有 FAQ',
        fn: () => {
          const faq = this.suite.configData.home.faq;
          this.suite.assertDefined(faq);
          this.suite.assertTrue(Array.isArray(faq.items));
        }
      },
      {
        name: '首页配置 - 应有用户评价',
        fn: () => {
          const testimonials = this.suite.configData.home.testimonials;
          this.suite.assertDefined(testimonials);
          this.suite.assertTrue(Array.isArray(testimonials.items));
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  async testProductData() {
    const products = this.suite.configData.home.spotlight.products;
    
    const tests = [
      {
        name: '产品数据 - 应为非空数组',
        fn: () => {
          this.suite.assertTrue(Array.isArray(products));
          this.suite.assertTrue(products.length > 0);
        }
      },
      {
        name: '产品数据 - 每个产品应有必需字段',
        fn: () => {
          products.forEach((product, index) => {
            this.suite.assertDefined(product.id, `Product ${index} missing id`);
            this.suite.assertDefined(product.name, `Product ${index} missing name`);
            this.suite.assertDefined(product.price, `Product ${index} missing price`);
            this.suite.assertDefined(product.description, `Product ${index} missing description`);
          });
        }
      },
      {
        name: '产品数据 - 价格格式应正确',
        fn: () => {
          products.forEach((product, index) => {
            this.suite.assertMatch(
              product.price, 
              /^\$[\d,]+(\.[\d]{2})?$/,
              `Product ${index} price format invalid: ${product.price}`
            );
          });
        }
      },
      {
        name: '产品数据 - 每个产品应有标签数组',
        fn: () => {
          products.forEach((product, index) => {
            this.suite.assertTrue(
              Array.isArray(product.tags),
              `Product ${index} tags should be array`
            );
          });
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  async testFAQ() {
    const faq = this.suite.configData.home.faq;
    
    const tests = [
      {
        name: 'FAQ - 配置应完整',
        fn: () => {
          this.suite.validateFAQ(faq);
        }
      },
      {
        name: 'FAQ - 应有分类',
        fn: () => {
          this.suite.assertTrue(Array.isArray(faq.categories));
          this.suite.assertTrue(faq.categories.length > 0);
          const allCategory = faq.categories.find(c => c.id === 'all');
          this.suite.assertDefined(allCategory, 'Should have "all" category');
        }
      },
      {
        name: 'FAQ - 问题和答案不应为空',
        fn: () => {
          faq.items.forEach((item, index) => {
            this.suite.assertTrue(
              item.question.trim().length > 0,
              `FAQ ${index} question empty`
            );
            this.suite.assertTrue(
              item.answer.trim().length > 10,
              `FAQ ${index} answer too short`
            );
          });
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test_name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  testTemplateRendering() {
    const tests = [
      {
        name: '模板渲染 - 应正确替换变量',
        fn: () => {
          const result = this.suite.renderTemplate('Hello {name}', { name: 'World' });
          this.suite.assertEquals(result, 'Hello World');
        }
      },
      {
        name: '模板渲染 - 应保留未定义变量',
        fn: () => {
          const result = this.suite.renderTemplate('Hello {name}', { other: 'value' });
          this.suite.assertEquals(result, 'Hello {name}');
        }
      },
      {
        name: '模板渲染 - 应处理多个变量',
        fn: () => {
          const result = this.suite.renderTemplate('{a} {b}', { a: '1', b: '2' });
          this.suite.assertEquals(result, '1 2');
        }
      },
      {
        name: '模板渲染 - 空值应返回 null',
        fn: () => {
          const result = this.suite.renderTemplate(null, { name: 'test' });
          this.suite.assertNull(result);
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  testEdgeCases() {
    const tests = [
      {
        name: '边界情况 - 分类 ID 应唯一',
        fn: () => {
          const items = this.suite.configData.home.collections.items;
          const ids = items.map(item => item.id);
          const uniqueIds = [...new Set(ids)];
          this.suite.assertEquals(ids.length, uniqueIds.length, 'Collection IDs should be unique');
        }
      },
      {
        name: '边界情况 - 评价评分应在 1-5 之间',
        fn: () => {
          const items = this.suite.configData.home.testimonials.items;
          items.forEach((item, index) => {
            this.suite.assertTrue(
              item.stars >= 1 && item.stars <= 5,
              `Testimonial ${index} stars out of range`
            );
          });
        }
      },
      {
        name: '边界情况 - JSON 配置应可序列化',
        fn: () => {
          const serialized = JSON.stringify(this.suite.configData);
          const deserialized = JSON.parse(serialized);
          this.suite.assertObjectEquals(
            Object.keys(this.suite.configData).sort(),
            Object.keys(deserialized).sort()
          );
        }
      }
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        test.fn();
        this.addResult(test.name, 'pass', null, performance.now() - start);
        if (this.options.verbose) log.success(test.name);
      } catch (e) {
        this.addResult(test.name, 'fail', e, performance.now() - start);
        if (!this.options.json) log.error(`${test.name}: ${e.message}`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Output Formatting
  // ═══════════════════════════════════════════════════════════════════════════

  outputText() {
    log.divider();
    log.header('📊 Test Summary');
    log.divider();
    
    const { total, passed, failed, skipped, duration } = this.results.summary;
    
    console.log(`Total:   ${total}`);
    console.log(`${colors.green}Passed:  ${passed} ✅${colors.reset}`);
    console.log(`${failed > 0 ? colors.red : ''}Failed:  ${failed} ❌${colors.reset}`);
    console.log(`${skipped > 0 ? colors.yellow : ''}Skipped: ${skipped} ⏭️${colors.reset}`);
    console.log(`Time:    ${duration}ms`);
    
    log.divider();
    
    if (failed === 0) {
      console.log(`\n${colors.green}${colors.bright}✅ All tests passed!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}${colors.bright}❌ ${failed} test(s) failed${colors.reset}\n`);
      
      // 显示失败的测试
      const failures = this.results.tests.filter(t => t.status === 'fail');
      if (failures.length > 0 && !this.options.verbose) {
        log.header('Failed Tests:');
        failures.forEach(test => {
          console.log(`  • ${test.name}`);
          if (test.error) {
            console.log(`    ${colors.dim}${test.error}${colors.reset}`);
          }
        });
        console.log('');
      }
    }
  }

  outputJSON() {
    const output = {
      timestamp: new Date().toISOString(),
      environment: 'node',
      nodeVersion: process.version,
      platform: process.platform,
      ...this.results
    };
    console.log(JSON.stringify(output, null, 2));
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CLI Argument Parsing
// ═════════════════════════════════════════════════════════════════════════════

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    verbose: args.includes('--verbose') || args.includes('-v'),
    json: args.includes('--json') || args.includes('-j'),
    ci: args.includes('--ci'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
${colors.bright}VeletSolo Config Test Runner${colors.reset}

Usage: node test-node.js [options]

Options:
  -v, --verbose    显示详细输出
  -j, --json       输出 JSON 格式结果
      --ci         CI 模式（失败时返回非零退出码）
  -h, --help       显示帮助信息

Examples:
  node test-node.js              # 运行所有测试
  node test-node.js --verbose    # 显示详细输出
  node test-node.js --json       # JSON 输出
  node test-node.js --ci         # CI 环境使用
`);
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  // 检查配置文件是否存在
  if (!fs.existsSync('./website-config.json')) {
    console.error(`${colors.red}Error: website-config.json not found${colors.reset}`);
    process.exit(1);
  }
  
  const runner = new NodeTestRunner(options);
  await runner.run();
}

// 运行测试
main().catch(e => {
  console.error(`${colors.red}Fatal error: ${e.message}${colors.reset}`);
  process.exit(1);
});
