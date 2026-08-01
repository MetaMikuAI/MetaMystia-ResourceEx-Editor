# ResourceEx Editor 整站视觉规范

状态：已落实，持续作为视觉验收规范
适用范围：`/info`、`/character`、`/asset`、`/beverage`、`/clothes`、`/dialogue`、`/event`、`/food`、`/ingredient`、`/merchant`、`/mission`、`/recipe`
最小支持视口：375 × 844

## 1. 目标与约束

本规范收口 ResourceEx Editor 的页面骨架、表单、列表、操作和反馈样式。视觉语言只来自现有 Mystia 主题、语义 Token 和 `app/design/**` 基础组件，不新增第二套品牌颜色或页面私有组件体系。

视觉修改不得改变 ResourceEx schema、URL、CRUD、ZIP、LICENSE、资产、dirty、Object URL、Branch price、签名或静态导出行为。浏览器能力继续由 client/browser boundary 持有。

## 2. 代码层级与所有权

| 层级                | 职责                                                                              | 代码 owner                                         | 不得承担                                   |
| ------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| Design Token 与主题 | 语义色、主题色阶、全局可复用视觉量                                                | `app/design/theme/**`                              | 业务页面布局和数据语义                     |
| 基础 UI             | Button、Card、Input、Textarea、Select、Switch、Modal、Popover、Tooltip 等基础交互 | `app/design/ui/**`                                 | 编辑器领域文案和数据操作                   |
| 编辑器组合组件      | 页面骨架、列表面板、详情面板、列表项、空状态、字段、章节操作、状态提示            | `app/features/resourceEditor/client/components/**` | 单一实体的字段结构和 schema                |
| 业务编辑器          | 字段组合、实体数据、特定复杂布局                                                  | `app/features/resourceEditor/client/editors/**`    | 重复定义颜色、阴影、按钮、输入框或通用状态 |
| 路由                | 组合对应 Screen                                                                   | `app/(pages)/**/page.tsx`                          | 页面视觉实现和业务状态 owner               |

页面需要新的通用视觉能力时，先在正确的上层 owner 实现。不得为缩短 import 创建转发 facade，也不得用页面级 Tailwind 覆盖绕过共享组件。

## 3. 视觉层级与页面结构

### 3.1 页面层级

1. **应用背景**：保留主题背景色和 Mystia 背景素材，不在页面重复绘制背景。
2. **全局导航**：保持最高的常规页面层级；桌面为水平导航，移动端为单一展开菜单。
3. **页面工作区**：统一由 `EditorWorkspace` 控制最大宽度、外边距、栅格和窄屏重排。
4. **一级面板**：列表、详情、基础信息使用同一种 Surface、边框、圆角和轻量投影。
5. **二级区块**：字段组和嵌套编辑器只用内容色与边框分层，不增加新的外投影。
6. **交互与反馈**：选中、hover、focus、危险、警告和错误只使用语义 Token。

### 3.2 标准骨架

- 信息页使用单列工作区：页面标题面板 + 内容面板。
- 实体编辑页使用列表/详情工作区：桌面默认 `1fr / 2fr`，资产页可使用 `1fr / 3fr`。
- 列表和详情必须使用共享组合组件；不得各自重复 `bg-white/10`、`shadow-md`、`backdrop-blur` 等组合。
- 列表标题、添加操作、列表滚动区域和空状态的位置在各页面一致。
- 固定视口高度的列表与目录由共享 `ScrollShadow` 承载纵向滚动，标题和主操作保持在滚动区外；页面主内容、移动导航和已有 Modal 滚动 owner 不机械套用。
- 用户从列表标题区新增项目后，列表在新项目实际渲染后滚动到末项；减少动态效果开启时不得使用平滑滚动。
- 详情未选择项时使用统一详情空状态；不得由每个页面直接输出不同样式的占位段落。

## 4. 语义色与 Token

### 4.1 唯一来源

- 页面使用 `background`、`foreground`、`content1`、`content2`、`default`、`divider`、`focus`、`primary`、`secondary`、`success`、`warning`、`danger`。
- 色值来源为 `app/design/theme/colors/semantic.ts` 和现有 palette。
- Light 主题以 brown 色阶表达背景、Surface 和主操作；Dark 主题沿用 black 色阶与 blue primary。
- 页面不得直接使用 `white`、`black`、`gray`、`zinc`、任意十六进制或 `rgb()` 表达可由语义色描述的视觉语义。

### 4.2 使用规则

| 语义         | Token                      | 用途                       |
| ------------ | -------------------------- | -------------------------- |
| 页面背景     | `background`               | 根背景和弹窗背景           |
| 一级 Surface | `content1`                 | 列表、详情、页头、Modal    |
| 二级 Surface | `content2` 或 `default/20` | 字段组、嵌套卡片、只读区   |
| 普通边界     | `divider`                  | 面板、字段组、列表项边框   |
| 主操作/选中  | `primary`                  | 主要按钮、当前项、强调链接 |
| 危险操作     | `danger`                   | 删除、破坏性确认、字段错误 |
| 警告         | `warning`                  | 非阻塞风险和未分配状态     |
| 成功         | `success`                  | 已完成或通过状态           |
| 键盘焦点     | `focus`                    | `focus-visible` 焦点环     |

颜色不能成为状态的唯一表达；状态还必须有文案、图标、边框或可访问属性。

## 5. Surface、边框、阴影与圆角

### 5.1 Surface 层级

- 一级面板：`content1` 语义背景、`divider` 细边框、共享圆角、最多一层轻投影。
- 二级区块：透明或 `content2/default` 浅色背景 + `divider` 边框；不得使用外投影。
- 列表项：默认透明/浅 Surface；hover 使用 `default` 浅色；选中使用 `primary` 浅色背景和 `primary` 边框。
- 空状态：属于当前 Surface，不额外叠加卡片阴影。

### 5.2 禁止组合

- 同一层级混用 `shadow-inner`、`shadow-md`、无边框和强外阴影。
- 页面直接拼接 `bg-white/10 dark:bg-white/5` 或 `bg-black/5 dark:bg-white/5`。
- 为相邻字段组使用不同圆角。
- 每个嵌套层级都增加投影；深度只通过 Surface、边框和间距表达。

### 5.3 标准量

- 一级面板圆角：设计系统 `lg`。
- 二级区块和列表项圆角：设计系统 `md` 或 `lg`，由共享 owner 固定。
- Input、Select、同行操作按钮和普通图标按钮统一使用设计系统 `medium`；不得在响应式断点切换为另一种圆角。
- Badge、索引和标签内微型操作可使用 `small`，但不得把微型圆角用于 40 px 表单操作。
- 边框：1 px 语义 `divider`。
- 投影：只有一级浮层和一级面板可使用 `sm`；Popover、Modal 沿用基础 UI owner。

## 6. 字体与文字层级

| 层级     | 规范                                          | 用途                         |
| -------- | --------------------------------------------- | ---------------------------- |
| 页面标题 | `text-2xl font-bold`                          | 页面或详情主标题             |
| 面板标题 | `text-xl font-semibold`                       | 列表标题、一级区块标题       |
| 章节标题 | `text-base font-semibold`                     | 基本信息、属性、标签等字段组 |
| 字段标签 | `text-sm font-medium`                         | 输入框标签                   |
| 正文     | `text-sm` 或默认正文                          | 表单值、说明正文             |
| 辅助文字 | `text-xs leading-relaxed text-foreground-600` | 帮助、计数、路径说明         |
| 微型状态 | 不小于 11 px，优先 `text-xs`                  | Badge 内短文案               |

- 不得通过父级 `opacity` 同时降低标题、链接和说明文字的对比度。
- 辅助文字直接使用语义前景色阶；可点击链接使用 `primary-600`，并提供 hover、focus-visible 和下划线/边界提示。
- 不使用全大写英文制造层级；已有 schema 英文名可作为次要说明，不与中文标题争夺层级。
- 同类右侧占位文案必须使用相同字号、字重、颜色、行高和结构。
- 用户可见的业务术语统一使用“食材”“食谱”“衣服”；代码类型、变量、JSON 字段、资源路径和协议值继续保留 `Ingredient`、`Recipe`、`Clothes` 等既有英文名称。

## 7. 间距、栅格和内容宽度

- 以 4 px 为基础步长；常用间距为 8、12、16、24、32 px。
- 工作区页面间距：移动端 16 px，`md` 起 24 px。
- 一级面板内边距：移动端 16 px，桌面 24 px；紧凑列表面板可保持 16 px。
- 字段纵向间距：16 px；字段组之间 24 px；标题与内容 12–16 px。
- 双列字段在空间不足时自然退为单列，不设置导致 375 px 横向滚动的固定宽度。
- 文本、路径和 label 使用 `min-w-0`、合理换行或省略；不得撑破工作区。
- 页面内容最大宽度由 `EditorWorkspace` 统一控制，业务页不得重复设整页 max-width。

## 8. 按钮与操作层级

### 8.1 操作层级

| 操作         | 组件设置                                         | 示例               |
| ------------ | ------------------------------------------------ | ------------------ |
| 页面主要操作 | `Button` primary/solid                           | 导出、确认创建     |
| 普通新增     | 共享 Add action，primary/flat                    | 新增角色、添加食材 |
| 次要操作     | default/flat 或 bordered                         | 复制、预览、取消   |
| 危险操作     | danger/flat；最终确认 danger/solid               | 删除实体、删除资产 |
| 纯图标操作   | `isIconOnly` + 正式图标 + `aria-label` + Tooltip | 折叠、复制、刷新   |

### 8.2 尺寸与对齐

- 普通表单操作使用统一中等高度；紧凑章节操作使用统一小号高度。
- 默认 Input、Select 及其同行增删/预览操作统一为 40 px；仅当整行控件都明确使用紧凑尺寸时，才统一为 32 px。
- 同一操作组中的添加和删除按钮必须拥有相同高度、文字基线和明确的宽度策略。
- 列表项的预览、删除等操作使用横向 action slot；纯图标按钮尺寸、圆角和图标大小必须一致。
- 文案按钮按内容自适应；需要视觉对齐的重复行操作由共享 action slot 统一最小宽度，不在单个页面随意写 `w-*`。
- 图标与文案间距由 Button 的 `startContent`/`endContent` 管理。
- 375 px 视口中的独立触控目标不小于 44 × 44 px；密集行内操作至少保留 40 × 40 px 点击区并有间距。
- 禁止使用裸 `+`、`?`、字符箭头、Emoji 或页面内临时 SVG 作为操作图标。

## 9. 表单控件

### 9.1 统一 owner

- 文本输入使用 `app/design/ui/components/input.tsx`。
- 多行输入使用 `app/design/ui/components/textarea.tsx`。
- Select 使用编辑器共享 Select adapter；其视觉仍来自 Design 层。
- Select 使用普通滚动列表，不启用虚拟化；分组和最大高度由共享 adapter 统一处理。
- Switch 使用 Design Switch。
- Checkbox 应由 Design 层 wrapper 统一；业务页不得直接画浏览器默认 checkbox。
- 文件 input 可以保留为浏览器边界，但应视觉隐藏并由正式 Button 触发。
- Range 等无现有 wrapper 的原生控件必须先建立共享视觉 owner，再由业务页使用。

### 9.2 状态

- 同类 Input、Textarea、Select 高度、圆角、背景、hover 和 focus-visible 一致。
- 同行控件除高度外还要检查垂直居中、标签基线、内边距、边框和圆角；不得只通过 `items-center` 掩盖不同控件尺寸。
- 错误状态使用 `danger`、错误文字和 `aria-invalid`；不得只将背景整体涂红。
- 禁用与只读必须视觉可辨，并保持文本可读；不得仅依赖低 opacity。
- placeholder 是辅助信息，不承载唯一说明。
- Label、说明、错误和 actions 由共享 `EditorField` 布局，不在页面重复定位。

## 10. 图标

- 图标优先复用项目现有资源或共享图标组件；缺失时选用项目正式图标库，不在业务页手绘。
- 紧凑按钮图标 14–16 px；常规按钮和字段操作 16 px；导航 20 px；空状态装饰不超过 32 px。
- 同类图标使用相同描边粗细和 `currentColor`。
- 图标在按钮点击区内居中，不通过放大图标补足点击区。
- 展开箭头以 16 px 图标表达，旋转表示状态；不得出现接近标题高度的大号 chevron。

## 11. 列表、详情与空状态

### 11.1 列表面板

- 标题左对齐，新增按钮固定在同一 header action slot。
- 列表项使用共享 ListItem：主标题、次要元数据、状态 badge、行操作各有固定位置。
- 默认、hover、pressed、focus-visible、selected、disabled 使用统一状态矩阵。
- 行删除通过共享确认组件，不让行操作造成列表项选择误触。

### 11.2 详情面板

- 有内容时：统一 `EditorHeader`、章节、字段组和危险操作位置。
- 无选择时：统一 `EditorEmptyState`，不得由各页面直接输出私有段落。
- 标准文案：
    - 标题：`请选择一个{实体}开始编辑`
    - 说明：`可在列表中选择，或新建一项`
- 文案不引用“左侧”“上方”或裸 `+`，确保桌面和移动端均成立。

### 11.3 空列表与嵌套空状态

- 空列表标题：`暂无{实体}`。
- 空列表说明：`使用“新建{实体}”添加第一项`
- 嵌套空状态标题：`暂无{内容}`；说明仅在能明确下一操作时出现。
- Box variant 统一虚线边框、最小高度和文字层级；inline/text variant 不创建额外 Surface。
- 空状态标题与说明不得使用父级 opacity；链接和操作必须保持可辨识对比度。

## 12. Modal、Popover 与确认操作

- Modal 和 Popover 只使用 Design wrapper，沿用统一 portal、焦点、滚动阴影和 reduced-motion 行为。
- Modal 标题、正文、footer 操作位置一致；主要确认在右，取消在左侧相邻位置。
- 危险确认必须明确目标名称和不可逆影响；确认按钮使用 danger/solid。
- Escape、点击遮罩和关闭按钮行为由调用场景明确，不由页面自制 overlay。
- 关闭后焦点回到触发器；移动端内容可滚动且不得横向溢出。
- Popover 只承载轻量确认或补充信息；复杂表单使用 Modal。
- 列表料理、食材、酒水和食谱预览属于轻量只读信息，使用与删除按钮同组的图标按钮触发 Popover，不使用 Modal。

## 13. 响应式与移动导航

### 13.1 断点行为

- 最小宽度为 375 px；不得以 390 px 代替最低验收宽度。
- `< lg` 时列表/详情改为单列。列表在详情之前，选择后允许通过共享折叠行为腾出空间。
- `lg` 起恢复桌面多列和 sticky 列表；sticky 高度由统一导航高度计算。
- 字段网格在 375 px 退为单列；操作可换行但不允许文字或按钮被裁切。

### 13.2 移动导航

- 展开菜单是一个连续 Surface，不把每个入口表现为带独立阴影的大卡片。
- 当前路由使用 primary 浅色选中态；其他项目有清晰 hover/pressed/focus-visible。
- 菜单高度为导航下方剩余视口，可纵向滚动，页面主体滚动被正确管理。
- 支持键盘 Tab、Shift+Tab、Escape；关闭后焦点回到菜单按钮。
- 菜单按钮和关闭按钮至少 44 × 44 px；图标尺寸保持 20 px。

## 14. 页面级规则

| 路由          | 允许的业务特定布局                    | 必须复用的共享视觉 owner                                   |
| ------------- | ------------------------------------- | ---------------------------------------------------------- |
| `/info`       | 单列基础信息、ID 签名、依赖和 LICENSE | Workspace、Header、Panel、Field、Action、Input、Textarea   |
| `/character`  | 立绘、像素图、羁绊和客人配置          | Collection、Detail、Section、Field、Upload、EmptyState     |
| `/asset`      | 目录导航、文件表格/网格和批量操作     | Workspace、Panel、ListItem、Action、Modal、EmptyState      |
| `/beverage`   | 标签和贴图字段                        | Collection、Detail、Field、Tag、Upload                     |
| `/clothes`    | 多组 Sprite 配置                      | Collection、Detail、Section、Field、Upload                 |
| `/dialogue`   | 树状包列表、对话项和动作编辑          | Collection、TreeItem、Detail、Section、Popover、EmptyState |
| `/event`      | Trigger、Event Data、奖励和后继节点   | Collection、Detail、Section、Field、Select、EmptyState     |
| `/food`       | 标签、禁用标签和预览                  | Collection、Detail、Field、Tag、Popover                    |
| `/ingredient` | 前缀、分类布尔值和标签                | Collection、Detail、Field、Checkbox、Tag                   |
| `/merchant`   | 角色、对话包、商品列表                | Collection、Detail、Section、Field、Select、EmptyState     |
| `/mission`    | 条件、奖励、后继任务和刷新标题        | Collection、Detail、Section、Field、Action、EmptyState     |
| `/recipe`     | 食物、厨具和最多五项食材              | Collection、Detail、Section、Field、Select、EmptyState     |

## 15. 禁止的页面私有样式

以下情况默认禁止：

- 页面直接定义品牌色、状态色、十六进制颜色或 `rgb()`。
- 页面拼装通用 Surface、阴影、圆角和 backdrop blur。
- 页面重复实现 Button、Input、Textarea、Select、Checkbox、Tag 或 EmptyState。
- 页面用父级 opacity 处理帮助、空状态或禁用内容。
- 页面内联正式操作 SVG、文字符号或 Emoji。
- 同类组件在不同页面采用不同高度、图标尺寸或 focus 样式。
- 为视觉修复改变业务数据、默认值、更新时机或生命周期 owner。

## 16. 例外登记

确有业务需求无法遵守规则时，在本节增加记录。每条记录必须包含：路由、文件、偏差、业务理由、影响范围、验证方法和退出条件。仅“当前实现方便”或“旧页面如此”不是有效理由。

### 16.1 资产透明棋盘格

- 路由：所有图片/贴图/立绘预览入口。
- 文件：`app/features/resourceEditor/client/assets/styles.scss`。
- 偏差：棋盘格使用固定白色与浅灰色，而不是主题语义 Surface token。
- 理由：它表达图片透明区域，需要在 light/dark 主题中保持同一像素参照；若跟随主题背景，透明内容会被误判为图片自身颜色。
- 影响：只作用于 `.bg-checkerboard` 预览背景，不用于文字、按钮、边框或页面 Surface。
- 验证：light/dark 下检查透明 PNG 预览边界和前景可辨性。
- 退出条件：Design 层提供专门且跨主题稳定的 transparency-grid token 后迁移。

## 17. 逐页面视觉验收清单

每个路由都必须在 1440 × 1000 和 375 × 844 下完成以下检查：

- [x] 页面骨架、背景和一级 Surface 层级一致。
- [x] 有内容、无内容、选中和未选中状态均已检查。
- [x] 列表 header、添加按钮、列表项和选中态一致。
- [x] 详情标题、字段组、标签、帮助和错误状态一致。
- [x] Input、Textarea、Select、Switch、Checkbox 和 Tag 使用正确 owner。
- [x] 删除、复制、预览、折叠和新增操作尺寸与图标一致。
- [x] 同行控件高度、基线、垂直定位和间距一致；同类控件圆角在页面和断点间一致。
- [x] 背景、文字、边框、hover、selected、danger 等颜色来自正确语义 Token，且文字对比度可辨。
- [x] 复杂嵌套内容和长文本无横向溢出。
- [x] Modal/Popover 可打开、滚动、Escape 关闭并回收焦点。
- [x] 移动导航展开、滚动、选中、关闭和焦点行为正确。
- [x] light/dark、hover、pressed、focus-visible 和 reduced-motion 无视觉冲突。
- [x] console 无新增 warning/error，网络无失败的产品资源请求。

## 18. 实施 owner 矩阵

| 规范能力                  | 当前/目标 owner                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| 语义色                    | `app/design/theme/colors/semantic.ts`                                     |
| 主题组件变体              | `app/design/theme/styles/**`、`app/design/ui/components/**`               |
| 页面栅格                  | `components/layout/EditorWorkspace.tsx`                                   |
| 一级 Surface              | `components/layout/EditorPanel.tsx`、`EditorHeader.tsx`                   |
| 详情面板与未选择状态      | `components/layout/EditorDetailPanel.tsx`、`EditorDetailEmptyState.tsx`   |
| 二级字段区块              | `components/layout/EditorSection.tsx`                                     |
| 字段标签/说明/错误/action | `components/fields/EditorField.tsx`、`Label.tsx`、`InfoTip.tsx`           |
| 添加/删除操作             | `components/actions/**`                                                   |
| 正式图标                  | `components/icons/**` 与 actions 图标 owner                               |
| 列表容器/列表项/选中态    | `components/layout/EditorCollectionPanel.tsx`、`EditorCollectionItem.tsx` |
| Tag                       | `components/tags/**`                                                      |
| Select                    | `components/select/Select.tsx`                                            |
| 上传                      | `components/uploads/**`                                                   |
| 确认                      | `components/confirm/**`                                                   |
| Modal/Popover             | `app/design/ui/components/modal.tsx`、`popover.tsx`                       |
| 移动导航                  | `app/features/appShell/client/**`                                         |

共享能力必须先落到正确 owner，再迁移页面调用者；不允许保留最终页面级转发组件。树形对话列表和资产目录因交互结构不同，不套用普通实体列表项，仍须复用相同 Token、Surface、Action 与状态规则。
