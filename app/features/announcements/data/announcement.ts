export const ANNOUNCEMENT_VERSION = 'v0.12.0-2026-08-03';

export const ANNOUNCEMENT_TITLE = 'MetaMystia ResourceEx Editor公告';

export const ANNOUNCEMENT_SUMMARY =
	'现在可以把多个资源包保存在浏览器中。编辑内容会自动保存，刷新页面后也能继续。';

export interface IAnnouncementSection {
	title: string;
	items: string[];
}

export const ANNOUNCEMENT_SECTIONS: IAnnouncementSection[] = [
	{
		title: '自动保存与多资源包',
		items: [
			'编辑内容会自动保存到当前浏览器。关闭或刷新页面后，重新打开工作区即可继续，不需要手动保存。',
			'管理页可以同时保留多个资源包，并分别打开、复制、导出或删除。',
		],
	},
	{
		title: '导入、恢复与导出',
		items: [
			'同一标识符的不同版本可以分别保留。再次导入同一版本时，可以打开已有工作区、创建副本或覆盖。',
			'导出前会指出填写错误、关联内容缺失以及图片或其他文件找不到等问题。',
		],
	},
	{
		title: '编辑更稳妥',
		items: [
			'修改角色、物品、任务、事件、对话包或资产的编号、名称和路径时，使用它们的其他配置会自动跟着更新。',
			'资产管理支持整目录上传、批量选择、复制和移动；移动文件时，ResourceEx.json中的相关路径也会自动更新。',
		],
	},
];
