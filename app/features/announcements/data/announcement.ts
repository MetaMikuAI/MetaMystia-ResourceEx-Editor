export const ANNOUNCEMENT_VERSION = 'v0.11.2-2026-08-01';

export const ANNOUNCEMENT_TITLE = 'MetaMystia ResourceEx Editor公告';

export interface IAnnouncementSection {
	title: string;
	items: string[];
}

export const ANNOUNCEMENT_SECTIONS: IAnnouncementSection[] = [
	{
		title: '近期更新',
		items: [
			'料理与食谱支持预览功能，可在列表点击「预览」按钮查看料理和食谱的详细信息。',
			'允许在任务（Mission）中设计「和角色交谈（TalkWithCharacter）」类型的完成条件。',
			'对话编辑器中允许设计对话「选项分支」「跳转」和「结束」。',
			'允许在任务（Mission）中设计「还债（BillRepayment）」类型的完成条件。',
			'对话编辑器中的CG、BG和音效选择新增资产管理器浏览按钮，点击可打开弹窗以选择资产文件。',
			'角色列表增加特殊顾客「秦心」。',
			'允许在任务（Mission）中设计「交付包含食材的料理（SubmitByIngredients）」「交付包含其中任意一个标签（Tag）的对应物品（SubmitByAnyOneTag）」和「达到目标角色的羁绊等级（ReachTargetCharacterKisunaLevel）」类型的完成条件。',
			'重构资产浏览器，允许自由编辑资产。',
			'添加长页面回顶按钮，滚动超过一定高度时显示。',
			'添加列表页折叠功能，支持角色、料理、酒水、食材、任务和事件等列表。',
			'修复任务节点、事件节点列表的文本溢出和居中对齐问题。',
			'统一修复选择器（Select）下拉菜单过宽及删除按钮错位问题，优化长文本显示。',
			'允许为自定义稀客增加hideInAlbum、isParticular和isCollabCharacter配置项。',
			'允许在事件（Event）中设计「和角色对话时（OnTalkWithCharacter）」类型的条件触发器。',
			'允许设置食材前缀（Prefix）废案，如需启用，请安装PreFix模组：https://github.com/MetaMystia/PreFix。',
			'修复资产页面音频分类的空状态文案，现已与「上传音频」按钮保持一致。',
			'许可证不再写入ResourceEx.json，仅保存在压缩包内的LICENSE.md中；编辑器会忽略packInfo.license字段。',
			'新增顶部公告按钮，可从GitHub按钮旁随时重新打开公告。',
			'修复设计系统运行时导出问题，稳定cn、Dropdown、Popover在生产构建中的行为。',
			'将多个原生下拉框替换为统一Select组件，改善深色主题下的选择体验。',
			'抽取通用标签组件TagButton、TagSelector、TagsField，复用到酒水、料理、食材和任务条件编辑。',
			'公告弹窗已支持按版本首次访问自动展示，关闭后会记录已读版本。',
			'导航下拉项改用Next Link，切换页面时不再清空已加载资源包数据。',
			'资源包标识符（Label）会校验合法字符，并在导出前阻止无效标识符。',
		],
	},
];
