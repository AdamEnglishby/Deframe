if (figma.command === "deframe") {
	(async () => {
		figma.currentPage.selection = await Promise.all(
			figma.currentPage.selection.filter(node => node.type === "FRAME").map(deframeNode)
		);
		figma.closePlugin();
	})();
}

async function deframeNode(node) {
	const {
		name, relativeTransform,
		width, height, x, y, rotation,
		fills, strokes, strokeWeight,
		cornerRadius, cornerSmoothing,
		effects, opacity, blendMode,
		constraints, layoutAlign,
		visible, locked, exportSettings,
		fillStyleId
	} = node;

	const shape = figma.createRectangle();
	shape.resize(width, height); // since we can't `Object.assign` width/height

	try {
		Object.assign(shape, {
			name, relativeTransform,
			x, y, rotation,
			fills, strokes, strokeWeight,
			cornerRadius, cornerSmoothing,
			effects, opacity, blendMode,
			constraints, layoutAlign,
			visible, locked, exportSettings,
		});
	} catch (error) {
		// ignored! it's probably fine
	}

	if (fillStyleId) {
		await shape.setFillStyleIdAsync(fillStyleId); // we also can't `Object.assign` fillStyleId :(
	}

	const nodeIndex = node.parent.children.indexOf(node);

	node.children.forEach((child, index) => {
		const localX = child.x;
		const localY = child.y;

		const [m00, m01, m02] = relativeTransform[0];
		const [m10, m11, m12] = relativeTransform[1];

		node.parent.insertChild(nodeIndex + index, child);

		// calculate new transform based on parent node's relativeTransform
		const newX = m00 * localX + m01 * localY + m02;
		const newY = m10 * localX + m11 * localY + m12;

		child.relativeTransform = [
			[m00, m01, newX],
			[m10, m11, newY],
		];
	});

	node.parent.insertChild(nodeIndex, shape);

	node.remove();

	return shape;
}
