import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

interface IProps {
	label?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	labelClassName?: string;
}

export function EditorField({
	actions,
	children,
	className,
	label,
	labelClassName,
}: IProps) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{(label || actions) && (
				<div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
					{label && (
						<label
							className={cn(
								'min-w-0 text-sm font-medium leading-5 text-foreground-700',
								labelClassName
							)}
						>
							{label}
						</label>
					)}
					{actions}
				</div>
			)}
			{children}
		</div>
	);
}
