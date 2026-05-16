export const ANNOUNCEMENT_VERSION = 'v0.10.2-2026-05-16';

export const ANNOUNCEMENT_TITLE = 'MetaMystia ResourceEx Editor 公告';

export interface AnnouncementSection {
	/** 节段标题。 */
	title: string;
	/** 该节段下的条目，纯文本，自上而下展示。 */
	items: string[];
}

export const ANNOUNCEMENT_SECTIONS: AnnouncementSection[] = [
	{
		title: '近期更新',
		items: [
			'重构资产浏览器，允许自由编辑资产',
			'添加长页面回顶按钮，滚动超过一定高度时显示',
			'添加列表页折叠功能，支持角色、料理、酒水、原料、任务和事件等列表',
			'修复任务节点、事件节点列表的文本溢出和居中对齐问题',
			'统一修复 Select 下拉菜单过宽及删除按钮错位问题，优化长文本显示。',
			'允许为自定义稀客增加 hideInAlbum isParticular isCollabCharacter 配置项',
			'允许在 Event 中设计「和角色对话时(OnTalkWithCharacter)」类型的条件触发器',
			'允许设置原料前缀(Prefix)废案，如需启用，请安装 https://github.com/MetaMystia/PreFix 模组',
			'修复资产页面音频分类的空状态文案，现已与「上传音频」按钮保持一致。',
			'许可证不再写入 ResourceEx.json，仅保存在压缩包内的 LICENSE.md 中；编辑器会忽略 packInfo.license 字段。',
			'新增顶部公告按钮，可从 GitHub 按钮旁随时重新打开公告。',
			'修复设计系统运行时导出问题，稳定 cn、Dropdown、Popover 在生产构建中的行为。',
			'将多个原生下拉框替换为统一 Select 组件，改善深色主题下的选择体验。',
			'抽取通用标签组件 TagButton、TagSelector、TagsField，复用到酒水、料理、原料和任务条件编辑。',
			'公告弹窗已支持按版本首次访问自动展示，关闭后会记录已读版本。',
			'导航下拉项改用 Next Link，切换页面时不再清空已加载资源包数据。',
			'资源包 Label 会校验合法字符，并在导出前阻止无效 Label。',
		],
	},
];
