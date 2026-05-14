import { memo, useCallback, useState } from 'react';

import { Button } from '@/design/ui/components';
import { cn } from '@/design/ui/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { WarningBadge } from '@/components/common/WarningBadge';
import { usePackLabelPrefix } from '@/components/common/useLabelPrefixValidation';
import type { Character } from '@/types/resource';

interface CharacterListProps {
	characters: Character[];
	selectedIndex: number | null;
	onAdd: () => void;
	onSelect: (index: number) => void;
}

export const CharacterList = memo<CharacterListProps>(function CharacterList({
	characters,
	selectedIndex,
	onAdd,
	onSelect,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) => {
			return characters.some((c, i) => i !== index && c.id === id);
		},
		[characters]
	);

	const packLabelPrefix = usePackLabelPrefix();
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">角色列表</h2>
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
						{characters.map((char, index) => {
							const isDuplicate = isIdDuplicate(char.id, index);
							const hasPrefixWarning =
								packLabelPrefix &&
								packLabelPrefix !== '_' &&
								char.label &&
								!char.label.startsWith(packLabelPrefix);
							return (
								<button
									key={index}
									onClick={() => {
										onSelect(index);
									}}
									className={cn(
										'surface-pressable flex-col items-start border p-4',
										selectedIndex === index
											? isDuplicate
												? 'border-danger bg-danger/20 shadow-inner'
												: 'border-primary bg-primary/20 shadow-inner'
											: isDuplicate
												? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
												: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									)}
								>
									<div className="flex items-center justify-between gap-2">
										<span className="text-lg font-bold text-foreground">
											{char.name || '未命名角色'}
										</span>
										<div className="flex gap-2">
											{isDuplicate && (
												<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
													ID重复
												</span>
											)}
											{hasPrefixWarning && (
												<WarningBadge>
													前缀不规范
												</WarningBadge>
											)}
										</div>
									</div>
									<div className="font-mono text-xs text-foreground opacity-80">
										ID: {char.id} | {char.type}
									</div>
								</button>
							);
						})}
						{characters.length === 0 && (
							<EmptyState
								title="暂无角色"
								description="点击上方 + 按钮创建"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
