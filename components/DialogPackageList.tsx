import { memo, useCallback } from 'react';

import { cn } from '@/lib';
import type { DialogPackage } from '@/types/resource';

interface DialogPackageListProps {
	packages: DialogPackage[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const DialogPackageList = memo<DialogPackageListProps>(
	function DialogPackageList({
		packages,
		selectedIndex,
		onSelect,
		onAdd,
		onRemove,
	}) {
		const isNameDuplicate = useCallback(
			(name: string, index: number) => {
				return packages.some(
					(p, i) => i !== index && p.name === name && name.length > 0
				);
			},
			[packages]
		);

		return (
			<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">对话包列表</h2>
					<button
						onClick={onAdd}
						className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
					>
						+
					</button>
				</div>
				<div className="flex flex-col gap-2">
					{packages.map((pkg, index) => {
						const isDuplicate = isNameDuplicate(pkg.name, index);
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
										onClick={() => {
											onSelect(index);
										}}
										className="flex flex-1 flex-col gap-2 text-left"
									>
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold text-foreground">
												{pkg.name}
											</span>
											{isDuplicate && (
												<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
													命名重复
												</span>
											)}
										</div>
										<div className="font-mono text-xs text-foreground opacity-80">
											{pkg.dialogList.length}条对话
										</div>
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											if (
												confirm(
													'确定要删除这个对话包吗？'
												)
											) {
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
					{packages.length === 0 && (
						<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
							<p className="text-sm text-black/40 dark:text-white/40">
								暂无对话包
							</p>
							<p className="mt-1 text-xs text-black/30 dark:text-white/30">
								点击上方 + 按钮创建
							</p>
						</div>
					)}
				</div>
			</div>
		);
	}
);
