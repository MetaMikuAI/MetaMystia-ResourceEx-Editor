import { memo, useCallback, useId } from 'react';

import { DialogItemWrapper } from '@/components/dialog/DialogItem';
import { ErrorBadge } from '@/components/ErrorBadge';
import { cn } from '@/lib';
import type { Dialog, DialogPackage } from '@/types/resource';

interface DialogEditorProps {
	allPackages: DialogPackage[];
	dialogPackage: DialogPackage | null;
	packageIndex: number | null;
	onAddDialog: (
		insertIndex?: number,
		searchPosition?: Dialog['position'] | 'recent'
	) => void;
	onRemoveDialog: (index: number) => void;
	onUpdate: (updates: Partial<DialogPackage>) => void;
	onUpdateDialog: (index: number, updates: Partial<Dialog>) => void;
}

export const DialogEditor = memo<DialogEditorProps>(function DialogEditor({
	allPackages,
	dialogPackage,
	packageIndex,
	onAddDialog,
	onRemoveDialog,
	onUpdate,
	onUpdateDialog,
}) {
	const id = useId();

	const isNameDuplicate = useCallback(
		(name: string, index: number | null) => {
			return allPackages.some(
				(p, i) => i !== index && p.name === name && name.length > 0
			);
		},
		[allPackages]
	);

	if (!dialogPackage) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:col-span-2">
				<div className="flex items-center justify-center text-center font-semibold italic opacity-30">
					请在左侧选择一个对话包进行编辑，或点击 + 按钮创建新对话包
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:col-span-2">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<label
						htmlFor={id}
						className="block w-full text-sm font-medium opacity-80"
					>
						对话包名称
					</label>
					{isNameDuplicate(dialogPackage.name, packageIndex) && (
						<ErrorBadge>命名重复</ErrorBadge>
					)}
				</div>
				<input
					id={id}
					type="text"
					value={dialogPackage.name}
					onChange={(e) => {
						onUpdate({ name: e.target.value });
					}}
					className={cn(
						'w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
						isNameDuplicate(dialogPackage.name, packageIndex)
							? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
							: 'border-black/10 dark:border-white/10'
					)}
				/>
			</div>
			<div className="flex items-center justify-between">
				<span className="block w-full text-sm font-medium opacity-80">
					对话列表（{dialogPackage.dialogList.length}）
				</span>
				<button
					onClick={() => {
						onAddDialog();
					}}
					className="btn-mystia-primary whitespace-nowrap px-3 py-1 text-sm"
				>
					添加对话
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{/* 在列表首位添加插入按钮 */}
				{dialogPackage.dialogList.length > 0 && (
					<button
						onClick={() => {
							onAddDialog(0);
						}}
						className="btn-mystia w-full rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
					>
						在顶部插入对话
					</button>
				)}
				{dialogPackage.dialogList.map((dialog, index) => (
					<div key={index} className="flex flex-col gap-2">
						<DialogItemWrapper
							dialog={dialog}
							index={index}
							onRemove={() => {
								onRemoveDialog(index);
							}}
							onUpdate={(updates) =>
								onUpdateDialog(index, updates)
							}
						/>
						<div className="flex w-full gap-1">
							<button
								onClick={() => {
									onAddDialog(index + 1, 'Left');
								}}
								className="btn-mystia flex-1 rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
								title="使用上方最近的左侧角色"
							>
								↑ 左
							</button>
							<button
								onClick={() => {
									onAddDialog(index + 1, 'recent');
								}}
								className="btn-mystia flex-[2] rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
								title="使用上方最近的对话"
							>
								在此处插入对话
							</button>
							<button
								onClick={() => {
									onAddDialog(index + 1, 'Right');
								}}
								className="btn-mystia flex-1 rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
								title="使用上方最近的右侧角色"
							>
								右 ↑
							</button>
						</div>
					</div>
				))}
				{dialogPackage.dialogList.length === 0 && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂无对话
						</p>
						<p className="mt-1 text-xs text-black/30 dark:text-white/30">
							点击上方按钮添加
						</p>
					</div>
				)}
			</div>
		</div>
	);
});
