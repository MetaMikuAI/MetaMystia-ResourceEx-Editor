'use client';

import { cn } from '@heroui/theme';
import {
	memo,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';

import Button from '@/design/ui/components/button';
import ScrollShadow from '@/design/ui/components/scrollShadow';
import { useReducedMotion } from '@/design/ui/hooks/useReducedMotion';

import { SectionAddButton } from '@/features/resourceEditor/client/components/actions/SectionAddButton';
import { ChevronRight } from '@/features/resourceEditor/client/components/icons/ChevronRight';

import { EditorPanel } from './EditorPanel';
import { EmptyState } from './EmptyState';

interface IProps {
	addLabel: string;
	children: ReactNode;
	className?: string;
	emptyDescription?: ReactNode;
	emptyTitle: ReactNode;
	hasItems: boolean;
	onAdd: () => void;
	title: ReactNode;
}

export const EditorCollectionPanel = memo<IProps>(
	function EditorCollectionPanel({
		addLabel,
		children,
		className,
		emptyDescription,
		emptyTitle,
		hasItems,
		onAdd,
		title,
	}) {
		const contentId = useId();
		const titleId = useId();
		const isReducedMotion = useReducedMotion();
		const scrollContainerRef = useRef<HTMLDivElement>(null);
		const pendingItemCountRef = useRef<number | null>(null);
		const [isCollapsed, setIsCollapsed] = useState(false);

		useEffect(() => {
			const pendingItemCount = pendingItemCountRef.current;
			const scrollContainer = scrollContainerRef.current;
			if (pendingItemCount === null || !scrollContainer) return;

			const itemCount = scrollContainer.querySelectorAll(
				'[data-editor-collection-item]'
			).length;
			const selectedItem = scrollContainer.querySelector<HTMLElement>(
				'[data-editor-collection-item][data-selected="true"]'
			);
			if (itemCount <= pendingItemCount || !selectedItem) return;

			pendingItemCountRef.current = null;
			const frame = requestAnimationFrame(() => {
				const currentScrollContainer = scrollContainerRef.current;
				if (!currentScrollContainer) return;

				const containerRect =
					currentScrollContainer.getBoundingClientRect();
				const selectedItemRect = selectedItem.getBoundingClientRect();
				let nextScrollTop = currentScrollContainer.scrollTop;

				if (selectedItemRect.top < containerRect.top) {
					nextScrollTop += selectedItemRect.top - containerRect.top;
				} else if (selectedItemRect.bottom > containerRect.bottom) {
					nextScrollTop +=
						selectedItemRect.bottom - containerRect.bottom;
				} else {
					return;
				}

				currentScrollContainer.scrollTo({
					behavior: isReducedMotion ? 'auto' : 'smooth',
					top: nextScrollTop,
				});
			});

			return () => cancelAnimationFrame(frame);
		});

		return (
			<EditorPanel
				as="aside"
				className={cn(
					'flex h-min min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:overflow-hidden',
					className
				)}
			>
				<div className="flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-2">
					<h2
						id={titleId}
						className="min-w-0 text-xl font-semibold leading-7 text-foreground"
					>
						{title}
					</h2>
					<div className="flex shrink-0 items-center gap-1.5">
						<Button
							isIconOnly
							variant="light"
							size="sm"
							className="h-10 w-10 lg:hidden"
							onPress={() => setIsCollapsed((value) => !value)}
							aria-controls={contentId}
							aria-expanded={!isCollapsed}
							aria-label={isCollapsed ? '展开列表' : '折叠列表'}
						>
							<ChevronRight
								className={cn(
									'h-4 w-4 transition-transform motion-reduce:transition-none',
									isCollapsed ? '-rotate-90' : 'rotate-90'
								)}
							/>
						</Button>
						<SectionAddButton
							onPress={() => {
								pendingItemCountRef.current =
									scrollContainerRef.current?.querySelectorAll(
										'[data-editor-collection-item]'
									).length ?? 0;
								setIsCollapsed(false);
								onAdd();
							}}
						>
							{addLabel}
						</SectionAddButton>
					</div>
				</div>

				<ScrollShadow
					ref={scrollContainerRef}
					aria-labelledby={titleId}
					className="min-h-0 lg:flex-1"
				>
					<div
						id={contentId}
						className={cn(
							'grid transition-[grid-template-rows] motion-reduce:transition-none',
							isCollapsed
								? 'grid-rows-[0fr] overflow-hidden lg:grid-rows-[1fr] lg:overflow-x-auto'
								: 'grid-rows-[1fr] overflow-x-auto'
						)}
					>
						<div className="min-h-0 min-w-0">
							{hasItems ? (
								<div className="flex flex-col gap-2">
									{children}
								</div>
							) : (
								<EmptyState
									title={emptyTitle}
									description={
										emptyDescription ??
										`使用“${addLabel}”添加第一项`
									}
								/>
							)}
						</div>
					</div>
				</ScrollShadow>
			</EditorPanel>
		);
	}
);
