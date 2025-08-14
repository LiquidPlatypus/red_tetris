// ======== FONCTIONS DE CALCUL ========

/**
 * @brief Calcule la nouvelle position de la pièce.
 * @param {Object} piece - la pièce actuelle.
 * @param {number} dx - Déplacement horizontal.
 * @param {number} dy - Déplacement vertical.
 * @returns {Object} - Nouvelle pièce avec la position mise à jour.
 */
function calculateNewPosition(piece, dx, dy) {
	return {
		...piece,
		x: piece.x + dx,
		y: piece.y + dy,
	};
}

/**
 * @brief Calcule la rotation d'une pièce.
 * @param {Object} piece - la pièce à faire tourner.
 * @returns {Object} - Nouvelle pièce.
 */
function calculateRotation(piece) {
	const rotatedShape = piece.shape[0].map((_, colIndex) =>
		piece.shape.map(row => row[colIndex]).reverse()
	);

	return {
		...piece,
		shape: rotatedShape,
	};
}

/**
 * @brief Vérifie si une pièce peut être placée à une position donnée.
 * @param {Object} piece - la pièce à vérifier.
 * @param {Array} permanentGrid - La grille permanente (ne sera pas modifiée).
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @returns {boolean} - true si la position est valide, sinon false.
 */
export function canPlacePieceAt(piece, permanentGrid, ROWS, COLS) {
	const { x, y, shape } = piece;

	if (!shape || !Array.isArray(shape))
		return false;

	for (let dy = 0; dy < shape.length; dy++) {
		const row = shape[dy];
		for (let dx = 0; dx < row.length; dx++) {
			const cell = row[dx];
			if (cell === "empty")
				continue;

			const px = x + dx;
			const py = y + dy;

			// Vérifie les limites de la grille.
			if (px < 0 || px >= COLS || py >= ROWS)
				return false;

			// Vérifie les collisions avec les pièces existantes.
			if (py >= 0 && permanentGrid[py][px] !== "empty")
				return false;
		}
	}

	return true;
}

/**
 * @brief Calcule la position finale après un hard drop.
 * @param {Object} piece - la pièce à faire tomber.
 * @param {Array} permanentGrid - La grille permanente.
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @returns {Object} - Pièce avec la position finale.
 */
function calculateHardDropPosition(piece, permanentGrid, ROWS, COLS) {
	let testPiece = { ...piece };

	// Descendre la pièce autant que possible
	while (canPlacePieceAt(calculateNewPosition(testPiece, 0, 1), permanentGrid, ROWS, COLS)) {
		testPiece = calculateNewPosition(testPiece, 0, 1);
	}

	return testPiece;
}


/**
 * @brief Calcule la nouvelle grille après avoir fixé la pièce.
 * @param {Array} permanentGrid - La grille permanente.
 * @param {Object} piece - La pièce à fixer.
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @param {number} lines - Nombre de lignes cleared.
 * @returns {Object} - Nouvelle grille + nombre de lignes nettoyées.
 */
export function calculateGridAfterLocking(permanentGrid, piece, ROWS, COLS, lines) {
	// Créer une copie profonde de la grille.
	const newGrid = permanentGrid.map(row => [...row]);
	const { shape, x, y } = piece;

	// Fixer la pièce dans la nouvelle grille.
	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = x + dx;
				const py = y + dy;
				if (py >= 0 && py < ROWS && px >= 0 && px < COLS)
					newGrid[py][px] = value;
			}
		});
	});

	// Calculer les lignes Complètes.
	let linesCleared = lines;
	for (let i = ROWS - 1; i >= 0; i--) {
		if (newGrid[i].every(cell => cell !== "empty")) {
			newGrid.splice(i, 1);
			newGrid.unshift(Array(COLS).fill("empty"));
			linesCleared++;
			i++;
		}
	}

	return { newGrid, linesCleared };
}

/**
 * @brief Calcule la grille visuelle en combinant la grille permanente et la pièce active.
 * @param {Array} permanentGrid - Grille permanente.
 * @param activePiece - Pièce active.
 * @returns {Array} - Nouvelle grille visuelle.
 */
export function calculateVisualGrid(permanentGrid, activePiece) {
	// Copie la grille permanente.
	const visualGrid = permanentGrid.map(row => [...row]);

	if (!activePiece)
		return visualGrid;

	const { shape, x, y } = activePiece;
	const ROWS = permanentGrid.length;
	const COLS = permanentGrid[0].length;

	// Ajoute la pièce active.
	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = x + dx;
				const py = y + dy;
				if (px >= 0 && px < COLS && py >= 0 && py < ROWS)
					visualGrid[py][px] = value;
			}
		});
	});

	return visualGrid;
}

/**
 * @brief Calcule la grille pour afficher la prochaine pièce.
 * @param {Object} nextPiece - Prochaine pièce.
 * @param {number} gridSize - Taille de la grille.
 * @returns {Array} - Grille 4x4 avec la nouvelle pièce.
 */
export function calculateNextPieceGrid(nextPiece, gridSize = 4) {
	const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill("empty"));

	if (!nextPiece || !nextPiece.shape)
		return grid;

	const shape = nextPiece.shape;
	const height = shape.length;
	const width = shape[0].length;

	const offsetX = Math.floor((gridSize - width) / 2);
	const offsetY = Math.floor((gridSize - height) / 2);

	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = offsetX + dx;
				const py = offsetY + dy;
				if (px >= 0 && px < gridSize && py >= 0 && py < gridSize)
					grid[py][px] = value;
			}
		});
	});

	return grid;
}

// ======== FONCTIONS D'ACTIONS ========

/**
 * @brief Tente de placer la pièce active et met à jour l'état si possible.
 * @param {Object} currentPiece - Pièce actuelle.
 * @param {Array} permanentGrid - Grille permanente.
 * @param {number} dx - Déplacement horizontal.
 * @param {number} dy - Déplacement vertical.
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @returns {Object} - { success: boolean, newPiece: Object|null }
 */
export function attemptMove(currentPiece, permanentGrid, dx, dy, ROWS, COLS) {
	const newPiece = calculateNewPosition(currentPiece, dx, dy);

	if (canPlacePieceAt(newPiece, permanentGrid, ROWS, COLS))
		return { success: true, newPiece };

	return { success: false, newPiece: null };
}

/**
 * @brief Tente de faire tourner la pièce active.
 * @param {Object} currentPiece - Pièce actuelle.
 * @param {Array} permanentGrid - Grille permanente.
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @returns {Object} - { success: boolean, newPiece: Object|null }
 */
export function attemptRotation(currentPiece, permanentGrid, ROWS, COLS) {
	const rotatedPiece = calculateRotation(currentPiece);

	if (canPlacePieceAt(rotatedPiece, permanentGrid, ROWS, COLS))
		return { success: true, newPiece: rotatedPiece };

	return { success: false, newPiece: null };
}

/**
 * @brief Tente de faire hard drop la pièce active.
 * @param {Object} currentPiece - Pièce actuelle.
 * @param {Array} permanentGrid - Grille permanente.
 * @param {number} ROWS - Nombre de lignes.
 * @param {number} COLS - Nombre de colonnes.
 * @returns {Object} - { success: boolean, newPiece: Object|null }
 */
export function attemptHardDrop(currentPiece, permanentGrid, ROWS, COLS) {
	const hardDroppedPiece = calculateHardDropPosition(currentPiece, permanentGrid, ROWS, COLS);

	// Si on a bien bougé la pièce, c'est un succès
	const success = (
		hardDroppedPiece.y !== currentPiece.y
		|| hardDroppedPiece.x !== currentPiece.x
	);

	return {
		success,
		newPiece: success ? hardDroppedPiece : null
	};
}

