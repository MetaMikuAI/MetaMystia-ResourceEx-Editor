import { memo, useId } from 'react';

import { cn } from '@/lib';
import { ErrorBadge } from '@/components/ErrorBadge';
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
					<label
						htmlFor={idId}
						className="text-xs font-medium uppercase opacity-60"
					>
						角色ID
					</label>
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
				<label
					htmlFor={idType}
					className="text-xs font-medium uppercase opacity-60"
				>
					角色类型（固定）
				</label>
				<input
					disabled
					id={idType}
					type="text"
					value="Special（稀客）"
					className="h-9 w-full cursor-not-allowed rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none disabled:opacity-50 dark:border-white/10 dark:bg-black/10"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<label
					htmlFor={idName}
					className="text-xs font-medium uppercase opacity-60"
				>
					角色名称
				</label>
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
					<label
						htmlFor={idLabel}
						className="text-xs font-medium uppercase opacity-60"
					>
						内部标签（Label）
					</label>
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
