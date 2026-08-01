export const EVENT_FIELDS = [
	{
		key: 'lv1UpgradePrerequisiteEvent',
		label: 'LV1升级任务前置（Event Label）',
	},
	{
		key: 'lv2UpgradePrerequisiteEvent',
		label: 'LV2升级任务前置（Event Label）',
	},
	{
		key: 'lv3UpgradePrerequisiteEvent',
		label: 'LV3升级任务前置（Event Label）',
	},
	{
		key: 'lv4UpgradePrerequisiteEvent',
		label: 'LV4升级任务前置（Event Label）',
	},
] as const;

export const DIALOG_FIELDS = [
	{ key: 'lv1Welcome', label: 'LV1欢迎对话' },
	{ key: 'lv2Welcome', label: 'LV2欢迎对话' },
	{ key: 'lv3Welcome', label: 'LV3欢迎对话' },
	{ key: 'lv4Welcome', label: 'LV4欢迎对话' },
	{ key: 'lv5Welcome', label: 'LV5欢迎对话' },
	{ key: 'lv1ChatData', label: 'LV1闲聊对话' },
	{ key: 'lv2ChatData', label: 'LV2闲聊对话' },
	{ key: 'lv3ChatData', label: 'LV3闲聊对话' },
	{ key: 'lv4ChatData', label: 'LV4闲聊对话' },
	{ key: 'lv5ChatData', label: 'LV5闲聊对话' },
	{ key: 'lv2InviteSucceed', label: 'LV2邀请成功对话' },
	{ key: 'lv2InviteFailed', label: 'LV2邀请失败对话' },
	{ key: 'lv3InviteSucceed', label: 'LV3邀请成功对话' },
	{ key: 'lv3InviteFailed', label: 'LV3邀请失败对话' },
	{ key: 'lv4InviteSucceed', label: 'LV4邀请成功对话' },
	{ key: 'lv4InviteFailed', label: 'LV4邀请失败对话' },
	{ key: 'lv5InviteSucceed', label: 'LV5邀请成功对话' },
	{ key: 'lv3RequestIngerdient', label: 'LV3请求食材对话' },
	{ key: 'lv4RequestIngerdient', label: 'LV4请求食材对话' },
	{ key: 'lv5RequestIngerdient', label: 'LV5请求食材对话' },
	{ key: 'lv4RequestBeverage', label: 'LV4请求酒水对话' },
	{ key: 'lv5RequestBeverage', label: 'LV5请求酒水对话' },
	{ key: 'lv5Commision', label: 'LV5委托采集对话' },
	{ key: 'lv5CommisionFinish', label: 'LV5委托采集完成对话' },
] as const;

export const MAP_FIELD = {
	key: 'commisionAreaLabel',
	label: '委托采集地图（Commission Area）',
} as const;
