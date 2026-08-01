import { cn } from '@heroui/theme';
import { memo, type PropsWithChildren, type ReactNode } from 'react';

interface IProps {
	actions?: ReactNode;
	className?: string;
	title?: ReactNode;
}

export const EditorSection = memo<PropsWithChildren<IProps>>(
	function EditorSection({ actions, children, className, title }) {
		return (
			<section
				className={cn(
					'flex min-w-0 flex-col gap-4 rounded-large border border-divider bg-content2/30 p-4',
					className
				)}
			>
				{(title !== undefined || actions !== undefined) && (
					<div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
						{title !== undefined && (
							<h3 className="min-w-0 text-base font-semibold leading-6 text-foreground-700">
								{title}
							</h3>
						)}
						{actions !== undefined && (
							<div className="flex shrink-0 flex-wrap items-center gap-2">
								{actions}
							</div>
						)}
					</div>
				)}
				{children}
			</section>
		);
	}
);
