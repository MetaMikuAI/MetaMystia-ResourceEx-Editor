import { memo, useState } from 'react';
import type { KizunaInfo, EventNode } from '@/types/resource';
import { cn } from '@/lib';
import { ChevronRight } from '@/components/icons/ChevronRight';

interface KizunaInfoEditorProps {
	kizuna: KizunaInfo | undefined;
	allEvents: EventNode[];
	onUpdate: (updates: Partial<KizunaInfo>) => void;
	onEnable: () => void;
	onDisable: () => void;
}

const KIZUNA_FIELDS = [
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

export const KizunaInfoEditor = memo<KizunaInfoEditorProps>(
	function KizunaInfoEditor({
		kizuna,
		allEvents,
		onUpdate,
		onEnable,
		onDisable,
	}) {
		const [isExpanded, setIsExpanded] = useState(false);

		return (
			<div className="flex flex-col gap-4">
				<div className="ml-1 flex items-center justify-between">
					<div
						className="flex cursor-pointer select-none items-center gap-2"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<ChevronRight
							className={cn(
								'transition-transform duration-200',
								isExpanded && 'rotate-90'
							)}
						/>
						<label className="cursor-pointer font-semibold">
							羁绊配置 (Kizuna Info)
						</label>
					</div>
					<button
						onClick={() => {
							if (kizuna) {
								onDisable();
							} else {
								onEnable();
							}
						}}
						className={cn(
							'whitespace-nowrap rounded-full px-3 py-1 text-sm',
							kizuna ? 'btn-mystia-danger' : 'btn-mystia-primary'
						)}
					>
						{kizuna ? '禁用羁绊配置' : '启用羁绊配置'}
					</button>
				</div>

				{isExpanded && kizuna && (
					<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
						<div className="flex flex-col gap-4">
							{KIZUNA_FIELDS.map((field) => (
								<div
									key={field.key}
									className="flex flex-col gap-2"
								>
									<label className="text-sm font-bold opacity-70">
										{field.label}
									</label>
									<select
										value={kizuna[field.key] || ''}
										onChange={(e) =>
											onUpdate({
												[field.key]: e.target.value,
											})
										}
										className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
									>
										<option value="">请选择事件...</option>
										{allEvents.map((e) => (
											<option
												key={e.label}
												value={e.label}
											>
												{e.label} ({e.debugLabel})
											</option>
										))}
									</select>
								</div>
							))}
						</div>
					</div>
				)}

				{isExpanded && !kizuna && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂未启用羁绊配置
						</p>
						<p className="mt-1 text-xs text-black/30 dark:text-white/30">
							点击右侧按钮启用
						</p>
					</div>
				)}
			</div>
		);
	}
);
