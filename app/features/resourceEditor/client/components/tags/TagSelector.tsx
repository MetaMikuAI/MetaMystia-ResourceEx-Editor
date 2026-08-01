import { TagButton, type TTagTone } from './TagButton';

interface IProps {
	tags: number[];
	tagPool: { id: number; name: string }[];
	onToggle: (tagId: number) => void;
	tone?: TTagTone;
}

export function TagSelector({
	onToggle,
	tagPool,
	tags,
	tone = 'neutral',
}: IProps) {
	return (
		<div className="flex flex-wrap gap-2 rounded-large border border-divider bg-content2/30 p-3 sm:p-4">
			{tagPool.map((tag) => (
				<TagButton
					key={tag.id}
					tag={tag}
					isSelected={tags.includes(tag.id)}
					onClick={() => onToggle(tag.id)}
					tone={tone}
				/>
			))}
		</div>
	);
}
