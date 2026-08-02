import type { Dialog, DialogAction } from './contracts/dialogue';

function adjustDialogJumps(
	dialogs: readonly Dialog[],
	adjust: (target: number) => number
): Dialog[] {
	return dialogs.map((dialog) => {
		if (!dialog.actions) return dialog;
		const actions = dialog.actions.map((action): DialogAction => {
			if (action.actionType === 'Goto') {
				const currentTarget = action.index;
				if (currentTarget === undefined) return action;
				if (!Number.isInteger(currentTarget)) return action;
				const nextTarget = adjust(currentTarget);
				if (nextTarget === currentTarget) return action;
				return { ...action, index: nextTarget };
			}
			if (action.actionType !== 'Branch' || !action.options)
				return action;
			return {
				...action,
				options: action.options.map((option) => {
					const currentTarget = option.jump ?? 1;
					if (!Number.isInteger(currentTarget)) return option;
					const nextTarget = adjust(currentTarget);
					if (nextTarget === currentTarget) return option;
					if (nextTarget === 1) {
						const { jump: ignoredJump, ...rest } = option;
						void ignoredJump;
						return rest;
					}
					return { ...option, jump: nextTarget };
				}),
			};
		});
		return actions.every(
			(action, index) => action === dialog.actions?.[index]
		)
			? dialog
			: { ...dialog, actions };
	});
}

export function adjustDialogJumpsForInsertion(
	dialogs: readonly Dialog[],
	insertionIndex: number
): Dialog[] {
	const insertedDialogNumber = insertionIndex + 1;
	return adjustDialogJumps(dialogs, (target) =>
		target >= insertedDialogNumber ? target + 1 : target
	);
}

export function adjustDialogJumpsForDeletion(
	dialogs: readonly Dialog[],
	deletedIndex: number
): Dialog[] {
	const deletedDialogNumber = deletedIndex + 1;
	return adjustDialogJumps(dialogs, (target) =>
		target > deletedDialogNumber ? target - 1 : target
	);
}
