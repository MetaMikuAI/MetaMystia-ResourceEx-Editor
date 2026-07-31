# ResourceEx 内核与状态设计

## 1. 目标数据流

```text
ZIP/File
  → archive reader（JSZip/Blob）
  → unknown ResourceEx JSON
  → wire validation
  → IResourcePackWire
  → domain normalization
  → ResourceEx（normalized editor state）
  → ResourceEditorProvider
     ├─ ResourceEx state
     ├─ LICENSE state
     ├─ archive file/folder snapshot
     ├─ persistent asset preview URL lifecycle
     └─ dirty/beforeunload
  → feature Screen 原子编辑动作
  → feature export validation orchestration
     ├─ domain validation
     ├─ asset reference validation
     └─ browser signature adapter
  → domain pure serialization
  → archive writer（JSZip）
  → download adapter（FileSaver）
```

Domain 不接触 React、JSZip、FileSaver、Web Crypto、Blob URL、`window` 或浏览器事件。Archive adapter 不决定编辑器 dirty；Provider 不实现字段归一化、签名规则或导出裁剪。Archive、asset、storage、crypto、object URL 与 FileSaver 都是静态页面 hydration 后的 client-only 能力，不依赖 Route Handler、Server Action 或 Next Node runtime。

## 2. Wire 契约与规范化状态

导入边界和编辑器状态使用两个不同契约：

| 契约                | 生命周期                         | 约束                                                                                                                                                             |
| ------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IResourcePackWire` | 只存在于 archive reader/解析边界 | `packInfo`、十个集合和遗留顶层包信息均可缺失；集合暂时允许 `null`，以表达旧包兼容输入；不向 UI、Provider 或序列化器暴露                                          |
| `ResourceEx`        | 领域与编辑器的规范化状态         | `packInfo` 必需；`characters`、`dialogPackages`、`ingredients`、`foods`、`beverages`、`recipes`、`missionNodes`、`eventNodes`、`merchants`、`clothes` 必须是数组 |

解析链固定为：

```text
unknown
  → 校验对象形状与字段路径
  → IResourcePackWire
  → 兼容迁移与缺省值归一化
  → ResourceEx
```

规则：

- 集合缺失或为 `null` 时归一化为 `[]`；其他非数组值返回带字段路径的结构化错误。
- `packInfo` 存在时只使用它，忽略同时存在的遗留顶层包信息。
- 仅当 `packInfo` 整体缺失时，才由遗留顶层包字段构造 `packInfo`。
- License 只来自归档中的 `LICENSE.md`；遗留 `packInfo.license` 从 JSON 状态移除，不作为 fallback。
- Provider、Screen、领域校验和序列化器只接收 `ResourceEx`，不接受 wire 契约或未验证的 `unknown`。

## 3. 目标 owner

### `app/domain/resourcePack`

| 文件                                                             | 责任                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| `contracts/{character,dialogue,event,items,merchant,mission}.ts` | 按实体边界拆分 ResourceEx JSON 契约                  |
| `contracts/resourcePackWire.ts`                                  | parser-only 的 `IResourcePackWire`                   |
| `contracts/resourceEx.ts`                                        | 规范化顶层 `ResourceEx` 契约，导入上述实体叶子       |
| `constants.ts`                                                   | 已知依赖、Label 规则、ID 区间、序列化常量            |
| `createBlankResourcePack.ts`                                     | 新建空白包，返回完整规范化对象                       |
| `normalization.ts`                                               | wire 校验、旧字段迁移、缺省值与集合归一化            |
| `serialization.ts`                                               | 纯克隆、裁剪、排序、CRLF→LF、JSON 文本               |
| `validation.ts`                                                  | 纯 ID、Label、结构和引用规则，不包含签名与浏览器能力 |
| `assetReferences.ts`                                             | 从已验证 ResourceEx 收集资产路径                     |

不建立 `contracts/index.ts`。现有 ResourceEx schema 类型名属于 public-boundary 例外，不在结构迁移中批量重命名。`TRatingKey` 不属于 ResourceEx，迁到 `domain/evaluation/types.ts` 并由 Design rating theme 依赖；`IAssetPathOperation` 不属于 JSON 契约，归资产 feature contracts。

### `app/features/resourceEditor/client/archive`

| 文件                          | 责任                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| `readResourcePackArchive.ts`  | 打开 ZIP、分类 entries、读取 JSON/LICENSE、调用 domain normalize |
| `writeResourcePackArchive.ts` | 写入序列化 JSON、LICENSE、目录和文件 Blob，返回 ZIP Blob         |
| `downloadResourcePack.ts`     | 生成文件名并调用 FileSaver                                       |
| `contracts.ts`                | archive 读写 DTO 和可报告错误                                    |

Archive reader 返回规范化数据、LICENSE、文件 Blob 和目录，不创建对象 URL。Writer 接收已序列化文本和归档快照，不读取 React state。

### `app/features/resourceEditor/client/assets`

- `contracts.ts`：`IAssetPathOperation`、文件/目录 DTO；
- `useAssetStore.ts`：Blob Map、persistent preview URL、目录、复制/移动/删除；
- `assetPaths.ts`：纯路径校验、展开、冲突检测。

Persistent preview URL 只由 `useAssetStore.ts` 创建和 revoke；Provider 只组合该 hook，不直接调用 Blob URL API。Asset store 在替换、删除、重复导入、取消提交或卸载时 revoke。避免把 React 外部 observable class 作为新的状态源。

### `app/infrastructure/browser`

- `crypto/idRangeSignature.ts`：签名与验签、消息编码和 PKCS#8 限制；ID 范围常量与纯规则归 domain；
- `images/readImageDimensions.ts`：接收 Blob/File 与可选 `AbortSignal`，返回 `{width, height}`；为图片加载创建 transient object URL，并以幂等 cleanup 在成功、失败或 abort 时解除事件并 revoke。

`PortraitUploader.tsx`、`SpriteUploader.tsx`、`clothes/SpriteGrid.tsx` 和 `character/editor/SpriteSet.tsx` 只调用 `readImageDimensions`，不直接调用 `URL.createObjectURL` 或 `URL.revokeObjectURL`。

### `app/features/resourceEditor/client/validation`

`validateResourcePackForExport.ts` 是导出校验的 feature orchestration。校验结果保持现有 UI 契约：

```ts
interface IResourcePackValidationIssue {
	severity: 'error' | 'warning';
	category: string;
	message: string;
}
```

Domain `validateResourcePackRules` 接收规范化 `ResourceEx`、可选 `ReadonlySet<string>` 资产路径和 feature 预先计算的签名有效性，按既有遍历顺序产生同步 issues；它自行处理缺失范围/签名等纯条件，但不调用 Web Crypto。Feature 只在 label、范围和签名齐备时调用 `verifyIdRange`，再把布尔结果传给 domain，使 severity、category、message 与当前行为保持一致。Navbar/App Shell 只触发该异步 feature flow，ExportValidationDialog 只消费 issues，不直接访问 domain validation 或 crypto。

Info feature 的 ID 范围编辑/展示同样由 feature 层组合领域范围规则与签名 adapter；领域模块不反向导入浏览器设施。

### `app/features/resourceEditor/client/state`

- `ResourceEditorProvider.tsx`：组合 domain、archive、asset、dirty 和 `beforeunload`；
- `useResourceEditor.ts`：唯一消费入口；
- `contracts.ts`：Provider 对 feature 暴露的最小命令/查询。

## 4. Provider 公开契约

目标不再暴露 `setData` 和 `setHasUnsavedChanges` 两个可分离动作。建议契约：

```ts
interface IResourceEditorContext {
	resourcePack: ResourceEx;
	license: string;
	isDirty: boolean;
	assets: IAssetState;

	updateResourcePack(updater: (current: ResourceEx) => ResourceEx): void;
	replaceLicense(license: string): void;

	importArchive(file: File): Promise<IImportResult>;
	createBlankResourcePack(): void;
	exportArchive(): Promise<IExportResult>;

	updateAsset(path: string, blob: Blob): void;
	removeAsset(path: string): void;
	createAssetFolder(path: string): void;
	removeAssetFolders(paths: readonly string[]): void;
	moveAssets(operations: readonly IAssetPathOperation[]): void;
	copyAssets(operations: readonly IAssetPathOperation[]): void;
	getAssetUrl(path: string | undefined): string | undefined;
}
```

最终命名以实现期邻近代码为准，但语义必须满足：

- `updateResourcePack`、LICENSE 和所有文件/目录 mutation 原子标记 dirty；
- 导入成功和创建空白包完成后状态为 clean；
- 导入/创建取消或失败不改变当前 state；
- 覆盖导入与创建空白包的确认由 feature UI 在调用命令前完成，Provider 不直接打开 Modal 或返回确认布尔值；
- 无问题时可直接导出；有 issues 时由用户明确确认“仍然导出”后继续。只有实际文件成功生成并触发下载后才标记 clean，取消或失败不清除 dirty；
- 页面不能直接清除 dirty；
- Provider 是唯一 `beforeunload` owner。

## 5. 导入与归档 entry 不变量

归一化保持既有业务语义：

- character flags 默认 `false`，descriptions 长度 3，guest evaluation 长度 9；
- food/beverage request `enable` 默认 `true`，tag/banTag/request/spawn 按既有规则排序；
- mission `name` → `title`、`receiver` → 既有 JSON 拼写 `reciever`，并补数组、字符串和 label；
- clothes `pixelFullConfig` 按既有 ID 规则补默认值；
- event 旧 `trigger`/`eventData` 结构归入 `scheduledEvent`。

Archive reader 按下表分类每个 entry：

| entry 类别            | 导入状态                                             | 导出规则                                      |
| --------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `ResourceEx.json`     | 只解析 JSON，不进入文件 snapshot                     | 由 serialization 重新生成                     |
| `LICENSE.md`          | 只读取 license，不创建 Blob 或 object URL            | 空字符串时省略；非空时按原文本写回            |
| `__MACOSX/**`         | 忽略                                                 | 不写回                                        |
| `assets/**` 普通文件  | 保存 Blob/file snapshot；按需建立 persistent preview | 无论 JSON 是否引用都写回                      |
| `assets/**` 目录      | 保存 folder snapshot                                 | 保留目录                                      |
| 非 `assets/` 普通文件 | 保存 Blob/file snapshot                              | 仅当 ResourceEx JSON 引用时写回；未引用则丢弃 |
| 非 `assets/` 目录     | 忽略                                                 | 不写回                                        |

`LICENSE.md` 缺失或内容为空时，状态中的 `license` 使用空字符串，导出时不生成该条目；非空内容按原文本写回。它不再进入 Blob/object URL 状态。非 `assets/` 普通文件仍可在 JSON 引用时往返，不能把它们一律丢弃。

`assets/` 根目录始终存在于 folder snapshot，并在导出时保留；导入包没有显式目录 entry 时也不改变这一点。

外部 JSON 一律以 `unknown` 进入解析链。不能用一次类型断言代替结构验证；可报告错误必须保留足够路径信息供导入 Modal 展示。

## 6. 导出不变量

序列化从深度独立副本产生结果，不修改编辑状态。保持：

- 始终输出 `characters`、`dialogPackages`、`ingredients`、`foods`、`beverages`、`recipes`、`missionNodes`、`eventNodes`、`merchants`、`clothes` 十个集合；空集合输出 `[]`；
- 缺失或值为 `undefined` 的可选实体字段省略；契约明确允许的 `null` 保留；
- character、ingredient、food、beverage、recipe、clothes 既有排序；
- guest request 只保留激活的喜好 tag 并排序；
- 字符串 trim、CRLF→LF；
- license 不进入 ResourceEx JSON；
- JSON 两空格缩进、尾部换行；
- 空 actions 省略；
- CameraShake 只保留 `actionType`；
- Sound 仅在有值时保留 `sound`；
- Branch 维持既有 `{text, jump}` 输出；
- Goto 的 index 默认 1；
- End 的 exitCode 默认 0；
- `shouldSet: false` 只输出 `actionType` 和 `shouldSet`；
- 其他 action 输出 `actionType` 与可选 sprite；
- ZIP 写入 JSON 实际引用的普通文件，并始终保留 `assets/**` 管理范围内的文件与目录；
- 文件名保持 `${label}-v${version}.zip`。

Branch 的 `price` 会在导出时丢弃。结构迁移夹具必须冻结该结果，本次迁移不改变它；如需改变，应作为独立业务修复审查。

目标把现有浅拷贝后的递归修改改为纯函数，但固定夹具的 JSON/ZIP 字节结果必须等价。

## 7. Screen 写入模型

| Screen     | feature 局部状态             | ResourceEx 写入集合                  |
| ---------- | ---------------------------- | ------------------------------------ |
| Asset      | activeFolder、isCollapsed    | 无 JSON 写入；资产命令               |
| Beverage   | selectedIndex                | beverages                            |
| Character  | selectedIndex                | characters                           |
| Clothes    | selectedIndex                | clothes                              |
| Dialogue   | selectedIndex                | dialogPackages（含 dialogs/actions） |
| Event      | selectedIndex                | eventNodes                           |
| Food       | selectedIndex、previewFoodId | foods                                |
| Info       | 无                           | packInfo、license                    |
| Ingredient | selectedIndex                | ingredients                          |
| Merchant   | selectedIndex                | merchants                            |
| Mission    | selectedIndex                | missionNodes                         |
| Recipe     | selectedIndex、previewFoodId | recipes                              |

Screen 通过单次 updater 完成一次用户动作；不允许先 mutation 再单独标 dirty。简单 CRUD 可留在 Screen；复杂默认对象、排序、对话插入/删除和跨实体引用更新提取到对应 editor `model.ts` 纯函数。

## 8. 错误、确认与并发

- Import reader 返回结构化失败，不直接 `alert`。
- Provider 在执行覆盖导入/清空前向 UI 暴露意图，由 feature Modal 收集确认；domain/archive 不弹 UI。
- 同一 archive 操作 pending 时禁用重复提交。
- Import/Export 失败不清除 dirty，不部分替换状态，不泄漏新建对象 URL。
- Persistent URL 的创建与 state 提交组成同一成功路径；失败时清理尚未提交的 URL。
- Transient image URL 由 `readImageDimensions` 在自己的每条结束路径清理，不进入 React state。
- 不引入与编辑器需求无关的多用户、服务端并发、BroadcastChannel 数据同步或持久化草稿。

## 9. 确定性验证

至少建立：

1. 最小有效包；
2. 同时覆盖 `packInfo`/遗留顶层信息、缺省集合、`null` 集合和非法非数组集合的 wire 兼容包；
3. 分别不带 LICENSE、带空 LICENSE、带非空 LICENSE，并覆盖 `__MACOSX/**`、`assets/**`、被引用与未引用的非 `assets/` 文件及嵌套目录的完整包；
4. 包含每种 DialogAction（含 Branch `price`）的动作包。

每个夹具比较：

- wire 校验错误及路径；
- normalization 后的完整 `ResourceEx`；
- 序列化 JSON 字节与十个集合；
- ZIP entry 名称、目录标志和顺序；
- LICENSE 字节；
- 文件 SHA-256；
- 导入/创建/编辑/导出后的 dirty；
- persistent/transient URL create/revoke 计数；
- 失败路径前后 state 身份与内容。

## 10. Task 5 实施结果

- 首轮独立审查未通过：初版的 wire reader、revision/export snapshot、asset folder/Object URL transaction、保留 Label hard guard 与 export-view 引用同源性未完整满足本文门禁。以下为修复后实际结果，Task 5 仍等待主代理复核。
- 本文定义的 domain/archive/assets/validation/state owner 已建立；旧 `DataContext.tsx`、context utilities、ResourceEx 类型聚合与旧常量 owner 在 caller 清零后删除。业务 Screen 当前仍位于 `src/`，但只通过 `useResourceEditor` 消费新 owner，最终 Screen 目录迁移归 Task 7。
- wire 解析链已对 PackInfo、十集合实体叶子、嵌套对象与 discriminated union 做 path-aware 读取，严格区分 required/optional/显式 `undefined`/合法 `null` 并保留合法未知扩展字段；最终宽断言已移除。纯序列化与 archive truth table 由七个固定夹具和扩展错误路径 harness 验证；Branch `price` 继续按既有结果裁剪。LICENSE 仅进入 license state，缺失或空内容均不生成导出 entry，也不进入文件快照或 persistent URL。
- 因上述 LICENSE owner 修正，Task 1 的 empty-LICENSE 包曾创建 7 个 URL（6 个普通文件加 LICENSE），Task 5 后同包只创建 6 个；missing/empty 两包连续导入的累计计数由旧 `13/6` 变为 `12/6`，创建空白后为 `12/12`。JSON、LICENSE 与普通文件的归档字节/哈希仍按固定 manifest 验证，不能把 URL 计数写成完全等价。
- `useAssetStore` 是 persistent URL 唯一 owner，`readImageDimensions` 是 transient URL 唯一 owner。asset files/URLs 通过 transaction 先完整创建再提交，创建失败撤销本轮 URL 并保留旧 maps，提交成功后才撤销被替换 URL；folders 与 files/URLs 一样由 ref-backed 最新状态读取。源码扫描没有其他 Blob URL 调用；真实浏览器覆盖重复导入、创建空白、SpriteUploader 有效确认/尺寸取消/损坏输入，Task 3 adapter harness 继续覆盖 load/error/abort。
- Provider 的 ref guard 防止同类 archive 操作并发提交，并向 Navbar 暴露 pending 状态禁用入口；所有 ResourceEx、LICENSE、文件和目录 mutation 同步增加 revision 并原子标脏。Navbar 把 validation 结果绑定当时 revision；export orchestration 只读取该 revision 的一致快照，写包/下载后仅在 revision 未变化时 clean，期间的新 mutation 不会被旧导出清除。import/create blank 成功替换后增加 revision 并 clean，取消/失败不清 state。
- 领域 validation 与 export orchestration 的不可绕过 hard guard 都拒绝 `CORE`、`DLC1` 和非法 Label。`createResourcePackExportView` 从同一深拷贝、业务裁剪、trim、CRLF 结果同时产生 JSON、下载用 ResourceEx view 与引用集；带空白的非 `assets/` 引用已有实际 ZIP entry/bytes 证明。
- `.tmp/task5-state-harness.mjs` 覆盖 deferred revision snapshot/dirty、stale validation、Label hard guard、replace/update/remove/copy/move URL 序列、失败回滚和幂等 dispose。focused React/Playwright probe 覆盖旧异步 uploader callback 不回退新 folder，以及 StrictMode/unmount 下每个 persistent URL 恰好 revoke 一次。
- 本阶段未逐一真实 UI 重跑其余三个图片 caller与资产复制/移动/删除；共享 owner 和确定性 transaction harness 已覆盖其共同边界，这些真实交互仍进入 Task 9 完整回归。当前没有自动化测试套件，确定性脚本只作为任务 harness。
