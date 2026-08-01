'use client';

import { cn } from '@heroui/theme';

import Button from '@/design/ui/components/button';

import { KNOWN_DEPENDENCIES } from '@/domain/resourcePack/constants';

interface DependencySelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
}

export function DependencySelector({
	value,
	onChange,
}: DependencySelectorProps) {
	const toggle = (dep: string) => {
		if (value.includes(dep)) {
			onChange(value.filter((d) => d !== dep));
		} else {
			onChange([...value, dep]);
		}
	};

	return (
		<div className="flex flex-wrap gap-2">
			{KNOWN_DEPENDENCIES.map((dep) => {
				const selected = value.includes(dep);
				return (
					<Button
						key={dep}
						aria-pressed={selected}
						variant={selected ? 'flat' : 'bordered'}
						color={selected ? 'primary' : 'default'}
						size="sm"
						onPress={() => toggle(dep)}
						className={cn(
							'h-10 rounded-medium border px-3 text-sm font-medium sm:h-8',
							selected
								? 'border-primary bg-primary/20 text-primary-700 dark:text-primary'
								: 'border-divider bg-content1/40 text-foreground-700'
						)}
					>
						{dep}
					</Button>
				);
			})}
		</div>
	);
}
