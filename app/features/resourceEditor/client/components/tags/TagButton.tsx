import { cn } from '@heroui/theme';

interface IProps {
	tag: { id: number; name: string };
	isSelected: boolean;
	onClick: () => void;
	variant?: 'normal' | 'ban';
}

export function TagButton({
	isSelected,
	onClick,
	tag,
	variant = 'normal',
}: IProps) {
	const selectedStyles =
		variant === 'ban'
			? 'border-black bg-[#5d453a] text-[#e6b4a6]'
			: 'border-[#9d5437] bg-[#e6b4a6] text-[#830000]';
	const unselectedStyles =
		'border-black/20 bg-black/5 hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10';

	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={isSelected}
			className={cn(
				'flex items-center border px-2 py-1 text-xs font-bold transition-all',
				isSelected ? selectedStyles : unselectedStyles
			)}
		>
			<span
				className={cn(
					'transition-opacity',
					variant === 'ban' ? 'order-last ml-1' : 'mr-1',
					isSelected ? 'opacity-100' : 'opacity-40'
				)}
			>
				{variant === 'ban' ? '✕' : '⦁'}
			</span>
			{tag.name}
		</button>
	);
}
