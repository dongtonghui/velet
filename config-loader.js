/**
 * VeletSolo Config Loader
 * 配置加载引擎 - 实现"配置驱动内容，代码负责呈现"
 * 
 * 使用方法:
 * 1. 在 HTML 中引入: <script src="config-loader.js"></script>
 * 2. 配置会自动加载并渲染页面内容
 * 3. 修改 website-config.json 即可更新网站内容，无需修改代码
 */

(function() {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════════
  // Configuration State
  // ═════════════════════════════════════════════════════════════════════════════
  
  let configData = null;
  let configLoaded = false;
  const configCallbacks = [];

  // ═════════════════════════════════════════════════════════════════════════════
  // Utility Functions
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 模板渲染 - 替换 {variable} 格式的变量
   */
  function renderTemplate(template, variables) {
    if (typeof template !== 'string') return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * 批量设置文本内容
   */
  function setText(selector, content) {
    if (!content) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el) el.textContent = content;
    });
  }

  /**
   * 批量设置 HTML 内容
   */
  function setHTML(selector, html) {
    if (!html) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el) el.innerHTML = html;
    });
  }

  /**
   * 更新元素属性
   */
  function setAttribute(selector, attribute, value) {
    if (!value) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el) el.setAttribute(attribute, value);
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Configuration Loading
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 加载配置文件
   */
  async function loadConfig() {
    try {
      const response = await fetch('website-config.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      configData = await response.json();
      configLoaded = true;
      console.log('[ConfigLoader] Configuration loaded successfully');
      
      // 执行所有待处理的回调
      configCallbacks.forEach(callback => callback(configData));
      return configData;
    } catch (error) {
      console.error('[ConfigLoader] Failed to load configuration:', error);
      return null;
    }
  }

  /**
   * 获取全局配置
   */
  function getGlobal() {
    return configData?.global || {};
  }

  /**
   * 获取页面配置
   */
  function getPage(pageName) {
    return configData?.[pageName] || {};
  }

  /**
   * 获取当前页面配置
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.includes('index') || path === '/' ? 'home' : 
                     path.replace('.html', '').replace('/', '');
    return getPage(pageName);
  }

  /**
   * 等待配置加载完成
   */
  function onConfigLoaded(callback) {
    if (configLoaded) {
      callback(configData);
    } else {
      configCallbacks.push(callback);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // SEO & Meta Tags
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 更新 SEO 相关标签
   */
  function updateSEO(seoConfig, globalConfig) {
    if (!seoConfig) return;

    // 更新页面标题
    if (seoConfig.title) {
      document.title = seoConfig.title;
    }

    // 更新 meta description
    if (seoConfig.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = seoConfig.description;
    }

    // 更新 Open Graph 标签
    if (seoConfig.ogTitle) {
      setAttribute('meta[property="og:title"]', 'content', seoConfig.ogTitle);
    }
    if (seoConfig.ogDescription) {
      setAttribute('meta[property="og:description"]', 'content', seoConfig.ogDescription);
    }
    if (seoConfig.ogImage) {
      setAttribute('meta[property="og:image"]', 'content', seoConfig.ogImage);
    }

    // 更新主题色
    if (globalConfig?.seo?.themeColor) {
      setAttribute('meta[name="theme-color"]', 'content', globalConfig.seo.themeColor);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Page Renderers
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 渲染导航栏
   */
  function renderNavigation(navConfig, globalConfig) {
    if (!navConfig) return;

    // Logo
    setText('.nav-logo', navConfig.logo);

    // 导航链接 - 需要在HTML中保留结构，这里可以动态更新
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navConfig.links) {
      navLinks.innerHTML = navConfig.links.map(link => 
        `<li><a href="${link.href}">${link.label}</a></li>`
      ).join('');
    }

    // CTA 按钮
    const ctaBtn = document.querySelector('.nav-cta');
    if (ctaBtn && navConfig.cta) {
      ctaBtn.textContent = navConfig.cta.label;
      ctaBtn.href = navConfig.cta.href;
    }
  }

  /**
   * 渲染年龄验证门
   */
  function renderAgeGate(ageGateConfig) {
    if (!ageGateConfig) return;

    setText('#age-gate .ag-logo', ageGateConfig.logo);
    setText('#age-gate .ag-title', ageGateConfig.title);
    
    const descEl = document.querySelector('#age-gate > p:not(.ag-title):not(.legal)');
    if (descEl) descEl.textContent = ageGateConfig.description;
    
    const yesBtn = document.querySelector('.ag-btn-yes');
    const noBtn = document.querySelector('.ag-btn-no');
    if (yesBtn) yesBtn.textContent = ageGateConfig.confirmButton;
    if (noBtn) noBtn.textContent = ageGateConfig.declineButton;
    
    setText('#age-gate .legal', ageGateConfig.legalText);
  }

  /**
   * 渲染 Hero 区域
   */
  function renderHero(heroConfig, globalConfig) {
    if (!heroConfig) return;

    const variables = {
      customerCount: globalConfig?.trust?.customerCount || '40,000+'
    };

    setText('.hero-eyebrow', heroConfig.eyebrow);
    
    // Hero 标题 - 保留结构
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.innerHTML = `${heroConfig.title}<br><em>${heroConfig.titleEmphasis}</em><br>${heroConfig.titleEnd}`;
    }
    
    setText('.hero-subtitle', heroConfig.subtitle);
    setText('.hero-desc', renderTemplate(heroConfig.description, variables));
    setText('.scroll-indicator span', heroConfig.scrollIndicator);

    // CTA 按钮
    const primaryCta = document.querySelector('.hero-actions .btn-primary');
    const secondaryCta = document.querySelector('.hero-actions .btn-secondary');
    if (primaryCta && heroConfig.primaryCta) {
      primaryCta.textContent = heroConfig.primaryCta.label;
      primaryCta.href = heroConfig.primaryCta.href;
    }
    if (secondaryCta && heroConfig.secondaryCta) {
      secondaryCta.textContent = heroConfig.secondaryCta.label;
      secondaryCta.href = heroConfig.secondaryCta.href;
    }
  }

  /**
   * 渲染 Trust Bar
   */
  function renderTrustBar(trustConfig, globalConfig) {
    if (!trustConfig?.items) return;

    const variables = {
      customerCount: globalConfig?.trust?.customerCount || '40,000+'
    };

    const track = document.querySelector('.trust-track');
    if (!track) return;

    // 生成两组以实现无缝滚动
    const itemsHTML = trustConfig.items.map(item => 
      `<div class="trust-item"><span class="trust-icon">${item.icon}</span>${renderTemplate(item.text, variables)}</div>`
    ).join('');

    track.innerHTML = itemsHTML + itemsHTML;
  }

  /**
   * 渲染 Story 区域
   */
  function renderStory(storyConfig) {
    if (!storyConfig) return;

    setText('.story-section .section-tag', storyConfig.tag);
    
    const heading = document.querySelector('.story-heading');
    if (heading) {
      heading.innerHTML = `${storyConfig.heading}<br><em>${storyConfig.headingEmphasis}</em>`;
    }

    // 渲染段落
    const storyBodyElements = document.querySelectorAll('.story-body');
    if (storyBodyElements.length >= 2 && storyConfig.paragraphs) {
      storyConfig.paragraphs.forEach((para, index) => {
        if (storyBodyElements[index]) {
          storyBodyElements[index].innerHTML = `<strong style="color:var(--cream);font-weight:400;">${para.strong}</strong>${para.text}`;
        }
      });
    }

    // 引用
    const quote = document.querySelector('.story-quote');
    if (quote) {
      quote.textContent = `"${storyConfig.quote}"`;
    }

    // 关闭文本
    if (storyBodyElements.length >= 3) {
      storyBodyElements[2].textContent = storyConfig.closingText;
    }

    // CTA
    const cta = document.querySelector('.story-text .btn-primary');
    if (cta && storyConfig.cta) {
      cta.textContent = storyConfig.cta.label;
      cta.href = storyConfig.cta.href;
    }

    // 标签引用
    const label = document.querySelector('.story-label');
    if (label) {
      label.innerHTML = `${storyConfig.labelQuote}<br><em style="font-size:0.7rem;color:rgba(240,232,218,0.5);">— VeletSolo</em>`;
    }

    // 图片
    const img = document.querySelector('.story-bg-image');
    if (img && storyConfig.image) {
      img.src = storyConfig.image;
      img.alt = storyConfig.imageAlt || '';
    }
  }

  /**
   * 渲染 Collections 区域
   */
  function renderCollections(collectionsConfig) {
    if (!collectionsConfig) return;

    // Header
    const sectionTag = document.querySelector('#collections .section-tag');
    if (sectionTag) sectionTag.textContent = collectionsConfig.tag;

    const sectionTitle = document.querySelector('#collections .section-title');
    if (sectionTitle) {
      sectionTitle.innerHTML = `${collectionsConfig.title} <em>${collectionsConfig.titleEmphasis}</em> ${collectionsConfig.titleEnd}`;
    }

    const sectionSubtitle = document.querySelector('#collections .section-subtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = collectionsConfig.subtitle;

    // Cards
    if (!collectionsConfig.items) return;

    const catGrid = document.querySelector('.cat-grid');
    if (!catGrid) return;

    catGrid.innerHTML = collectionsConfig.items.map((item, index) => `
      <div class="cat-card reveal ${index > 0 ? `reveal-delay-${(index % 3) || 1}` : ''}" ${item.wide ? 'style="grid-column: span 2; aspect-ratio: 2/1.2;"' : ''}>
        <div class="cat-card-bg cat-bg-${(index % 5) + 1}">
          <div class="cat-card-bg-img" style="background-image: url('${item.image}')"></div>
          <div class="cat-pattern"></div>
        </div>
        <div class="cat-overlay"></div>
        <div class="cat-deco"></div>
        <div class="cat-icon">${item.icon}</div>
        <div class="cat-content">
          <div class="cat-tag">${item.tag}</div>
          <h3 class="cat-name">${item.name}</h3>
          <p class="cat-desc">${item.description}</p>
          <a href="${item.href}" class="cat-arrow">Explore <span>→</span></a>
        </div>
      </div>
    `).join('');
  }

  /**
   * 渲染 Spotlight 区域
   */
  function renderSpotlight(spotlightConfig) {
    if (!spotlightConfig) return;

    // Header
    const sectionTag = document.querySelector('.spotlight-section .section-tag');
    if (sectionTag) sectionTag.textContent = spotlightConfig.tag;

    const sectionTitle = document.querySelector('.spotlight-section .section-title');
    if (sectionTitle) {
      sectionTitle.innerHTML = `${spotlightConfig.title} <em>${spotlightConfig.titleEmphasis}</em><br>${spotlightConfig.titleEnd}`;
    }

    if (!spotlightConfig.products) return;

    // Spotlight cards
    const spotlightCards = document.querySelector('.spotlight-cards');
    if (spotlightCards) {
      spotlightCards.innerHTML = spotlightConfig.products.map((product, index) => `
        <div class="spotlight-card ${index === 0 ? 'active' : ''} reveal ${index > 0 ? `reveal-delay-${(index % 4) || 1}` : ''}" data-index="${index}">
          <div class="sp-num">${String(index + 1).padStart(2, '0')}</div>
          <div class="sp-info">
            <div class="sp-title">${product.name}</div>
            <div class="sp-sub">${product.subtitle}</div>
          </div>
          <div class="sp-badge">${product.badge}</div>
        </div>
      `).join('');
    }

    // 默认显示第一个产品详情
    updateSpotlightDetail(spotlightConfig.products[0]);

    // 绑定点击事件
    setTimeout(() => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const index = parseInt(card.dataset.index);
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          updateSpotlightDetail(spotlightConfig.products[index]);
        });
      });
    }, 0);
  }

  /**
   * 更新 Spotlight 详情
   */
  function updateSpotlightDetail(product) {
    if (!product) return;

    const iconEl = document.getElementById('product-icon');
    const nameEl = document.querySelector('.si-name');
    const descEl = document.querySelector('.si-desc');
    const priceEl = document.getElementById('product-price');
    const tagsEl = document.querySelector('.si-tags');
    const btnEl = document.querySelector('.si-btn');
    const imgEl = document.getElementById('product-img');
    const artContainer = document.getElementById('product-art');
    const imgContainer = document.getElementById('product-image-container');

    if (iconEl) iconEl.textContent = product.icon;
    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description;
    if (priceEl) priceEl.textContent = product.price;
    if (tagsEl) {
      tagsEl.innerHTML = product.tags.map(t => `<span class="si-tag">${t}</span>`).join('');
    }
    if (btnEl) btnEl.textContent = `Add to Cart — ${product.price}`;

    // 图片处理
    if (product.image && imgEl && artContainer && imgContainer) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
      artContainer.style.display = 'none';
      imgContainer.style.display = 'flex';
    }
  }

  /**
   * 渲染 Philosophy 区域
   */
  function renderPhilosophy(philosophyConfig) {
    if (!philosophyConfig) return;

    const sectionTag = document.querySelector('.philosophy-section .section-tag');
    if (sectionTag) sectionTag.textContent = philosophyConfig.tag;

    const quote = document.querySelector('.philosophy-quote');
    if (quote) {
      quote.innerHTML = `"${philosophyConfig.quote.replace('{emphasis}', `<strong>${philosophyConfig.quoteEmphasis}</strong>`)}"`;
    }

    const attr = document.querySelector('.philosophy-attr');
    if (attr) attr.textContent = `— ${philosophyConfig.attribution}`;

    // Pillars
    if (!philosophyConfig.pillars) return;

    const pillarsContainer = document.querySelector('.philosophy-pillars');
    if (pillarsContainer) {
      pillarsContainer.innerHTML = philosophyConfig.pillars.map((pillar, index) => `
        <div class="pillar reveal ${index > 0 ? `reveal-delay-${index}` : ''}">
          <span class="pillar-icon">${pillar.icon}</span>
          <div class="pillar-title">${pillar.title}</div>
          <p class="pillar-text">${pillar.text}</p>
        </div>
      `).join('');
    }
  }

  /**
   * 渲染 Testimonials 区域
   */
  function renderTestimonials(testimonialsConfig) {
    if (!testimonialsConfig) return;

    const sectionTag = document.querySelector('.testimonials-section .section-tag');
    if (sectionTag) sectionTag.textContent = testimonialsConfig.tag;

    const sectionTitle = document.querySelector('.testimonials-section .section-title');
    if (sectionTitle) {
      sectionTitle.innerHTML = `${testimonialsConfig.title} <em>${testimonialsConfig.titleEmphasis}</em>`;
    }

    if (!testimonialsConfig.items) return;

    const grid = document.querySelector('.testimonials-grid');
    if (grid) {
      grid.innerHTML = testimonialsConfig.items.map((item, index) => `
        <div class="testimonial-card reveal ${index > 0 ? `reveal-delay-${index}` : ''}">
          <div class="t-stars">${'★'.repeat(item.stars)}</div>
          <p class="t-text">"${item.text}"</p>
          <div class="t-author">
            <div class="t-avatar">${item.initial}</div>
            <div>
              <div class="t-name">${item.author}</div>
              <div class="t-location">${item.location}</div>
            </div>
            ${item.verified ? '<div class="t-verified">✓ Verified</div>' : ''}
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * 渲染 Trust Pillars 区域
   */
  function renderTrustPillars(trustConfig) {
    if (!trustConfig?.items) return;

    const grid = document.querySelector('.trust-grid');
    if (grid) {
      grid.innerHTML = trustConfig.items.map((item, index) => `
        <div class="trust-card reveal ${index > 0 ? `reveal-delay-${index}` : ''}">
          <span class="trust-icon-lg">${item.icon}</span>
          <div class="trust-card-title">${item.title}</div>
          <p class="trust-card-text">${item.text}</p>
        </div>
      `).join('');
    }
  }

  /**
   * 渲染 FAQ 区域
   */
  function renderFAQ(faqConfig) {
    if (!faqConfig) return;

    const sectionTag = document.querySelector('.faq-section .section-tag');
    if (sectionTag) sectionTag.textContent = faqConfig.tag;

    const sectionTitle = document.querySelector('.faq-section .section-title');
    if (sectionTitle) {
      sectionTitle.innerHTML = `${faqConfig.title} <em>${faqConfig.titleEmphasis}</em>`;
    }

    const sectionSubtitle = document.querySelector('.faq-section .section-subtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = faqConfig.subtitle;

    // Categories
    if (faqConfig.categories) {
      const catsContainer = document.querySelector('.faq-cats');
      if (catsContainer) {
        catsContainer.innerHTML = faqConfig.categories.map((cat, index) => `
          <button class="faq-cat-btn ${index === 0 ? 'active' : ''}" data-cat="${cat.id}">${cat.label}</button>
        `).join('');
      }
    }

    // FAQ Items
    if (!faqConfig.items) return;

    const faqList = document.getElementById('faq-list');
    if (faqList) {
      faqList.innerHTML = faqConfig.items.map((item, index) => `
        <div class="faq-item reveal" data-cat="${item.category}">
          <button class="faq-question" onclick="toggleFAQ(this)">
            <span class="faq-q-num">${String(index + 1).padStart(2, '0')}</span>
            <span class="faq-q-text">${item.question}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              <div class="faq-answer-content">
                ${item.answer}
                ${item.tags ? item.tags.map(tag => `<span class="answer-tag">${tag}</span>`).join('') : ''}
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * 渲染 Newsletter 区域
   */
  function renderNewsletter(newsletterConfig) {
    if (!newsletterConfig) return;

    setText('.newsletter-eyebrow', newsletterConfig.eyebrow);
    
    const title = document.querySelector('.newsletter-title');
    if (title) {
      title.innerHTML = `${newsletterConfig.title}<br><em>${newsletterConfig.titleEmphasis}</em>`;
    }

    setText('.newsletter-sub', newsletterConfig.subtitle);
    
    const input = document.querySelector('.newsletter-input');
    if (input) input.placeholder = newsletterConfig.placeholder;

    const btn = document.querySelector('.newsletter-btn');
    if (btn) btn.textContent = newsletterConfig.button;

    setText('.newsletter-disclaimer', newsletterConfig.disclaimer);
  }

  /**
   * 渲染 Footer
   */
  function renderFooter(footerConfig) {
    if (!footerConfig) return;

    setText('.footer-logo', footerConfig.logo);
    setText('.footer-tagline', footerConfig.tagline);

    // Socials
    if (footerConfig.socials) {
      const socialsContainer = document.querySelector('.footer-socials');
      if (socialsContainer) {
        socialsContainer.innerHTML = footerConfig.socials.map(social => `
          <a href="${social.href}" class="social-link" aria-label="${social.ariaLabel}">${social.label}</a>
        `).join('');
      }
    }

    // Columns
    if (footerConfig.columns) {
      const footerGrid = document.querySelector('.footer-grid');
      if (footerGrid) {
        // 保留第一个品牌列
        const brandColumn = footerGrid.querySelector('.footer-brand');
        
        footerGrid.innerHTML = '';
        if (brandColumn) footerGrid.appendChild(brandColumn);

        footerConfig.columns.forEach(col => {
          const colDiv = document.createElement('div');
          colDiv.innerHTML = `
            <div class="footer-col-title">${col.title}</div>
            <ul class="footer-links">
              ${col.links.map(link => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
            </ul>
          `;
          footerGrid.appendChild(colDiv);
        });
      }
    }

    setText('.footer-legal', footerConfig.legal);
    setText('.footer-copy', footerConfig.copyright);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Main Render Function
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 渲染首页
   */
  function renderHomePage() {
    const global = getGlobal();
    const home = getPage('home');
    const nav = configData?.navigation;
    const ageGate = configData?.ageGate;
    const footer = configData?.footer;

    console.log('[ConfigLoader] Rendering home page...');

    // 按顺序渲染各模块
    renderAgeGate(ageGate);
    renderNavigation(nav, global);
    renderHero(home.hero, global);
    renderTrustBar(home.trustBar, global);
    renderStory(home.story);
    renderCollections(home.collections);
    renderSpotlight(home.spotlight);
    renderPhilosophy(home.philosophy);
    renderTestimonials(home.testimonials);
    renderTrustPillars(home.trustPillars);
    renderFAQ(home.faq);
    renderNewsletter(home.newsletter);
    renderFooter(footer);

    // 重新初始化滚动动画
    initScrollReveal();

    console.log('[ConfigLoader] Home page rendered successfully');
  }

  /**
   * 初始化滚动显示动画
   */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Auto Initialization
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 自动初始化
   */
  function autoInit() {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /**
   * 初始化
   */
  async function init() {
    await loadConfig();
    if (!configData) {
      console.error('[ConfigLoader] Failed to initialize - config not loaded');
      return;
    }

    // 根据页面路径决定渲染哪个页面
    const path = window.location.pathname;
    const pageName = path.includes('index') || path === '/' || path === '' ? 'home' :
                     path.replace('.html', '').replace(/^\//, '');

    console.log(`[ConfigLoader] Detected page: ${pageName}`);

    switch (pageName) {
      case 'home':
        renderHomePage();
        break;
      default:
        console.log(`[ConfigLoader] No specific renderer for page: ${pageName}`);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Public API
  // ═════════════════════════════════════════════════════════════════════════════

  window.ConfigLoader = {
    load: loadConfig,
    getGlobal: getGlobal,
    getPage: getPage,
    getCurrentPage: getCurrentPage,
    onLoaded: onConfigLoaded,
    renderHome: renderHomePage,
    renderTemplate: renderTemplate,
    updateSEO: updateSEO
  };

  // 自动启动
  autoInit();

})();
