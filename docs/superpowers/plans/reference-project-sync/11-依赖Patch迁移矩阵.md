# 依赖 Patch 迁移矩阵

## 1. 迁移规则

固定来源为参考提交 `d3b06126676430943856dfadc0bc8170920f9f72` 的 `patches/`。判断单位是目标最终保留的组件和运行路径，不是“参考项目安装过这个包”。

相关 patch 采用同一流程：

1. 原样复制 patch 文件到目标根 `patches/`；
2. 在 `package.json` 的 `pnpm.patchedDependencies` 按包名登记；
3. 运行 `pnpm install` 生成 lockfile patch hash；
4. 若安装失败，先确认失败包解析版本与矩阵一致；HeroUI 包再按兼容版本组调整，不直接编辑 patch 内容；
5. 比较复制文件与固定参考提交，必须字节一致。

## 2. 原样迁移：8 份

| 包名                      | 目标版本 | 文件                                     | 目标消费路径与必要性                                                                    |
| ------------------------- | -------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `@heroui/button`          | 2.2.10   | `patches/@heroui__button.patch`          | Design Button；移除克隆 icon 时附加的 `tabIndex: -1`                                    |
| `@heroui/ripple`          | 2.2.8    | `patches/@heroui__ripple.patch`          | Design Button/Card 的传递依赖；修正 ripple 定位与 transform                             |
| `@heroui/select`          | 2.4.10   | `patches/@heroui__select.patch`          | resourceEditor Select 直接底层；同步 label 属性，并移除打开时自动滚动行为               |
| `@heroui/system-rsc`      | 2.3.6    | `patches/@heroui__system-rsc.patch`      | Design `extendVariants` 闭包；同步默认 className/slot 合并行为                          |
| `@heroui/theme`           | 2.4.6    | `patches/@heroui__theme.patch`           | 主题直接依赖；Input/Select/menu/custom theme/transition 均受其影响                      |
| `@heroui/tooltip`         | 2.2.8    | `patches/@heroui__tooltip.patch`         | Design Tooltip 直接底层；修正 disabled-animation 与 LazyMotion 结构                     |
| `@heroui/use-aria-button` | 2.2.5    | `patches/@heroui__use-aria-button.patch` | Button/Card/Popover 等传递交互闭包；统一 press/click 移动端行为                         |
| `next`                    | 15.5.22  | `patches/next.patch`                     | `next/font/google` 构建请求改用镜像；同时把 intercepting-route 静态导出错误降为 warning |

目标 `package.json` 登记形态：

```json
{
	"pnpm": {
		"patchedDependencies": {
			"@heroui/button": "patches/@heroui__button.patch",
			"@heroui/ripple": "patches/@heroui__ripple.patch",
			"@heroui/select": "patches/@heroui__select.patch",
			"@heroui/system-rsc": "patches/@heroui__system-rsc.patch",
			"@heroui/theme": "patches/@heroui__theme.patch",
			"@heroui/tooltip": "patches/@heroui__tooltip.patch",
			"@heroui/use-aria-button": "patches/@heroui__use-aria-button.patch",
			"next": "patches/next.patch"
		}
	}
}
```

`@heroui/select` patch 会移除打开菜单时自动滚动到当前选中项；目标 Select 不重新实现该行为。`@heroui/use-aria-button` patch 同步后，Design/HeroUI 可按压组件统一使用 `onPress`，原生 HTML `<button>` 才使用 `onClick`。

`next.patch` 将 Google Fonts CSS 与字体文件的构建请求分别从 `fonts.googleapis.com`、`fonts.gstatic.com` 改为 `fonts.loli.net`、`gstatic.loli.net`。它还会把 intercepting routes 与静态导出的冲突从构建错误降为 warning，但目标架构仍禁止 intercepting routes；该 hunk 不能作为引入不兼容路由的依据。

## 3. 不迁移：9 份

| 包名                    | 结论 | 证据                                                                  |
| ----------------------- | ---- | --------------------------------------------------------------------- |
| `@heroui/accordion`     | U    | 最终依赖与目标 UI 均无 Accordion 调用者                               |
| `@heroui/autocomplete`  | U    | 编辑器使用 Select，不引入 Autocomplete                                |
| `@heroui/avatar`        | U    | 当前 Avatar wrapper 无业务调用者，目标删除该 wrapper 与直接依赖       |
| `@heroui/link`          | U    | App Shell 使用 Next Link 与 Design Button，不保留 HeroUI Link wrapper |
| `@heroui/shared-utils`  | U    | patch 只为 Avatar 增加 `safeInitials`；Avatar patch 不迁入            |
| `@heroui/table`         | U    | 目标编辑器没有 HeroUI Table 调用者                                    |
| `@heroui/tabs`          | U    | 目标编辑器没有 HeroUI Tabs 调用者                                     |
| `@heroui/use-aria-link` | U    | 只属于未迁入的 HeroUI Link 交互闭包                                   |
| `@heroui/use-image`     | U    | 只属于未迁入的 Avatar/Image 加载闭包                                  |

若后续新增上述组件的真实目标调用者，必须重新审计它与成套 patch 的最小闭包，不能只复制单个应用层 wrapper。

## 4. 版本与安装事实

- 固定参考提交只解析 `@heroui/system-rsc@2.3.6`。
- 固定参考提交与目标都使用 `next@15.5.22`，`next.patch` 以该版本产物为基线。
- 目标 Navbar 为 2.2.9，lockfile 只解析 `@heroui/system@2.4.7` 与 `@heroui/system-rsc@2.3.6`。
- 目标当前和固定参考 lockfile 都解析 `framer-motion@12.17.2`、`motion-dom@12.20.1`、`motion-utils@12.19.0`；不为 Motion 新增参考项目没有的 override。
- patch 文件只按包名登记，不增加目标私有 patch，也不修改参考 patch。

## 5. 验收

- [x] `patches/` 恰好包含上述 8 个迁移文件；
- [x] 8 个文件与固定参考提交字节一致；
- [x] `package.json` 按包名一一登记；
- [x] `pnpm install` 无 patch 失败；
- [x] lockfile 含 8 个 patch hash，且没有未登记的 patch；
- [x] 安装产物中的 Google Fonts CSS/字体 URL 已替换为两个镜像域名，构建后字体落入 `_next/static/media`；
- [x] 扫描确认没有 intercepting routes；不得把 Next Patch 的 warning 降级当作静态导出兼容证明；
- [ ] Select、Button/Card、Tooltip、Theme/extended variants 在后续 UI 阶段按应用 patch 后的行为验收；
- [x] patch 导入阶段只验证复制内容、安装和 lockfile；浏览器行为在对应 UI 实施 Task 验证。
