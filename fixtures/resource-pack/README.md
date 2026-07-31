# ResourceEx 行为基线夹具

本目录冻结迁移前实现的 ResourceEx 导入、归一化、导出与浏览器生命周期行为。它记录的是当前事实，其中包含已知缺陷；后续迁移以结构、条目、字节哈希和浏览器结果逐项比较，不能把缺陷静默改写成“原本正确”。

## 1. 固定环境

- 目标仓库：`33edb38d654650b73bfe076a2856bcdf18f5bc5f`
- 固定参考仓库：`d3b06126676430943856dfadc0bc8170920f9f72`
- 日期：2026-07-31
- 浏览器：Windows Chrome `150.0.0.0`
- Node.js：`v24.18.1`
- pnpm：`10.34.5`
- Playwright：`1.62.1`

基线浏览器 console 的既有噪声为 HeroUI `[Next UI] [useButton]: onClick is deprecated, please use onPress instead`、`/favicon.ico` 404 和开发模式 React DevTools 提示。项目没有 test script 或自动化测试套件。

## 2. 目录和比较方式

- `inputs/*.zip`：固定时间戳、固定 entry 顺序的输入包。
- `inputs/sha256.json`：输入字节数和 SHA-256。
- `baseline/<fixture>/normalized.json`：从运行中 `DataProvider` React state 读取的归一化状态。
- `baseline/<fixture>/exported-ResourceEx.json`：经 UI 实际下载的 ZIP 内 JSON。
- `baseline/<fixture>/manifest.json`：输入与导出 entry 的名称、目录标志、字节数和 SHA-256。
- `baseline/<fixture>/exported-LICENSE.md`：仅非空 LICENSE 导出存在。
- `baseline/summary.json`：正常夹具的状态/导出 JSON 摘要。

ZIP 容器字节不作为导出基线，因为运行时 ZIP 元数据不稳定；比较 `ResourceEx.json`、entry truth table 和每个文件的 SHA-256。

## 3. 输入矩阵

| 输入                              | SHA-256                                                            | 覆盖面                                               |
| --------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `minimal.zip`                     | `62e6123b55e71bd2ba895ac53c704aeb1a4ba6e4ff5b738bd128d7fb79b9d9a2` | 最小包、缺省集合                                     |
| `legacy-pack-info-precedence.zip` | `c2b7f41884a4bc9991576306b9d1ac4ab96928f7e12fba9cc57c159b6ef90ae8` | `packInfo` 与遗留顶层信息并存，前者优先；`null` 集合 |
| `legacy-top-level-pack-info.zip`  | `b9f6f56c752d72a447b9906421cf8782e2b45f781badd44a2792625b540e1ecb` | 缺少 `packInfo` 时使用遗留顶层信息                   |
| `archive-license-missing.zip`     | `cdfc58359d274e9bd9dbaf0ee4d4ade331d5666fe0dfcbe95a442caee0b16d4b` | 缺少 LICENSE、资产/外部文件/目录/`__MACOSX`          |
| `archive-license-empty.zip`       | `7b98aa8e62c256965a9afafb1f9577575818094f3e8abaf848f942abf2de832b` | 空 LICENSE 与完整归档分类                            |
| `archive-license-nonempty.zip`    | `7943a5ee94fe825c9de43fd6ef5f0cd1a8842cae48cf839ce6ca62f246ec355c` | 非空 LICENSE 原样回写                                |
| `invalid-characters-shape.zip`    | `621a51563f8bf2e7d176c5bc0b4552254820229284c9cc89f9c1cd6260fce8`   | `characters` 为对象而非数组                          |
| `dialog-actions.zip`              | `4d1be412ff596b115aba39245369d9e57600c844518cc14d652f8f8e62997046` | 全部 DialogAction，Branch 含 `price`                 |

## 4. 当前归一化与导出事实

- 七个正常夹具均通过当前 UI 完成真实导入和导出。
- 缺失集合和 `null` 集合被补为数组；`packInfo` 存在时忽略遗留顶层信息，整体缺失时才由遗留字段构造。
- 缺失或空 `LICENSE.md` 均进入 `license: ''`，导出不生成 `LICENSE.md`。
- 非空 LICENSE 为 21 字节，输入与导出 SHA-256 均为 `e72c805e3e5ac7d0c24e6a1cc1dbf5db1b79803ac0108fa4ec13688d0ad49a8a`。
- `assets/**` 文件与空目录保留；被 JSON 引用的 `external/referenced.png` 回写；未引用的 `external/unreferenced.bin`、非 assets 空目录和 `__MACOSX/**` 丢弃。
- `dialog-actions` 归一化状态 SHA-256 为 `e481c5a00b23df27ac4be2ea7312cfac24213cb93815fe5ba89499cb94544b26`，导出 JSON 为 `d85e2bb5baf359af939b2f78ff77af1581d0c8f9e7561f3f54443275e208a7a4`。当前导出会裁剪 Branch `price`，补默认 `jump/index/exitCode`，省略空 actions，并清理 `shouldSet: false` 的 sprite。
- 非数组 `characters` 显示 `读取资源包失败: jsonData.characters.map is not a function`。在 clean 状态下失败前后状态 SHA-256 相同且 dirty 保持 `false`。

## 5. 12 个路由的核心增删改路径

| 路由          | ResourceEx 字段       | 冻结的核心路径                                                     |
| ------------- | --------------------- | ------------------------------------------------------------------ |
| `/info`       | `packInfo`、`license` | 编辑名称/Label/版本/描述，新增或删除作者、依赖，编辑 LICENSE       |
| `/character`  | `characters`          | 新增角色，编辑基本信息/立绘/顾客/羁绊/小人配置，删除角色并调整选择 |
| `/dialogue`   | `dialogPackages`      | 新增/编辑/删除对话包、对话和 action，调整 action 顺序与分支引用    |
| `/merchant`   | `merchants`           | 新增商人，编辑名称/商品/对话配置，删除商人                         |
| `/ingredient` | `ingredients`         | 新增原料，编辑属性/标签/贴图，删除原料                             |
| `/food`       | `foods`               | 新增料理，编辑属性/标签/配方引用/贴图，删除料理                    |
| `/recipe`     | `recipes`             | 新增食谱，编辑原料与产物引用，删除食谱                             |
| `/beverage`   | `beverages`           | 新增酒水，编辑属性/标签/贴图，删除酒水                             |
| `/clothes`    | `clothes`             | 新增服装，编辑图标/立绘/小人贴图，删除服装                         |
| `/mission`    | `missionNodes`        | 新增任务节点，编辑条件/奖励/后置节点，删除节点                     |
| `/event`      | `eventNodes`          | 新增事件节点，编辑触发/动作/后置节点，删除节点                     |
| `/asset`      | asset map/folders     | 上传、覆盖、预览、复制、移动、删除文件与目录                       |

各 route 当前自行持有 selected index、预览或折叠等 UI 状态；删除后的选择调整按索引语义执行。Task 7 迁移时需用本表逐路由复验。

## 6. dirty 与离页基线

- 编辑包名称后 dirty 变为 `true`，`beforeunload` 被阻止。
- dirty 状态下取消覆盖导入，字段与 dirty 均不变。
- 导出校验 Modal 选择“返回修改”，不下载且 dirty 不变。
- 明确选择“忽略问题，仍然导出”并成功下载后 dirty 变为 `false`。
- dirty 状态下接受覆盖后导入非法包，原字段保留且 dirty 保持 `true`。
- dirty 状态下接受覆盖后成功导入 `minimal.zip`，状态被替换且 dirty 变为 `false`。

## 7. Object URL 基线

### persistent asset preview

真实浏览器连续操作的累计计数：

1. 导入 `archive-license-missing.zip`：create 6，revoke 0。
2. 再导入 `archive-license-empty.zip`：create 13，revoke 6。
3. 创建空白资源包：create 13，revoke 13。

13 个 create URL 和 13 个 revoke URL 均各自唯一。当前 reader 还会把空 `LICENSE.md` 当普通资产创建 URL，因此第二次导入新增 7 个 URL；这是待 Task 5 修正 owner 的基线缺陷。

### transient image dimensions

| 调用者/路径                   | 浏览器输入                  | create/revoke | 当前事实                                                                                          |
| ----------------------------- | --------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `SpriteUploader` 失败后仍上传 | 损坏 PNG                    | 3/1           | 第一个瞬时 URL 已 revoke；加载失败仍继续 `onUpload`，开发 Strict Mode 下又创建两个 persistent URL |
| `PortraitUploader` 成功       | 精确 `256×359` PNG          | 3/1           | 第一个瞬时 URL 已 revoke；另两个为开发 Strict Mode persistent URL                                 |
| `SpriteUploader` 尺寸确认取消 | `184×184` PNG，期望 `26×26` | 1/1           | 取消分支撤销一次，不写资产                                                                        |
| `PortraitUploader` 加载失败   | 损坏 PNG                    | 3/0           | 一个瞬时 URL 未撤销，上传仍创建两个 persistent URL                                                |
| `SpriteSetEditor` 加载失败    | 损坏 PNG                    | 1/0           | 无 `onerror`，瞬时 URL 未撤销且不写资产                                                           |
| `SpriteGrid` 加载失败         | 损坏 PNG                    | 1/0           | 无 `onerror`，瞬时 URL 未撤销且不写资产                                                           |

因此迁移前只有已完成加载和 `SpriteUploader` 的显式取消路径保证撤销；三个损坏图片路径存在瞬时 URL 泄漏。Task 5/6/7 应统一通过 `readImageDimensions` 让成功、失败和取消都各 revoke 一次。

## 8. 临时证据

生成脚本、实际下载 ZIP、Provider state、Playwright 快照/console 和对象 URL 探针保存在根 `.tmp/`：

- `.tmp/generate-task1-fixtures.mjs`
- `.tmp/analyze-task1-baselines.mjs`
- `.tmp/task1-playwright/**`
- `.tmp/task1-invalid-image.png`
- `.tmp/task1-dev.stdout.log`
- `.tmp/task1-dev.stderr.log`

这些是 Task 1 的普通临时证据，按正式计划保留；本任务专用 npm/Playwright cache、浏览器会话和开发服务器需在阶段结束时清理或关闭。
