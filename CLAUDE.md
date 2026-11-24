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
- TODO：GSC 数据待读取（本次体检时内置浏览器未登录 Google）。拿到数据后按“曝光高 + CTR < 1%”和“问句型查询排名 1–6 但 0 点击（AI 引用）”两类补写本节。
- 主攻方向（待 GSC 验证）：wholesale essential oils supplier、bulk essential oils China、private label essential oils manufacturer、essential oil OEM、carrier oils wholesale。

## 技术
- 框架：Next.js 风格 App Router，由 vinext/Vite 构建为 **Cloudflare Worker**（`npm run build` → `dist/`）。不是 GitHub Pages。
- 部署：`.github/workflows/deploy-cloudflare-worker.yml`，**push `main` 即部署**到所有者的 Cloudflare 账号（Worker `panpanaroma`，域名见 `deploy/cloudflare-worker.json`）。PR 只跑测试和构建。没有本地定时部署。
- `.openai/hosting.json` 保留旧 OpenAI Sites 项目（过渡期，见 `MIGRATION.md`）。
- 编辑源：⚠️ 工作区规则曾写“`../miya-essential-oils` 是唯一编辑源、本仓库是发布镜像”，但该目录无 Git 远程、最后提交 2026-10-27、没有 GA4，而 10-31 之后的部署 / 域名 / GA4 改动都只在本仓库。**现在线上 = 本仓库 `main`**。TODO：由用户确认是否把本仓库定为唯一编辑源，避免两边分叉。
- 内容：`content/*.json`（site / pages / catalog / blog / image-policy）；`app/sitemap.ts`、`app/robots.ts` 由 `lib/discovery.ts` 生成（只收录 launch 后的页面、博客，不含 pending 产品）。
- robots：禁止 `/api/`、`/inbox/`、`/request-quote/`、`/request-samples/`。
- `llms.txt`：**尚无**（线上 404）。新增时放 `public/llms.txt` 或路由生成，并与 sitemap 同步。
- GA4：`G-QQJ398FJZB`（媒体资源 561882177，账号 PanPanTech 414295528），代码在 `app/layout.tsx`，全站 page_view。
- 转化事件：**尚未实现**。应在 `components/RequestForm.tsx` 询价成功（`inquiryAccepted` 为真）时发 `generate_lead`（带 `form_type: quote|sample|contact`），并为 mailto / tel / WhatsApp 点击发 `contact_click`；之后在 GA4 标为关键事件。
- 询盘表单 → `https://inquiry.panpantechnology.com/api/inquiries`（`lib/shared-inquiry.ts`），该服务 CORS 必须允许 `https://www.panpanaroma.com`。
- 提交前：`node --test tests/*.test.mjs`、`node scripts/check-release.mjs`、`npm run build`。

## 工作流
- 新改动开分支 `seo/<主题>-<MMDD>` 或 `post/<slug>-<MMDD>`，PR 测试通过后合并 `main`（合并即上线）。
- 本地工作区修改前先 `git fetch`，确认没落后 `origin/main`。
- 每周看 GSC：曝光高 + CTR < 1% 的页面优先改标题和开头；问句型查询补“直接结论 + 询价入口”。
- 业务资料与事实来源见工作区 `E:\桌面\米娅科技\AGENTS.md` 和 `00_工作台`；跨站 SEO 规范见 `E:\桌面\SEO`。
