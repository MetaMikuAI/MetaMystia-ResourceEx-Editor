import { memo, useCallback, useState } from 'react';

import { Button } from '@/design/ui/components';
import { cn } from '@/design/ui/utils';
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

	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">商人列表</h2>
				<div className="flex items-center gap-1">
					<Button
						isIconOnly
						variant="light"
						size="sm"
						className="h-8 w-8 lg:hidden"
						onPress={() => setIsCollapsed((v) => !v)}
						aria-label={isCollapsed ? '展开列表' : '折叠列表'}
					>
						<svg
							viewBox="0 0 24 24"
							className={cn(
								'h-4 w-4 transition-transform duration-200',
								isCollapsed ? '-rotate-90' : 'rotate-0'
							)}
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</Button>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onAdd}
						className="h-8 w-8 text-lg"
					>
						+
					</Button>
				</div>
			</div>
			<div
				className={cn(
					'grid transition-all duration-300',
					isCollapsed
						? 'grid-rows-[0fr] lg:grid-rows-[1fr]'
						: 'grid-rows-[1fr]'
				)}
				style={{ overflow: isCollapsed ? 'hidden' : undefined }}
			>
				<div className="min-h-0">
					<div className="flex flex-col gap-2">
						{merchants.map((merchant, index) => {
							const isDuplicate = isKeyDuplicate(
								merchant.key,
								index
							);
							return (
								<div
									key={index}
									className={cn(
										'surface-pressable group border p-4',
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
													{getCharacterName(
														merchant.key
													)}
												</span>
												{isDuplicate && (
													<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
														Key重复
													</span>
												)}
											</div>
											<div className="font-mono text-xs text-foreground opacity-80">
												商品数:{' '}
												{merchant.merchandise.length} |
												价格倍率:{' '}
												{merchant.priceMultiplierMin.toFixed(
													2
												)}{' '}
												~{' '}
												{merchant.priceMultiplierMax.toFixed(
													2
												)}
											</div>
										</button>
										<Button
											color="danger"
											size="sm"
											radius="full"
											onPress={() => {
												if (
													confirm(
														'确定要删除这个商人吗？'
													)
												) {
													onRemove(index);
												}
											}}
											className="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
										>
											删除
										</Button>
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
			</div>
		</div>
	);
});
