if(figma.command === "deframe") {
	figma.currentPage.selection.filter(node => node.type === "FRAME").forEach(deframeNode);
	figma.closePlugin();
}

function deframeNode(node) {
	const {
		name,
		width, height, x, y, rotation,
		fills, strokes, strokeWeight,
		cornerRadius, cornerSmoothing,
		effects, opacity, blendMode,
		constraints, layoutAlign,
		visible, locked, exportSettings
	} = node;

	const shape = figma.createRectangle();
	shape.resize(width, height);
	Object.assign(shape, {
		name, x, y, rotation,
		fills, strokes, strokeWeight,
		cornerRadius, cornerSmoothing,
		effects, opacity, blendMode,
		constraints, layoutAlign,
		visible, locked, exportSettings
	});

	const nodeIndex = node.parent.children.indexOf(node);
	
	node.children.forEach((child, index) => {
		node.parent.insertChild(nodeIndex + index, child);
		child.x += shape.x;
		child.y += shape.y;
	});
	node.parent.insertChild(nodeIndex, shape);

	node.remove();
}
