// 获取点i的XYZ索引
const getOffsetXYZ = (i:number) => {
	const offset = 3;
	const index = i * offset;
	const x = index;
	const y = index + 1;
	const z = index + 2;
	return { x, y, z };
};

// 获取点i的RGBA值索引
const getOffsetRGBA =  (i:number) => {
	const offset = 4;
	const index = i * offset;
	const r = index;
	const g = index + 1;
	const b = index + 2;
	const a = index + 3;
	return { r, g, b, a };
};

const getRandomNumInRange = (max = 0, min = 0) => Math.floor(Math.random() * (max + 1 - min)) + min;

export { getOffsetXYZ, getOffsetRGBA, getRandomNumInRange };