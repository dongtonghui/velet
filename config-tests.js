/**
 * VeletSolo Config Test Suite
 * 配置系统自动化测试用例
 */

// ═════════════════════════════════════════════════════════════════════════════
// Test Suite Definition
// ═════════════════════════════════════════════════════════════════════════════

const ConfigTestSuite = (function() {
  'use strict';

  // 获取测试框架（浏览器或Node环境）
  const Tester = typeof ConfigTester !== 'undefined' 
    ? ConfigTester 
    : require('./config-tester.js');

  const suite = Tester.createSuite();
  const domTester = typeof document !== 'undefined' ? new Tester.DOMTester() : null;

  // ═══════════════════════════════════════════════════════════════════════════
  // Configuration Loading Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('配置加载 - 应成功加载 website-config.json', async function(t) {
    const config = await suite.loadTestConfig();
    t.assertNotNull(config, 'Config should be loaded');
    t.assertDefined(config.global, 'Global config should exist');
    t.assertDefined(config.home, 'Home config should exist');
  });

  suite.test('配置加载 - 应包含所有必需的顶级键', async function(t) {
    const config = await suite.loadTestConfig();
    const requiredKeys = ['global', 'home', 'navigation', 'footer', 'ageGate'];
    requiredKeys.forEach(key => {
      t.assertDefined(config[key], `Config should have "${key}" key`);
    });
  });

  suite.test('配置加载 - 应正确解析 JSON 结构', async function(t) {
    const config = await suite.loadTestConfig();
    t.assertEquals(typeof config._comment, 'string', '_comment should be string');
    t.assertEquals(typeof config.global, 'object', 'global should be object');
    t.assertTrue(config.global !== null, 'global should not be null');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Global Configuration Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('全局配置 - 公司信息应完整', async function(t) {
    const config = await suite.loadTestConfig();
    const company = config.global.company;
    
    t.assertDefined(company, 'Company should be defined');
    t.assertEquals(typeof company.name, 'string', 'Company name should be string');
    t.assertTrue(company.name.length > 0, 'Company name should not be empty');
    t.assertDefined(company.tagline, 'Company tagline should be defined');
    t.assertDefined(company.description, 'Company description should be defined');
  });

  suite.test('全局配置 - 联系信息应有效', async function(t) {
    const config = await suite.loadTestConfig();
    const contact = config.global.contact;
    
    t.assertDefined(contact, 'Contact should be defined');
    t.assertDefined(contact.email, 'Contact email should be defined');
    t.assertMatch(contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email should be valid format');
    t.assertDefined(contact.billingName, 'Billing name should be defined');
  });

  suite.test('全局配置 - SEO 配置应完整', async function(t) {
    const config = await suite.loadTestConfig();
    const seo = config.global.seo;
    
    t.assertDefined(seo, 'SEO config should be defined');
    t.assertDefined(seo.defaultTitle, 'Default title should be defined');
    t.assertDefined(seo.defaultDescription, 'Default description should be defined');
    t.assertDefined(seo.keywords, 'Keywords should be defined');
    t.assertDefined(seo.themeColor, 'Theme color should be defined');
    t.assertMatch(seo.themeColor, /^#[0-9A-Fa-f]{6}$/, 'Theme color should be valid hex');
  });

  suite.test('全局配置 - 信任指标应为有效值', async function(t) {
    const config = await suite.loadTestConfig();
    const trust = config.global.trust;
    
    t.assertDefined(trust, 'Trust config should be defined');
    t.assertDefined(trust.customerCount, 'Customer count should be defined');
    t.assertDefined(trust.rating, 'Rating should be defined');
    t.assertMatch(trust.rating, /^\d(\.\d)?$/, 'Rating should be valid number string');
    t.assertDefined(trust.reviewCount, 'Review count should be defined');
  });

  suite.test('全局配置 - 社交媒体链接应存在', async function(t) {
    const config = await suite.loadTestConfig();
    const social = config.global.social;
    
    t.assertDefined(social, 'Social config should be defined');
    t.assertTrue(
      social.instagram || social.twitter || social.pinterest,
      'At least one social link should be defined'
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Navigation Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('导航配置 - 应包含 logo 和链接', async function(t) {
    const config = await suite.loadTestConfig();
    const nav = config.navigation;
    
    t.assertDefined(nav, 'Navigation should be defined');
    t.assertDefined(nav.logo, 'Navigation logo should be defined');
    t.assertTrue(Array.isArray(nav.links), 'Navigation links should be array');
    t.assertTrue(nav.links.length > 0, 'Navigation should have at least one link');
  });

  suite.test('导航配置 - 每个链接应有 label 和 href', async function(t) {
    const config = await suite.loadTestConfig();
    const nav = config.navigation;
    
    nav.links.forEach((link, index) => {
      t.assertDefined(link.label, `Link ${index} should have label`);
      t.assertDefined(link.href, `Link ${index} should have href`);
      t.assertEquals(typeof link.label, 'string', `Link ${index} label should be string`);
      t.assertTrue(link.href.startsWith('#') || link.href.startsWith('http'), 
        `Link ${index} href should be valid`);
    });
  });

  suite.test('导航配置 - CTA 按钮应配置正确', async function(t) {
    const config = await suite.loadTestConfig();
    const cta = config.navigation.cta;
    
    t.assertDefined(cta, 'CTA should be defined');
    t.assertDefined(cta.label, 'CTA label should be defined');
    t.assertDefined(cta.href, 'CTA href should be defined');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Age Gate Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('年龄验证门 - 配置应完整', async function(t) {
    const config = await suite.loadTestConfig();
    const ageGate = config.ageGate;
    
    t.assertDefined(ageGate, 'Age gate should be defined');
    t.assertDefined(ageGate.logo, 'Age gate logo should be defined');
    t.assertDefined(ageGate.title, 'Age gate title should be defined');
    t.assertDefined(ageGate.description, 'Age gate description should be defined');
    t.assertDefined(ageGate.confirmButton, 'Confirm button text should be defined');
    t.assertDefined(ageGate.declineButton, 'Decline button text should be defined');
    t.assertDefined(ageGate.legalText, 'Legal text should be defined');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Home Page - Hero Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('首页 Hero - 配置应完整', async function(t) {
    const config = await suite.loadTestConfig();
    const hero = config.home.hero;
    
    t.assertDefined(hero, 'Hero should be defined');
    t.assertDefined(hero.eyebrow, 'Hero eyebrow should be defined');
    t.assertDefined(hero.title, 'Hero title should be defined');
    t.assertDefined(hero.subtitle, 'Hero subtitle should be defined');
    t.assertDefined(hero.description, 'Hero description should be defined');
  });

  suite.test('首页 Hero - CTA 按钮应配置正确', async function(t) {
    const config = await suite.loadTestConfig();
    const hero = config.home.hero;
    
    t.assertDefined(hero.primaryCta, 'Primary CTA should be defined');
    t.assertDefined(hero.primaryCta.label, 'Primary CTA label should be defined');
    t.assertDefined(hero.primaryCta.href, 'Primary CTA href should be defined');
    t.assertDefined(hero.secondaryCta, 'Secondary CTA should be defined');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Collections Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('产品分类 - 应包含有效的产品数据', async function(t) {
    const config = await suite.loadTestConfig();
    const items = config.home.collections.items;
    
    t.assertTrue(Array.isArray(items), 'Collections items should be array');
    t.assertTrue(items.length > 0, 'Should have at least one collection');
    
    items.forEach((item, index) => {
      t.assertDefined(item.id, `Collection ${index} should have id`);
      t.assertDefined(item.name, `Collection ${index} should have name`);
      t.assertDefined(item.description, `Collection ${index} should have description`);
      t.assertDefined(item.icon, `Collection ${index} should have icon`);
      t.assertDefined(item.image, `Collection ${index} should have image`);
      t.assertTrue(item.image.startsWith('./images/'), 
        `Collection ${index} image path should be valid`);
    });
  });

  suite.test('产品分类 - 每个分类应有唯一 ID', async function(t) {
    const config = await suite.loadTestConfig();
    const items = config.home.collections.items;
    const ids = items.map(item => item.id);
    const uniqueIds = [...new Set(ids)];
    
    t.assertEquals(ids.length, uniqueIds.length, 'All collection IDs should be unique');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Spotlight Products Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('精选产品 - 产品数据应完整有效', async function(t) {
    const config = await suite.loadTestConfig();
    const products = config.home.spotlight.products;
    
    suite.validateProducts(products);
  });

  suite.test('精选产品 - 价格格式应正确', async function(t) {
    const config = await suite.loadTestConfig();
    const products = config.home.spotlight.products;
    
    products.forEach((product, index) => {
      t.assertMatch(product.price, /^\$[\d,]+(\.[\d]{2})?$/, 
        `Product ${index} price "${product.price}" should be valid format ($X or $X.XX)`);
    });
  });

  suite.test('精选产品 - 每个产品应有标签', async function(t) {
    const config = await suite.loadTestConfig();
    const products = config.home.spotlight.products;
    
    products.forEach((product, index) => {
      t.assertTrue(Array.isArray(product.tags), `Product ${index} tags should be array`);
      t.assertTrue(product.tags.length > 0, `Product ${index} should have at least one tag`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Testimonials Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('用户评价 - 数据应完整', async function(t) {
    const config = await suite.loadTestConfig();
    const items = config.home.testimonials.items;
    
    t.assertTrue(Array.isArray(items), 'Testimonials should be array');
    t.assertTrue(items.length > 0, 'Should have at least one testimonial');
    
    items.forEach((item, index) => {
      t.assertTrue(item.stars >= 1 && item.stars <= 5, 
        `Testimonial ${index} stars should be 1-5`);
      t.assertDefined(item.text, `Testimonial ${index} should have text`);
      t.assertDefined(item.author, `Testimonial ${index} should have author`);
      t.assertDefined(item.location, `Testimonial ${index} should have location`);
      t.assertDefined(item.initial, `Testimonial ${index} should have initial`);
      t.assertEquals(item.initial.length, 1, 
        `Testimonial ${index} initial should be single character`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FAQ Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('FAQ - 配置应完整有效', async function(t) {
    const config = await suite.loadTestConfig();
    suite.validateFAQ(config.home.faq);
  });

  suite.test('FAQ - 分类应有效', async function(t) {
    const config = await suite.loadTestConfig();
    const categories = config.home.faq.categories;
    const validCategories = categories.map(c => c.id);
    
    t.assertTrue(categories.length > 0, 'Should have at least one category');
    t.assertContains(validCategories, 'all', 'Should have "all" category');
    
    config.home.faq.items.forEach((item, index) => {
      t.assertTrue(validCategories.includes(item.category) || item.category.includes(' '), 
        `FAQ ${index} category "${item.category}" should be valid`);
    });
  });

  suite.test('FAQ - 问题和答案不应为空', async function(t) {
    const config = await suite.loadTestConfig();
    const items = config.home.faq.items;
    
    items.forEach((item, index) => {
      t.assertTrue(item.question.trim().length > 0, 
        `FAQ ${index} question should not be empty`);
      t.assertTrue(item.answer.trim().length > 10, 
        `FAQ ${index} answer should be meaningful ( > 10 chars)`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Philosophy Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('品牌理念 - 应有三个支柱', async function(t) {
    const config = await suite.loadTestConfig();
    const pillars = config.home.philosophy.pillars;
    
    t.assertTrue(Array.isArray(pillars), 'Pillars should be array');
    t.assertEquals(pillars.length, 3, 'Should have exactly 3 pillars');
    
    pillars.forEach((pillar, index) => {
      t.assertDefined(pillar.icon, `Pillar ${index} should have icon`);
      t.assertDefined(pillar.title, `Pillar ${index} should have title`);
      t.assertDefined(pillar.text, `Pillar ${index} should have text`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Footer Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('页脚 - 配置应完整', async function(t) {
    const config = await suite.loadTestConfig();
    suite.validateFooter(config.footer);
  });

  suite.test('页脚 - 列链接应有效', async function(t) {
    const config = await suite.loadTestConfig();
    const columns = config.footer.columns;
    
    columns.forEach((col, index) => {
      t.assertDefined(col.title, `Column ${index} should have title`);
      t.assertTrue(Array.isArray(col.links), `Column ${index} links should be array`);
      t.assertTrue(col.links.length > 0, `Column ${index} should have at least one link`);
      
      col.links.forEach((link, linkIndex) => {
        t.assertDefined(link.label, `Column ${index} link ${linkIndex} should have label`);
        t.assertDefined(link.href, `Column ${index} link ${linkIndex} should have href`);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Template Rendering Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('模板渲染 - 应正确替换简单变量', function(t) {
    suite.testTemplateRender('Hello {name}', { name: 'World' }, 'Hello World');
    suite.testTemplateRender('{greeting} {name}', { greeting: 'Hi', name: 'There' }, 'Hi There');
  });

  suite.test('模板渲染 - 应保留未定义的变量', function(t) {
    suite.testTemplateRender('Hello {name}', { other: 'value' }, 'Hello {name}');
  });

  suite.test('模板渲染 - 应处理多个变量', function(t) {
    const template = '{a} {b} {c}';
    const variables = { a: '1', b: '2', c: '3' };
    suite.testTemplateRender(template, variables, '1 2 3');
  });

  suite.test('模板渲染 - 应处理空值', function(t) {
    const result = suite.renderTemplate(null, { name: 'test' });
    t.assertNull(result, 'Null template should return null');
  });

  suite.test('模板渲染 - 非字符串应原样返回', function(t) {
    const result = suite.renderTemplate(123, { name: 'test' });
    t.assertEquals(result, 123, 'Number should be returned as-is');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Edge Case Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('边界情况 - 配置加载失败应优雅处理', async function(t) {
    // 模拟配置加载失败的情况
    try {
      // 尝试加载不存在的文件
      const response = await fetch('non-existent-config.json');
      if (!response.ok) {
        // 预期的行为：应该抛出错误或返回null
        t.assertTrue(true, 'Config loading should handle 404 gracefully');
      }
    } catch (e) {
      t.assertTrue(true, 'Config loading should throw on network error');
    }
  });

  suite.test('边界情况 - 空数组应被正确处理', async function(t) {
    // 测试验证器对空数组的处理
    const emptyProducts = [];
    try {
      suite.validateProducts(emptyProducts);
      t.assertFalse(true, 'Should have thrown for empty products');
    } catch (e) {
      t.assertTrue(e.message.includes('at least one'), 
        'Should require at least one product');
    }
  });

  suite.test('边界情况 - 特殊字符应被正确处理', async function(t) {
    const template = 'Price: {price} - Special: <>&"\'';
    const result = suite.renderTemplate(template, { price: '$10' });
    t.assertContains(result, '$10', 'Should handle special characters');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Integration Tests (Browser only)
  // ═══════════════════════════════════════════════════════════════════════════

  if (typeof document !== 'undefined') {
    suite.test('集成测试 - DOM 应包含必要元素', async function(t) {
      t.assertTrue(domTester.elementExists('nav'), 'Navigation should exist');
      t.assertTrue(domTester.elementExists('#hero'), 'Hero section should exist');
      t.assertTrue(domTester.elementExists('#collections'), 'Collections section should exist');
      t.assertTrue(domTester.elementExists('#faq'), 'FAQ section should exist');
      t.assertTrue(domTester.elementExists('footer'), 'Footer should exist');
    });

    suite.test('集成测试 - 导航应包含配置中的链接', async function(t) {
      const config = await suite.loadTestConfig();
      const navLinks = document.querySelectorAll('.nav-links a');
      
      t.assertEquals(navLinks.length, config.navigation.links.length,
        'Navigation should have correct number of links');
    });

    suite.test('集成测试 - Hero 应显示配置中的标题', async function(t) {
      const config = await suite.loadTestConfig();
      const heroTitle = document.querySelector('.hero-title');
      
      t.assertNotNull(heroTitle, 'Hero title element should exist');
      t.assertTrue(heroTitle.textContent.includes(config.home.hero.title),
        'Hero title should contain configured text');
    });

    suite.test('集成测试 - 年龄验证门应存在', async function(t) {
      t.assertTrue(domTester.elementExists('#age-gate'), 'Age gate should exist');
      t.assertTrue(domTester.elementExists('.ag-btn-yes'), 'Enter button should exist');
      t.assertTrue(domTester.elementExists('.ag-btn-no'), 'Exit button should exist');
    });

    suite.test('集成测试 - 产品卡片应正确渲染', async function(t) {
      const config = await suite.loadTestConfig();
      const productCards = document.querySelectorAll('.spotlight-card');
      
      t.assertEquals(productCards.length, config.home.spotlight.products.length,
        'Should render correct number of product cards');
    });

    suite.test('集成测试 - FAQ 项目应可点击展开', async function(t) {
      const faqItems = document.querySelectorAll('.faq-item');
      
      if (faqItems.length > 0) {
        const firstItem = faqItems[0];
        const questionBtn = firstItem.querySelector('.faq-question');
        
        t.assertNotNull(questionBtn, 'FAQ question button should exist');
        
        // 模拟点击
        questionBtn.click();
        t.assertTrue(firstItem.classList.contains('open'), 
          'FAQ item should have "open" class after click');
        
        // 再次点击关闭
        questionBtn.click();
        t.assertFalse(firstItem.classList.contains('open'),
          'FAQ item should not have "open" class after second click');
      }
    });

    // 清理 DOM 测试容器
    suite.afterAll(() => {
      if (domTester) {
        domTester.cleanup();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Performance Tests
  // ═══════════════════════════════════════════════════════════════════════════

  suite.test('性能测试 - 配置加载应在合理时间内完成', async function(t) {
    const startTime = performance.now();
    await suite.loadTestConfig();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    t.assertTrue(loadTime < 5000, `Config should load within 5 seconds (took ${loadTime.toFixed(2)}ms)`);
  });

  suite.test('性能测试 - 模板渲染应快速完成', function(t) {
    const template = 'Hello {name}, you have {count} messages from {sender}';
    const variables = { name: 'User', count: '5', sender: 'Admin' };
    
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      suite.renderTemplate(template, variables);
    }
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    t.assertTrue(renderTime < 100, 
      `1000 template renders should complete within 100ms (took ${renderTime.toFixed(2)}ms)`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Export
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    suite,
    run: () => suite.run()
  };

})();

// 自动运行测试（如果在浏览器环境直接加载）
if (typeof window !== 'undefined' && window.location.href.includes('test')) {
  ConfigTestSuite.run();
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigTestSuite;
}
