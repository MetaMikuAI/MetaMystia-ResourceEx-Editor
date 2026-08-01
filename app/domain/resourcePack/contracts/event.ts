import type { MissionReward } from './mission';

export interface DayConfig {
	dayType: 'Relative' | 'Absolute';
	dayCalcType: 'Constant' | 'Random';
	day?: number;
	dayRangeMin?: number;
	dayRangeMax?: number;
}

export interface EventNodeTrigger {
	triggerType: string;
	triggerId?: string;
	time?: DayConfig;
	labels?: string[];
	executeOrder?: number;
}

export type EventType = 'Null' | 'Timeline' | 'Dialog';

export interface EventData {
	eventType: EventType;
	dialogPackageName?: string;
}

export interface ScheduledEvent {
	trigger?: EventNodeTrigger;
	eventData?: EventData;
}

export interface EventNode {
	label: string;
	debugLabel: string;
	scheduledEvent?: ScheduledEvent;
	rewards?: MissionReward[];
	postRewards?: MissionReward[];
	postMissionsAfterPerformance?: string[];
	postEvents?: string[];
}
