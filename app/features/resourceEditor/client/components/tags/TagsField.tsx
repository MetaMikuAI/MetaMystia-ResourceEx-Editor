import { useCallback } from 'react';

import { EditorField } from '@/features/resourceEditor/client/components/fields/EditorField';

import { type TTagTone } from './TagButton';
import { TagSelector } from './TagSelector';

interface IProps {
	label: string;
	tags: number[];
	tagPool: { id: number; name: string }[];
	onChange: (newTags: number[]) => void;
	tone?: TTagTone;
}

export function TagsField({
	label,
	onChange,
	tagPool,
	tags,
	tone = 'neutral',
}: IProps) {
	const toggleTag = useCallback(
		(tagId: number) => {
			const newTags = tags.includes(tagId)
				? tags.filter((id) => id !== tagId)
				: [...tags, tagId];
			newTags.sort((a, b) => a - b);
			onChange(newTags);
		},
		[onChange, tags]
	);

	return (
		<EditorField label={label}>
			<TagSelector
				tags={tags}
				tagPool={tagPool}
				onToggle={toggleTag}
				tone={tone}
			/>
		</EditorField>
	);
}
