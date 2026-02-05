import { memo, useId } from 'react';

import { cn } from '@/lib';
import { ErrorBadge } from '@/components/common/ErrorBadge';
import { Label } from '@/components/common/Label';
import type { Character } from '@/types/resource';

interface BasicInfoProps {
	character: Character;
	isIdDuplicate: boolean;
	onUpdate: (updates: Partial<Character>) => void;
}

export const BasicInfo = memo<BasicInfoProps>(function BasicInfo({
	character,
	isIdDuplicate,
	onUpdate,
}) {
	const idId = useId();
	const idLabel = useId();
	const idName = useId();
	const idType = useId();

	const isIdTooSmall = character.id < 9000;
	const isLabelInvalid = !character.label.startsWith('_');

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between">
					<Label
						htmlFor={idId}
						tip={
							'必须保证全局唯一\n0-5999为游戏原有稀客，6000-8999为游戏保留段，9000-11999为MetaMystia使用段，其他资源包请使用12000及以上的ID\n全局：游戏以及全部资源包'
						}
					>
						角色ID
					</Label>
					<div className="flex gap-2">
						{isIdDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
						{isIdTooSmall && <ErrorBadge>ID需&ge;9000</ErrorBadge>}
					</div>
				</div>
				<input
					id={idId}
					type="number"
					value={character.id}
					onChange={(e) => {
						onUpdate({ id: parseInt(e.target.value) || 0 });
					}}
					className={cn(
						'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
						isIdDuplicate || isIdTooSmall
							? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
							: 'border-black/10 dark:border-white/10'
					)}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<Label htmlFor={idType} tip="角色类型，固定为Special">
					角色类型（固定）
				</Label>
				<input
					disabled
					id={idType}
					type="text"
					value="Special（稀客）"
					className="h-9 w-full cursor-not-allowed rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none disabled:opacity-50 dark:border-white/10 dark:bg-black/10"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<Label htmlFor={idName} tip="角色名称，例如：大妖精">
					角色名称
				</Label>
				<input
					id={idName}
					type="text"
					value={character.name}
					onChange={(e) => {
						onUpdate({ name: e.target.value });
					}}
					className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between">
					<Label
						htmlFor={idLabel}
						tip={
							'必须保证全局唯一\n必须以下划线_开头\n通常可以是英文名，例如：_Daiyousei\n全局：游戏以及全部资源包'
						}
					>
						标签（Label）
					</Label>
					{isLabelInvalid && <ErrorBadge>必须以_开头</ErrorBadge>}
				</div>
				<input
					id={idLabel}
					type="text"
					value={character.label}
					onChange={(e) => {
						onUpdate({ label: e.target.value });
					}}
					className={cn(
						'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
						isLabelInvalid
							? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
							: 'border-black/10 dark:border-white/10'
					)}
				/>
			</div>
		</div>
	);
});
