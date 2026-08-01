import { cn } from '@heroui/theme';
import { memo, type PropsWithChildren } from 'react';

interface IProps {
	className?: string;
	contentClassName?: string;
	columns?: 1 | 3 | 4;
}

export const EditorWorkspace = memo<PropsWithChildren<IProps>>(
	function EditorWorkspace({
		children,
		className,
		columns = 3,
		contentClassName,
	}) {
		return (
			<div className={cn('flex flex-col', className)}>
				<div
					className={cn(
						'container mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:py-8',
						columns === 1
							? 'max-w-4xl'
							: 'max-w-7xl 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl'
					)}
				>
					<div
						className={cn(
							'grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:gap-8',
							columns === 3 && 'lg:grid-cols-3',
							columns === 4 && 'lg:grid-cols-4',
							contentClassName
						)}
					>
						{children}
					</div>
				</div>
			</div>
		);
	}
);
