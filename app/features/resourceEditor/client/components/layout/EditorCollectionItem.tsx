'use client';

import { cn } from '@heroui/theme';
import { memo, type PropsWithChildren, type ReactNode } from 'react';

import Button from '@/design/ui/components/button';

interface IProps {
	actions?: ReactNode;
	className?: string;
	isInvalid?: boolean;
	isSelected?: boolean;
	onSelect: () => void;
}

export const EditorCollectionItem = memo<PropsWithChildren<IProps>>(
	function EditorCollectionItem({
		actions,
		children,
		className,
		isInvalid,
		isSelected,
		onSelect,
	}) {
		return (
			<div
				className={cn(
					'group flex min-w-0 items-stretch overflow-hidden rounded-large border transition-colors motion-reduce:transition-none',
					isInvalid
						? isSelected
							? 'border-danger bg-danger/15'
							: 'border-danger/40 bg-danger/10 hover:bg-danger/15'
						: isSelected
							? 'border-primary bg-primary/15'
							: 'border-divider bg-content1/20 hover:bg-default/30',
					className
				)}
				data-editor-collection-item=""
				data-selected={isSelected || undefined}
			>
				<Button
					variant="light"
					onPress={onSelect}
					className="h-auto min-h-20 min-w-0 flex-1 justify-start rounded-none px-4 py-3 text-left text-foreground data-[hover=true]:!bg-transparent data-[pressed=true]:!bg-transparent data-[hover=true]:!backdrop-blur-none data-[pressed=true]:!backdrop-blur-none"
				>
					<div className="w-full min-w-0">{children}</div>
				</Button>
				{actions !== undefined && (
					<div className="flex shrink-0 items-center justify-center gap-1 border-l border-divider p-2">
						{actions}
					</div>
				)}
			</div>
		);
	}
);

export function EditorCollectionItemTitle({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={cn(
				'flex min-w-0 flex-wrap items-start gap-2 text-base font-semibold leading-6 text-foreground',
				className
			)}
		>
			{children}
		</div>
	);
}

export function EditorCollectionItemMeta({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={cn(
				'mt-1 min-w-0 whitespace-normal break-all font-mono text-xs leading-5 text-foreground-500',
				className
			)}
		>
			{children}
		</div>
	);
}
