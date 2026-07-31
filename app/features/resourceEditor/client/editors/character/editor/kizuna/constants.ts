export const EVENT_FIELDS = [
	{
		key: 'lv1UpgradePrerequisiteEvent',
		label: 'LV1 升级任务前置 (Event Label)',
	},
	{
		key: 'lv2UpgradePrerequisiteEvent',
		label: 'LV2 升级任务前置 (Event Label)',
	},
	{
		key: 'lv3UpgradePrerequisiteEvent',
		label: 'LV3 升级任务前置 (Event Label)',
	},
	{
		key: 'lv4UpgradePrerequisiteEvent',
		label: 'LV4 升级任务前置 (Event Label)',
	},
] as const;

export const DIALOG_FIELDS = [
	{ key: 'lv1Welcome', label: 'LV1 欢迎对话' },
	{ key: 'lv2Welcome', label: 'LV2 欢迎对话' },
	{ key: 'lv3Welcome', label: 'LV3 欢迎对话' },
	{ key: 'lv4Welcome', label: 'LV4 欢迎对话' },
	{ key: 'lv5Welcome', label: 'LV5 欢迎对话' },
	{ key: 'lv1ChatData', label: 'LV1 闲聊对话' },
	{ key: 'lv2ChatData', label: 'LV2 闲聊对话' },
	{ key: 'lv3ChatData', label: 'LV3 闲聊对话' },
	{ key: 'lv4ChatData', label: 'LV4 闲聊对话' },
	{ key: 'lv5ChatData', label: 'LV5 闲聊对话' },
	{ key: 'lv2InviteSucceed', label: 'LV2 邀请成功对话' },
	{ key: 'lv2InviteFailed', label: 'LV2 邀请失败对话' },
	{ key: 'lv3InviteSucceed', label: 'LV3 邀请成功对话' },
	{ key: 'lv3InviteFailed', label: 'LV3 邀请失败对话' },
	{ key: 'lv4InviteSucceed', label: 'LV4 邀请成功对话' },
	{ key: 'lv4InviteFailed', label: 'LV4 邀请失败对话' },
	{ key: 'lv5InviteSucceed', label: 'LV5 邀请成功对话' },
	{ key: 'lv3RequestIngerdient', label: 'LV3 请求原料对话' },
	{ key: 'lv4RequestIngerdient', label: 'LV4 请求原料对话' },
	{ key: 'lv5RequestIngerdient', label: 'LV5 请求原料对话' },
	{ key: 'lv4RequestBeverage', label: 'LV4 请求酒水对话' },
	{ key: 'lv5RequestBeverage', label: 'LV5 请求酒水对话' },
	{ key: 'lv5Commision', label: 'LV5 委托采集对话' },
	{ key: 'lv5CommisionFinish', label: 'LV5 委托采集完成对话' },
] as const;

export const MAP_FIELD = {
	key: 'commisionAreaLabel',
	label: '委托采集地图 (Commission Area)',
} as const;
