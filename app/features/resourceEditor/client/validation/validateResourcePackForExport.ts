import 'client-only';

import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';
import {
	type IResourcePackValidationIssue,
	validateResourcePackRules,
} from '@/domain/resourcePack/validation';

import { verifyIdRange } from '@/infrastructure/browser/crypto/idRangeSignature';

export type { IResourcePackValidationIssue };

export async function validateResourcePackForExport(
	resourcePack: ResourceEx,
	availableAssetPaths?: Iterable<string>
): Promise<IResourcePackValidationIssue[]> {
	const { idRangeEnd, idRangeStart, idSignature, label } =
		resourcePack.packInfo;
	let isIdSignatureValid: boolean | undefined;

	if (label && idRangeStart != null && idRangeEnd != null && idSignature) {
		isIdSignatureValid = await verifyIdRange(
			label,
			idRangeStart,
			idRangeEnd,
			idSignature
		);
	}

	return validateResourcePackRules(resourcePack, {
		...(availableAssetPaths
			? { availableAssetPaths: new Set(availableAssetPaths) }
			: {}),
		...(isIdSignatureValid === undefined ? {} : { isIdSignatureValid }),
	});
}
