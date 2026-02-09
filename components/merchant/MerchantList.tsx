import { memo, useCallback } from 'react';

import { cn } from '@/lib';
import { EmptyState } from '@/components/common/EmptyState';
import type { MerchantConfig, Character } from '@/types/resource';

interface MerchantListProps {
	merchants: MerchantConfig[];
	allCharacters: Character[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const MerchantList = memo<MerchantListProps>(function MerchantList({
	merchants,
	allCharacters,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isKeyDuplicate = useCallback(
		(key: string, index: number) => {
			return merchants.some(
				(m, i) => i !== index && m.key === key && key.length > 0
			);
		},
		[merchants]
	);

	const getCharacterName = useCallback(
		(label: string) => {
			const char = allCharacters.find((c) => c.label === label);
			return char ? `${char.name} (${label})` : label || '未选择角色';
		},
		[allCharacters]
	);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">商人列表</h2>
				<button
					onClick={onAdd}
					className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					+
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{merchants.map((merchant, index) => {
					const isDuplicate = isKeyDuplicate(merchant.key, index);
					return (
						<div
							key={index}
							className={cn(
								'btn-mystia-primary group border p-4',
								selectedIndex === index
									? isDuplicate
										? 'border-danger bg-danger/20 shadow-inner'
										: 'border-primary bg-primary/20 shadow-inner'
									: isDuplicate
										? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
										: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
							)}
						>
							<div className="flex w-full items-start justify-between gap-2">
								<button
									onClick={() => onSelect(index)}
									className="flex flex-1 flex-col gap-2 text-left"
								>
									<div className="flex items-center gap-2">
										<span className="text-lg font-bold text-foreground">
											{getCharacterName(merchant.key)}
										</span>
										{isDuplicate && (
											<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
												Key重复
											</span>
										)}
									</div>
									<div className="font-mono text-xs text-foreground opacity-80">
										商品数: {merchant.merchandise.length} |
										价格倍率:{' '}
										{merchant.priceMultiplierMin.toFixed(2)}{' '}
										~{' '}
										{merchant.priceMultiplierMax.toFixed(2)}
									</div>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (confirm('确定要删除这个商人吗？')) {
											onRemove(index);
										}
									}}
									className="btn-mystia-danger pointer-events-none rounded-full px-3 py-1 text-sm opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
								>
									删除
								</button>
							</div>
						</div>
					);
				})}
				{merchants.length === 0 && (
					<EmptyState
						title="暂无商人"
						description="点击上方 + 按钮创建"
					/>
				)}
			</div>
		</div>
	);
});
