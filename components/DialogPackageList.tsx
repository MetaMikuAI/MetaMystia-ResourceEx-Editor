import type { DialogPackage } from '@/types/resource';

interface DialogPackageListProps {
	packages: DialogPackage[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export function DialogPackageList({
	packages,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}: DialogPackageListProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-black">对话包列表</h2>
				<button
					onClick={onAdd}
					className="rounded-lg bg-black/10 px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-black/20 active:scale-95"
				>
					+ 新建
				</button>
			</div>

			<div className="space-y-2">
				{packages.map((pkg, index) => {
					const isDuplicate =
						packages.some(
							(p, idx) => idx !== index && p.name === pkg.name
						) && pkg.name.length > 0;
					return (
						<div
							key={index}
							className={`rounded-lg border p-3 transition-all ${
								selectedIndex === index
									? 'border-black/30 bg-black/10 shadow-sm'
									: isDuplicate
										? 'border-orange-300 bg-orange-50'
										: 'border-black/10 bg-white/5 hover:border-black/20 hover:bg-white/10'
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<button
									onClick={() => onSelect(index)}
									className="flex-1 text-left"
								>
									<div className="flex items-center gap-2">
										<span className="font-medium text-black">
											{pkg.name}
										</span>
										{isDuplicate && (
											<span className="inline-block rounded bg-orange-500 px-2 py-0.5 text-[8px] font-bold text-white">
												冲突
											</span>
										)}
									</div>
									<div className="mt-1 text-xs text-black/50">
										{pkg.dialogList.length} 条对话
									</div>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (
											confirm('确定要删除这个对话包吗？')
										) {
											onRemove(index);
										}
									}}
									className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 active:scale-95"
									title="删除对话包"
								>
									删除
								</button>
							</div>
						</div>
					);
				})}
				{packages.length === 0 && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center">
						<p className="text-sm text-black/40">暂无对话包</p>
						<p className="mt-1 text-xs text-black/30">
							点击上方按钮创建
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
