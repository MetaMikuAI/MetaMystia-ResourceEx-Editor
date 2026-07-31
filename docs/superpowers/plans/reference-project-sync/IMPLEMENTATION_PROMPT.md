# 实施 Prompt

将以下内容作为新任务的完整初始指令：

```text
请在当前仓库中完整实施“参考项目同步重构”。

正式规格位于：

docs/superpowers/plans/reference-project-sync/README.md

开始前必须完整阅读 README 及其索引的 01—11 全部文档。它们共同构成唯一实施规格，不要根据本 Prompt 的摘要替代原文，也不要重新设计已经定稿的方案。

参考仓库：
https://github.com/AnYiEE/touhou-mystia-izakaya-assistant

固定参考提交：
d3b06126676430943856dfadc0bc8170920f9f72

目标设计基线：
207b54dcee5b121227e2a8b2cc00da42b0862374

一、任务目标

在保留 MetaMystia ResourceEx Editor 全部业务语义、URL、编辑能力、导入导出结果、资产行为和未保存保护的前提下，按照正式文档完成：

- 根目录 app/ 架构迁移；
- Design、theme、shared、browser infrastructure 同步；
- ResourceEx domain、archive、assets、Provider 拆分；
- App Shell、共享编辑器 UI 和 12 个业务编辑器迁移；
- 依赖、Patch、静态导出配置和最终单路径收口；
- 完整静态、构建、归档、浏览器和静态托管验证。

目标结构为：

app/{declarations,design,domain,features,infrastructure,shared}

本次任务是实施，不是继续输出迁移建议。除非发现会实质改变业务、数据、部署或用户体验的规格冲突，否则应根据文档作出最小合理判断并持续推进。

二、开始前的调查门

任何代码修改前：

1. 完整阅读仓库 AGENTS.md。
2. 记录 staged、unstaged、untracked 状态，保护维护者已有改动。
3. 记录目标仓库和参考仓库当前 HEAD。
4. 始终以固定参考提交读取参考实现；参考仓库后来发生的变化不能自动进入迁移范围。
5. 完整读取当前 Task 涉及的目标文件、参考文件、调用者、配置、状态 owner 和运行时边界。
6. 先执行文档 Task 1，建立可重复的 ResourceEx 行为基线和确定性夹具。
7. 调查并记录已有 baseline warning，不能把既有问题归因于本次修改。

不得未经调查直接整目录复制，也不得只根据文件名推断能力是否适用。

三、实施顺序

严格按照 03-实施步骤与文件规划.md 的 Task 1—9 顺序实施。

每个 Task 都是独立验收门，但不等于必须调用子代理或重复执行没有增量价值的检查：

- 完成该 Task 的全部文件与调用者迁移；
- 删除该阶段已无调用者的旧 owner；
- 执行该 Task 对应的静态和运行时验证；
- 对涉及参考实现、共享契约或业务行为的实质改动按风险复核差异；
- 立即更新 06-实施状态与交接.md，记录实际完成范围、检查结果、兼容影响、未验证项和下一入口；
- 然后再进入下一个 Task。

允许使用子代理处理具有真实并行价值的调查、独立实现和交叉复审。子任务必须边界明确，避免多个代理并发编辑同一文件；主代理负责协调共享状态、处理交叉影响，并在采用子代理结果前自行核验。子代理复审不是每个 Task 的固定仪式：低风险机械迁移由主代理自检即可；跨边界契约、业务语义、共享基础设施、依赖/Patch 和最终收口等高风险切片才安排独立复审。已有结论在相关实现未变化时可以复用，不重复复核。

四、不可放宽的边界

1. 目标必须始终是 Next.js output: 'export' 静态站点。

不得引入：

- Server Action；
- 请求时 Route Handler；
- cookies/headers；
- rewrites、proxy 或依赖 Next Node server 的重定向；
- 默认 Next 图片优化服务；
- 运行时 Node-only 依赖；
- 参考项目的账户、同步、数据库、管理后台或其他全栈业务。

所有 ZIP、File、Blob URL、storage、Web Crypto 和下载能力只能存在于 client boundary。

2. UI 与业务的迁移原则

- 当前项目首层草案 UI 不是兼容基准。
- 布局、外观、响应式、键盘、焦点、滚动、overlay 和反馈方式以参考项目选定实现为基线。
- ResourceEx 数据、业务操作、URL、文案和状态组合必须保持本项目语义。
- 不原样复制参考项目业务。
- 已选非业务能力不能因为调用者较少而随意简化。
- 所有实质偏差必须登记到 10-非业务能力同步与偏差台账.md。

3. 依赖与 Patch

- 不使用 nodeLinker: hoisted。
- 不增加参考项目没有要求的 overrides。
- 保留 postcss-preset-env。
- 不为单一方法引入 Lodash。
- 不建立 memoize 或预计算主题反转色阶；直接调用纯函数 swapColorScale。
- cn 最终直接从 @heroui/theme 导入，不保留本地转发层。
- 严格执行 11-依赖Patch迁移矩阵.md：
  - 只复制矩阵选中的 Patch；
  - 从固定参考提交原样复制；
  - 按包名登记到 pnpm.patchedDependencies；
  - 不手改 Patch 内容；
  - 运行 pnpm install 并确认 Patch、版本和 lockfile hash 正确。
- 包含 next@15.5.22 对应的 next.patch。
- 保留当前 next/font/google 的 Noto Sans、Noto Sans Mono、Noto Sans SC；不迁移参考字体文件。

4. ResourceEx 与归档

严格按照 08-ResourceEx内核与状态设计.md 实现：

- 外部输入链为：
  unknown → wire 校验 → IResourcePackWire → 归一化 → ResourceEx
- 编辑状态必须具有 packInfo 和十个必需数组。
- Domain 不得依赖 React、JSZip、FileSaver、Web Crypto 或浏览器 API。
- 签名能力归 browser crypto adapter。
- 导出校验由 feature orchestration 组合。
- JSZip/FileSaver 只存在于 archive adapter。
- persistent Blob URL 只能由 useAssetStore.ts 直接创建和 revoke。
- transient 图片 URL 只能由 readImageDimensions.ts 创建和 revoke。
- Provider 只组合这些能力，不直接调用 Blob URL API。
- LICENSE 缺失或为空时归一化为 license: ''，导出时不生成 LICENSE.md；非空内容原样写回。
- 保持归档 entry truth table、资产目录、非 assets 引用文件和 dirty 生命周期。
- 不顺带修复 Branch price 当前导出裁剪行为。

5. 文件所有权

严格使用 09-文件与所有权迁移矩阵.md：

- 每个文件只能有一个明确 owner；
- 更新全部直接和间接调用者后才能删除旧文件；
- 不新增只用于缩短路径的 barrel index.ts；
- 不建立临时转发 facade 作为最终结构；
- app/** 内遵守仓库规定的 import 方向和排序；
- 最终删除 src/，再收紧 alias、TypeScript include 和 Tailwind content。

五、验证要求

项目没有自动化测试套件，不得虚构测试通过结论。

以“最小充分证据”为验证原则。每项检查必须对应本次改动、正式规格或已识别风险；不为形成记录而增加无业务价值的测试，不虚构项目不存在的测试套件，也不编写随后丢弃且不能验证关键行为的测试。将小型连续改动合并为有意义的交付切片，在切片完成时运行适用检查；只有相关实现继续变化或前次检查失败时才重跑。

每个具备独立行为交付的实施切片根据受影响范围执行：

pnpm exec tsc --noEmit
pnpm exec prettier --check <changed-files>
git diff --check
git diff --cached --check

最终执行：

pnpm build

最终按 05-验证与回归清单.md 完成受迁移影响的关键路径与完成门，不机械重复已具有有效证据且相关实现未变化的检查。覆盖：

- 确定性 ResourceEx 夹具；
- JSON、ZIP entry、LICENSE 和资产 SHA-256 比较；
- 12 个路由的核心增删改流程；
- light/dark/system、跨标签 storage 和 reduced motion；
- 键盘、焦点、Modal、Popover、Select 和响应式；
- persistent/transient Object URL 生命周期；
- dirty、取消、失败和成功导出状态；
- 静态服务器直接刷新全部 route；
- 404、_next chunk、public asset 和导出字体；
- console、network 和不存在的 Node/API 请求检查；
- 干净安装及 Patch 可重现性。

使用真实浏览器；没有可复用浏览器会话时使用 Playwright。需要运行临时脚本或把命令结果、日志、截图、trace、夹具副本、安装副本及其他非交付内容写入文件时，只能写入项目根目录 .tmp/，不得散落到源码目录或系统临时目录。可配置的任务专用缓存使用 .tmp/cache/<tool>/。阶段结束后关闭代理启动的 Playwright/浏览器会话、开发/静态服务器和后台进程，并清理这些浏览器、Playwright、npm/pnpm 等缓存目录；不得未经明确授权清理用户级或其他项目共享缓存。.tmp/ 中的其他临时文件保留并列入交接，不阻塞任务完成，用户后续另行要求时再清理。

六、工作方式

- 持续实施到全部 Task 完成，不能只完成架构骨架。
- 保持改动小而可复审，避免无关格式化和仓库级清理。
- 遇到错误时先定位根因，不通过放宽类型、删除行为或增加兼容分支掩盖问题。
- 发现正式文档之间存在真实冲突时，先记录具体文件、行号、两种行为及影响，再请求决定；不要自行选择会改变业务结果的解释。
- 实施过程中实时维护 06-实施状态与交接.md，避免上下文压缩后丢失进度。
- 正式夹具和文档等明确交付物写入规格指定路径；临时脚本及其他非交付输出统一写入项目根 .tmp/，任务结束时列入交接即可，不以清理确认作为完成条件。
- 不得未经明确授权 stage、commit、amend、push、切换分支或工作树、创建 PR。

七、完成标准

只有同时满足以下条件才能声明完成：

- 03-实施步骤与文件规划.md Task 1—9 全部完成；
- 05-验证与回归清单.md 完成门全部有实际证据；
- app/ 成为唯一源码路径，src/ 已删除；
- 12 个 URL 和 ResourceEx 外部行为保持不变；
- 当前草案 UI 已替换为目标设计；
- 所有选中非业务能力均能追溯到固定参考文件；
- 所有实质差异均登记在偏差台账；
- 依赖和 Patch 可由干净安装重现；
- out/ 无需 Next Node server 即可由静态服务器完整提供；
- 源码目录和系统临时目录没有代理输出，Playwright/浏览器会话、服务、后台进程和本任务专用缓存均已关闭或清理，项目根 .tmp/ 的保留内容已列入交接且不阻塞任务完成；
- 06-实施状态与交接.md 已写入最终文件清单、实际检查结果、兼容影响、警告和未验证项。

最终汇报只说明：

1. 实际完成的架构和行为；
2. 主要文件与所有权变化；
3. 依赖和 Patch 结果；
4. 实际执行的验证及结果；
5. 兼容影响、baseline warning 和未验证区域；
6. 当前工作区状态。

不要把设计文档通过、静态检查通过或部分浏览器检查通过描述成整个迁移已经完成。
```
