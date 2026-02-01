import { ReactNode } from 'react';
import { cn } from '@/lib';

interface EditorFieldProps {
	label?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	labelClassName?: string;
}

export function EditorField({
	label,
	actions,
	children,
	className,
	labelClassName,
}: EditorFieldProps) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{(label || actions) && (
				<div className="flex items-center justify-between gap-2">
					{label && (
						<label
							className={cn(
								'font-medium text-foreground',
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
