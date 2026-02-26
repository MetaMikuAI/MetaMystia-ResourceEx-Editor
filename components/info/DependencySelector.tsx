'use client';

import { cn } from '@/lib';
import { KNOWN_DEPENDENCIES } from '@/lib/constants';

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
					<button
						key={dep}
						type="button"
						onClick={() => toggle(dep)}
						className={cn(
							'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
							selected
								? 'border-primary bg-primary/15 text-primary'
								: 'text-foreground/60 border-black/10 bg-transparent hover:border-black/20 hover:bg-white/5 dark:border-white/10 dark:hover:border-white/20'
						)}
					>
						{dep}
					</button>
				);
			})}
		</div>
	);
}
