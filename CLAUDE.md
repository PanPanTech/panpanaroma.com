# panpanaroma.com — 站点说明（给 Claude / 任何 AI 助手）

## 站点定位
- PanPan Aroma：英文 B2B 站，面向海外采购的**精油批发、基础油、贴牌 / OEM（private label）**询价。
- 运营主体：广州米娅生物科技有限公司（`content/site.json` 的 `legalName`）；对外按“合作制造关系”表述，不自称工厂，除非有证据。
- 目标：Google 自然搜索 + AI 搜索（ChatGPT / Perplexity / Google AI 模式）引用 → 询盘（报价 / 样品 / 联系表单）。
- 市场：全球英文。

## 品牌与事实（页面、JSON-LD、llms.txt 必须一致）
- 规范域名：`https://www.panpanaroma.com`；`panpanaroma.com` 301 到 www（Worker 内实现）。
- 地点：Guangzhou, China。
- 55 个产品候选（46 精油、3 植物原料询价、6 基础油）全部是**询价候选**：`pending` / `noindex`，不在 sitemap 中。核验前不得写成现货、固定价格或已认证规格。
- TODO（人工确认）：对外邮箱 / 电话 / WhatsApp、MOQ、交期、可提供的 COA/SDS/IFRA 文件范围、Miyaa 关系与空白品牌方案。
- 不确定的事实（认证、价格、纯度、产地、案例）不要编造，留 TODO。

## 内容规范（精油类特别注意）
- **禁止未经证实的功效 / 医疗声明**：不写 cure、treat、heal、relieve pain/anxiety/insomnia、antibacterial/antiviral/anti-inflammatory、boost immunity、detox、therapeutic grade、clinically proven 等；不暗示可食用 / 内服，不对孕妇、儿童、宠物给使用建议。香气描述只写气味特征和常见用途类别（香薰、按摩油配方原料、个护配方原料、蜡烛 / 香氛）。
- 不凭名称、图片或旧标签推定**纯度、有机、工艺、产地、认证**；“100% pure / organic / USDA / ECOCERT / GMP”等只有在有对应主体 + SKU/批次的证据时才可写，并注明范围。
- SDS / COA / 检测报告按主体、SKU / 批次、版本映射，**不推成全品类认证**。
- 历史报价不是现价；页面不放价格，统一走询价。
- 客户私价、个人信息、配方、合同、申报原件不得进入 `public/`、博客或 llms.txt。
- 图片：**禁止使用 MUMIANHUA / 木棉花品牌的任何照片或商品图**（主视觉、包装、套装、卡片、详情都不行），不得因旧“可用”记录恢复；`content/image-policy.json` + `scripts/check-release.mjs` 用 SHA256 拦截。优先使用已授权的 MIYUKI 10ml 照片。
- 每篇博客：开头 40–60 字直接回答（便于 AI 引用）+ 对比表 / 检查清单 + 询价 CTA；结尾 FAQ。标题 ≤ 60 字符，description ≤ 155 字符。
- 内链：博客 → 品类页（/essential-oils/、/carrier-oils/、/private-label-essential-oils/ 等）→ 询价表单。

## 关键词策略
依据 GSC 2026-08-24 ~ 11-23（3 个月：1 点击 / 367 曝光 / 平均排名 35.9）。新站，量很小，先修技术问题再追词。
- **主攻（商业意图，目前排名 60–90，要靠品类页 + 博客内链拉升）**：essential oils wholesale private label、essential oil distributors / suppliers、aroma oil wholesale、bulk / wholesale citrus oils supplier、private label essential oils、wholesale carrier oils、massage oil manufacturer。
- **已有前 15 名的长尾（优先改标题 / 开头，争取点击）**：herb fragrance oils supplier（10）、essential oils order form（15）、spicy / woody essential oil suppliers（11–13）、aroma oil suppliers（7）、aromatherapy oils wholesale（9）。
- **问句 / 对比型（AI 引用机会）**：fragrance oil vs essential oil for diffuser、essential vs fragrance oils → `/resources/essential-oils-vs-fragrance-oils` 开头给直接结论。
- 意外但可接：3pl for essential oils usa、packaging huile essentielle（法语）—— 暂不专门追。
- 排名靠前但 0 点击的博客：plan-first-wholesale-essential-oil-order（7.9）、aroma-shortlist-for-wholesale-buyers（5.9）、essential-oil-rfq-checklist（5.9）、resources/bulk-vs-bottled-essential-oils（7.4）→ 优先改 title/description。

## 技术
- 框架：Next.js 风格 App Router，由 vinext/Vite 构建为 **Cloudflare Worker**（`npm run build` → `dist/`）。不是 GitHub Pages。
- 部署：`.github/workflows/deploy-cloudflare-worker.yml`，**push `main` 即部署**到所有者的 Cloudflare 账号（Worker `panpanaroma`，域名见 `deploy/cloudflare-worker.json`）。PR 只跑测试和构建。没有本地定时部署。
- `.openai/hosting.json` 保留旧 OpenAI Sites 项目（过渡期，见 `MIGRATION.md`）。
- 编辑源：⚠️ 工作区规则曾写“`../miya-essential-oils` 是唯一编辑源、本仓库是发布镜像”，但该目录无 Git 远程、最后提交 2026-10-27、没有 GA4，而 10-31 之后的部署 / 域名 / GA4 改动都只在本仓库。**现在线上 = 本仓库 `main`**。TODO：由用户确认是否把本仓库定为唯一编辑源，避免两边分叉。
- 内容：`content/*.json`（site / pages / catalog / blog / image-policy）；`app/sitemap.ts`、`app/robots.ts` 由 `lib/discovery.ts` 生成（只收录 launch 后的页面、博客，不含 pending 产品）。
- ⚠️ **URL 规范化 bug（2026-11-24 发现，未修）**：线上带斜杠网址 308 跳到不带斜杠，但 `<link rel="canonical">` 和 sitemap 都输出**带斜杠**网址 → 规范网址本身是跳转页。GSC 同一页面出现 www/非 www、带/不带斜杠、`?category=` / `?aroma=` 多个版本。修复时让 canonical、sitemap、内链、Worker 跳转统一成一种形式（二选一），并对筛选参数保持 canonical 指向无参数版本。
- 索引（2026-11-24）：已编入 64；未编入 746 = robots 屏蔽 258、404 195、noindex 166（产品候选，预期内）、自动重定向 109、重复无规范 11、已发现/已抓取未编入各 3。
- robots：禁止 `/api/`、`/inbox/`、`/request-quote/`、`/request-samples/`。
- `llms.txt`：**尚无**（线上 404）。新增时放 `public/llms.txt` 或路由生成，并与 sitemap 同步。
- GA4：`G-QQJ398FJZB`（媒体资源 561882177，账号 PanPanTech 414295528），代码在 `app/layout.tsx`，全站 page_view。90 天（8-26 ~ 11-23）：78 会话，Direct 71（互动 5 秒，多为机器人 / 自访）、Organic 7；关键事件 0；81% 浏览量在首页。
- 转化事件：**尚未实现**。应在 `components/RequestForm.tsx` 询价成功（`inquiryAccepted` 为真）时发 `generate_lead`（带 `form_type: quote|sample|contact`），并为 mailto / tel / WhatsApp 点击发 `contact_click`；之后在 GA4 标为关键事件。
- 询盘表单 → `https://inquiry.panpantechnology.com/api/inquiries`（`lib/shared-inquiry.ts`），该服务 CORS 必须允许 `https://www.panpanaroma.com`。
- 提交前：`node --test tests/*.test.mjs`、`node scripts/check-release.mjs`、`npm run build`。

## 工作流
- 新改动开分支 `seo/<主题>-<MMDD>` 或 `post/<slug>-<MMDD>`，PR 测试通过后合并 `main`（合并即上线）。
- 本地工作区修改前先 `git fetch`，确认没落后 `origin/main`。
- 每周看 GSC：曝光高 + CTR < 1% 的页面优先改标题和开头；问句型查询补“直接结论 + 询价入口”。
- 业务资料与事实来源见工作区 `E:\桌面\米娅科技\AGENTS.md` 和 `00_工作台`；跨站 SEO 规范见 `E:\桌面\SEO`。
