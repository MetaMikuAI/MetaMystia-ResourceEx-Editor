export const ANNOUNCEMENT_VERSION = 'v0.13.0-2026-08-07';

export const ANNOUNCEMENT_TITLE = 'MetaMystia ResourceEx Editor公告';

export const ANNOUNCEMENT_SUMMARY =
	'现在可以把多个资源包保存在浏览器中，自动保存后继续编辑；也可以对比同一资源包的不同版本，再决定如何修改新版。';

export interface IAnnouncementSection {
	title: string;
	items: string[];
}

export const ANNOUNCEMENT_SECTIONS: IAnnouncementSection[] = [
	{
		title: '编辑更稳妥',
		items: [
			'编辑内容会自动保存到当前浏览器。关闭或刷新页面后，重新打开工作区即可继续，不需要手动保存。',
			'在对比页采用旧值、恢复缺失内容或删除新增内容前，会先列出实际变更、引用影响和文件冲突。执行后可以撤销最近一次操作。',
			'修改角色、物品、任务、事件、对话包或资产的编号、名称和路径时，使用它们的其他配置会自动跟着更新。',
			'资产管理支持整目录上传、批量选择、复制和移动；移动文件时，ResourceEx.json中的相关路径也会自动更新。',
		],
	},
	{
		title: '对比与恢复',
		items: [
			'可以从管理页快速选择Label相同的旧版，也可以在版本对比页分别选择工作区或上传ZIP文件。旧版只读，新版仍在工作区中编辑和自动保存。',
			'字段和资产差异分开显示，可按资源类型或差异状态筛选，也能搜索字段、路径和值；图片和音频可以直接预览。',
		],
	},
	{
		title: '导入与导出',
		items: [
			'管理页可以同时保留多个资源包，并分别打开、复制、导出或删除。',
			'同一标识符的不同版本可以分别保留。再次导入同一版本时，可以打开已有工作区、创建副本或覆盖。',
			'导出前会指出填写错误、关联内容缺失以及图片或其他文件找不到等问题。',
		],
	},
];
