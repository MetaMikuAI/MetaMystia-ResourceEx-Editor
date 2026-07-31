import { cn } from '@heroui/theme';
import { memo, type PropsWithChildren } from 'react';

import Card from '@/design/ui/components/card';

interface IProps {
	className?: string;
	as?: 'aside' | 'section';
}

export const EditorPanel = memo<PropsWithChildren<IProps>>(
	function EditorPanel({ as = 'section', children, className }) {
		return (
			<Card
				as={as}
				fullWidth
				shadow="sm"
				className={cn('bg-content1/40 p-4 backdrop-blur', className)}
			>
				{children}
			</Card>
		);
	}
);
