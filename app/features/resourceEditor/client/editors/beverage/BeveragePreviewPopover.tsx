'use client';

import { EyeIcon } from '@heroui/shared-icons';
import { memo, useMemo } from 'react';

import Button from '@/design/ui/components/button';
import Popover, {
	PopoverContent,
	PopoverTrigger,
} from '@/design/ui/components/popover';

import { BEVERAGE_TAGS } from '@/domain/data/tags';
import type { Beverage } from '@/domain/resourcePack/contracts/items';

import { TagBadge } from '@/features/resourceEditor/client/components/tags/TagButton';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

interface IProps {
	beverage: Beverage;
}

function renderDescription(description: string) {
	return description
		.split(/(\r\n|\r|\n|<br\s*\/?>)/gi)
		.map((part, index) =>
			/^(\r\n|\r|\n|<br\s*\/?>)$/i.test(part) ? <br key={index} /> : part
		);
}

export const BeveragePreviewPopover = memo<IProps>(
	function BeveragePreviewPopover({ beverage }) {
		const { getAssetUrl } = useResourceEditor();
		const tagNames = useMemo(
			() => new Map(BEVERAGE_TAGS.map((item) => [item.id, item.name])),
			[]
		);
		const beverageName = beverage.name || '未命名酒水';
		const spriteUrl = getAssetUrl(beverage.spritePath);

		return (
			<Popover placement="right" showArrow>
				<PopoverTrigger>
					<Button
						isIconOnly
						aria-label={`预览${beverageName}`}
						title={`预览${beverageName}`}
						color="primary"
						variant="flat"
						size="sm"
						className="h-10 w-10 rounded-medium sm:h-8 sm:w-8"
					>
						<EyeIcon className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80 max-w-[calc(100vw-1rem)] p-3">
					<div className="grid w-full gap-3 text-sm text-foreground">
						<div className="flex items-center gap-2">
							{spriteUrl ? (
								<img
									src={spriteUrl}
									alt={beverageName}
									className="image-rendering-pixelated h-8 w-8 shrink-0 object-contain"
								/>
							) : null}
							<div className="min-w-0">
								<p className="truncate font-semibold">
									{beverageName}
								</p>
								<p className="font-mono text-xs text-foreground-500">
									酒水ID：{beverage.id}
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-600">
							<p>售价：{beverage.baseValue}</p>
							<p>等级：{beverage.level}</p>
						</div>

						{beverage.description ? (
							<p className="text-xs leading-5 text-foreground-600">
								{renderDescription(beverage.description)}
							</p>
						) : null}

						{beverage.tags.length > 0 ? (
							<div className="flex flex-wrap gap-1 border-t border-divider pt-3">
								{beverage.tags.map((id) => (
									<TagBadge key={id} tone="beverage">
										{tagNames.get(id) ?? `#${id}`}
									</TagBadge>
								))}
							</div>
						) : null}
					</div>
				</PopoverContent>
			</Popover>
		);
	}
);
