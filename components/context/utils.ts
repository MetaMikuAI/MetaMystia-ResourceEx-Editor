type TPlainObject = { [key: string]: any };

const isArray = (value: unknown) => Array.isArray(value);
const isObject = (value: unknown): value is object =>
	typeof value === 'object' && value !== null;
const isString = (value: unknown) => typeof value === 'string';

const replaceCRLF = (str: string) => str.replace(/\r\n/g, '\n');
const trim = (str: string) => str.trim();

export const trimCRLF = (data: TPlainObject) => {
	for (const key in data) {
		if (isString(data[key])) {
			data[key] = replaceCRLF(trim(data[key]));
		} else if (isArray(data[key])) {
			data[key] = data[key].map((item) => {
				if (isString(item)) {
					return replaceCRLF(trim(item));
				} else if (isObject(item)) {
					trimCRLF(item);
					return item;
				}
				return item;
			});
		} else if (isObject(data[key])) {
			trimCRLF(data[key]);
		}
	}
};

export const sortValues = (data: TPlainObject) => {
	// 1) characters (by id)
	if (isArray(data['characters'])) {
		data['characters'].sort((a, b) => Number(a.id) - Number(b.id));

		data['characters'].forEach((character) => {
			const guest = character && character.guest;
			if (!guest) return;

			// foodRequests (by tagId)
			if (isArray(guest.foodRequests)) {
				guest.foodRequests.sort(
					(x: any, y: any) => Number(x.tagId) - Number(y.tagId)
				);
			}

			// bevRequests (by tagId)
			if (isArray(guest.bevRequests)) {
				guest.bevRequests.sort(
					(x: any, y: any) => Number(x.tagId) - Number(y.tagId)
				);
			}

			// hateFoodTag (array of numbers)
			if (isArray(guest.hateFoodTag)) {
				guest.hateFoodTag.sort(
					(a: any, b: any) => Number(a) - Number(b)
				);
			}

			// likeFoodTag (by tagId)
			if (isArray(guest.likeFoodTag)) {
				guest.likeFoodTag.sort(
					(x: any, y: any) => Number(x.tagId) - Number(y.tagId)
				);
			}

			// likeBevTag (by tagId)
			if (isArray(guest.likeBevTag)) {
				guest.likeBevTag.sort(
					(x: any, y: any) => Number(x.tagId) - Number(y.tagId)
				);
			}

			// spawn (by izakayaId) — if present at guest.spawn
			if (isArray(guest.spawn)) {
				guest.spawn.sort(
					(x: any, y: any) =>
						Number(x.izakayaId) - Number(y.izakayaId)
				);
			}
		});
	}

	// 2) ingredients (by id) and ingredients.tags
	if (isArray(data['ingredients'])) {
		data['ingredients'].sort((a, b) => Number(a.id) - Number(b.id));
		data['ingredients'].forEach((ing) => {
			if (isArray(ing.tags))
				ing.tags.sort((a: any, b: any) => Number(a) - Number(b));
		});
	}

	// 3) foods (by id) and foods.tags, foods.banTags
	if (isArray(data['foods'])) {
		data['foods'].sort((a, b) => Number(a.id) - Number(b.id));
		data['foods'].forEach((food) => {
			if (isArray(food.tags))
				food.tags.sort((a: any, b: any) => Number(a) - Number(b));
			if (isArray(food.banTags))
				food.banTags.sort((a: any, b: any) => Number(a) - Number(b));
		});
	}

	// 4) beverages (by id) and beverages.tags
	if (isArray(data['beverages'])) {
		data['beverages'].sort((a, b) => Number(a.id) - Number(b.id));
		data['beverages'].forEach((bev) => {
			if (isArray(bev.tags))
				bev.tags.sort((a: any, b: any) => Number(a) - Number(b));
		});
	}

	// 5) recipes (by id)
	if (isArray(data['recipes'])) {
		data['recipes'].sort((a, b) => Number(a.id) - Number(b.id));
	}
};
