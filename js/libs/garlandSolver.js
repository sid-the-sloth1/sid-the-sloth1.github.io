
class GarlandSolver {
    #problemGrid;
    #tempGrid;
    #possible_rotations_obj;
    constructor(grid) {
        try {
            // Validate grid is an object
            if (typeof grid !== 'object' || grid === null) {
                throw new Error('Input must be a valid grid JSON object');
            }

            // Validate ends array
            if (!Array.isArray(grid.ends) || grid.ends.length !== 2) {
                throw new Error('Grid must have exactly 2 ends');
            }

            // Validate each end
            grid.ends.forEach((end, index) => {
                if (!Array.isArray(end.position) || end.position.length !== 2) {
                    throw new Error(`End ${index} position must be an array of [x,y] coordinates`);
                }
                if (!['l', 'r', 't', 'b'].includes(end.side)) {
                    throw new Error(`End ${index} side must be one of: l, r, t, b`);
                }
            });

            // Validate tails structure
            if (!Array.isArray(grid.tails) || grid.tails.length !== 5) {
                throw new Error('Grid must have 5 rows in tails array');
            }

            grid.tails.forEach((row, rowIndex) => {
                if (!Array.isArray(row) || row.length !== 5) {
                    throw new Error(`Row ${rowIndex} must have exactly 5 columns`);
                }

                row.forEach((cell, colIndex) => {
                    if (cell !== null) {
                        // Validate cell structure
                        if (typeof cell !== 'object') {
                            throw new Error(`Cell at [${rowIndex},${colIndex}] must be an object or null`);
                        }

                        // Validate required cell properties
                        const requiredProps = ['imageName', 'rotation', 'connections'];
                        requiredProps.forEach(prop => {
                            if (!(prop in cell)) {
                                throw new Error(`Cell at [${rowIndex},${colIndex}] missing required property: ${prop}`);
                            }
                        });

                        // Validate imageName
                        if (typeof cell.imageName !== 'string') {
                            throw new Error(`Cell at [${rowIndex},${colIndex}] imageName must be a string`);
                        }

                        // Validate connections
                        if (!Array.isArray(cell.connections)) {
                            throw new Error(`Cell at [${rowIndex},${colIndex}] connections must be an array`);
                        }

                        cell.connections.forEach(conn => {
                            if (!['l', 'r', 't', 'b'].includes(conn)) {
                                throw new Error(`Cell at [${rowIndex},${colIndex}] has invalid connection direction: ${conn}`);
                            }
                        });
                    }
                });
            });


            this.#problemGrid = grid;
            this.#possible_rotations_obj = {};
        } catch (error) {
            throw new Error(`Invalid grid structure: ${error.message}`);
        }
    }

    #getEnds(grid) {
        return { "end1_x": grid.ends[0].position[0], "end1_y": grid.ends[0].position[1], "end1_dir": grid.ends[0].side, "end2_x": grid.ends[1].position[0], "end2_y": grid.ends[1].position[1], "end2_dir": grid.ends[1].side }
    }
    #isEnd(ends, aa, bb) {
        if (ends.end1_x === aa && ends.end1_y === bb) return [ends.end1_dir, true];
        if (ends.end2_x === aa && ends.end2_y === bb) return [ends.end2_dir, true];
        return false;
    }
    #isNullOrOutOfBounds(grid, a, b) {
        if (a < 0 || a > 4 || b < 0 || b > 4) return true;
        return grid.tails[a][b] === null;
    }
    #removeDuplicates(array) {
        return array.filter((item, index, self) =>
            index === self.findIndex((t) =>
                t.rot === item.rot && JSON.stringify(t.connections) === JSON.stringify(item.connections)
            )
        )
    }
    #getAdjacentCell(grid, a, b, direction) {
        switch (direction) {
            case "r":
                if (this.#isNullOrOutOfBounds(grid, a, b + 1)) return null;
                return grid.tails[a][b + 1];
            case "l":
                if (this.#isNullOrOutOfBounds(grid, a, b - 1)) return null;
                return grid.tails[a][b - 1];
            case "t":
                if (this.#isNullOrOutOfBounds(grid, a - 1, b)) return null;
                return grid.tails[a - 1][b];
            case "b":
                if (this.#isNullOrOutOfBounds(grid, a + 1, b)) return null;
                return grid.tails[a + 1][b];
        }
    }
    #getOppositeDir(direction) {
        const dir_obj = { "r": "l", "l": "r", "t": "b", "b": "t" };
        return dir_obj[direction];
    }
    #getAdjacentCords(a, b, direction) {
        switch (direction) {
            case "r":
                return [a, b + 1];
            case "l":
                return [a, b - 1];
            case "t":
                return [a - 1, b];
            case "b":
                return [a + 1, b];
        }
    }
    #isSolved(gridData) {
        let a = 0;
        let b = 0;
        const ends = this.#getEnds(gridData);
        for (let i = 0; i < 25; i++) {
            if (!this.#isNullOrOutOfBounds(gridData, a, b)) {
                const cell = gridData.tails[a][b];
                const connections = cell.connections;
                for (const connection of connections) {
                    const adjacentCell = this.#getAdjacentCell(gridData, a, b, connection);
                    if (adjacentCell === null) {
                        if (ends.end1_x === a && ends.end1_y === b) {
                            if (!connections.includes(ends.end1_dir)) {
                                return false;
                            }
                        } else if (ends.end2_x === a && ends.end2_y === b) {
                            if (!connections.includes(ends.end2_dir)) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        const adjacentCellConnections = adjacentCell.connections;
                        if (!adjacentCellConnections.includes(this.#getOppositeDir(connection))) {
                            return false;
                        }
                    }
                }
            }
            if (b === 4) {
                b = 0;
                a += 1;
            } else {
                b += 1;
            }
        }
        ////
        return true;
    }

    //////
    #createPossibleOptions() {
        const gridData = this.#problemGrid;
        const ends = this.#getEnds(gridData);
        const matrix = gridData;
        this.#possible_rotations_obj = {};
        let a = 0;
        let b = 0;
        const addToPossibleRotations = (a, b, rot, connections) => {
            if (!this.#possible_rotations_obj[`${a}_${b}`]) {
                this.#possible_rotations_obj[`${a}_${b}`] = [{ "rot": rot, "connections": connections }];
            } else {
                this.#possible_rotations_obj[`${a}_${b}`].push({ "rot": rot, "connections": connections });
            }
        };

        ////the big boi loop
        for (let i = 0; i < 25; i++) {
            if (!this.#isNullOrOutOfBounds(gridData, a, b)) {
                const img = matrix.tails[a][b].imageName;
                if (!img.includes("cross")) {
                    if (img.includes("angle")) {
                        //top row. x=0
                        if (a === 0) {
                            if (!this.#isEnd(ends, a, b)) {
                                // check left cell
                                if (!this.#isNullOrOutOfBounds(gridData, a, b - 1)) {
                                    addToPossibleRotations(a, b, 180, ["l", "b"]);
                                }
                                // check right cell
                                if (!this.#isNullOrOutOfBounds(gridData, a, b + 1)) {
                                    addToPossibleRotations(a, b, 90, ["r", "b"]);
                                }
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === "t") {
                                    // check left cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a, b - 1)) {
                                        addToPossibleRotations(a, b, 270, ["l", "t"]);
                                    }
                                    // check right cell

                                    if (!this.#isNullOrOutOfBounds(gridData, a, b + 1)) {
                                        addToPossibleRotations(a, b, 0, ["r", "t"]);
                                    }
                                } else if (endDir === "l") {
                                    addToPossibleRotations(a, b, 180, ["l", "b"]);
                                } else if (endDir === "r") {
                                    addToPossibleRotations(a, b, 90, ["r", "b"]);
                                }
                            }
                        } else if (a === 4) {
                            if (!this.#isEnd(ends, a, b)) {
                                // check left cell
                                if (!this.#isNullOrOutOfBounds(gridData, a, b - 1)) {
                                    addToPossibleRotations(a, b, 270, ["l", "t"]);
                                }
                                // check right cell
                                if (!this.#isNullOrOutOfBounds(gridData, a, b + 1)) {
                                    addToPossibleRotations(a, b, 0, ["r", "t"]);
                                }
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === "b") {
                                    // check left cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a, b - 1)) {
                                        addToPossibleRotations(a, b, 180, ["l", "b"]);
                                    }
                                    // check right cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a, b + 1)) {
                                        addToPossibleRotations(a, b, 90, ["r", "b"]);
                                    }
                                } else if (endDir === "l") {
                                    addToPossibleRotations(a, b, 270, ["l", "t"]);
                                } else if (endDir === "r") {
                                    addToPossibleRotations(a, b, 0, ["r", "t"]);
                                }
                            }
                        }

                        //b = 0. first column
                        if (b === 0) {
                            if (!this.#isEnd(ends, a, b)) {
                                // check top cell
                                if (!this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                    addToPossibleRotations(a, b, 0, ["r", "t"]);
                                }
                                // check bottom cell
                                if (!this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                    addToPossibleRotations(a, b, 90, ["r", "b"]);
                                }
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === "l") {
                                    // check top cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                        addToPossibleRotations(a, b, 270, ["l", "t"]);
                                    }
                                    // check bottom cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                        addToPossibleRotations(a, b, 180, ["l", "b"]);
                                    }
                                } else if (endDir === "t") {
                                    addToPossibleRotations(a, b, 0, ["r", "t"]);
                                } else if (endDir === "b") {
                                    addToPossibleRotations(a, b, 90, ["r", "b"]);
                                }
                            }
                        } else if (b === 4) {
                            if (!this.#isEnd(ends, a, b)) {
                                // check top cell
                                if (!this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                    addToPossibleRotations(a, b, 270, ["l", "t"]);
                                }
                                // check bottom cell
                                if (!this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                    addToPossibleRotations(a, b, 180, ["l", "b"]);
                                }
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === 'r') {
                                    // check top cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                        addToPossibleRotations(a, b, 0, ["r", "t"]);
                                    }
                                    // check bottom cell
                                    if (!this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                        addToPossibleRotations(a, b, 90, ["r", "b"]);
                                    }
                                } else if (endDir === "t") {
                                    addToPossibleRotations(a, b, 270, ["l", "t"]);
                                } else if (endDir === "b") {
                                    addToPossibleRotations(a, b, 180, ["l", "b"]);
                                }
                            }
                        }

                        if (a !== 0 && a !== 4 && b !== 0 && b !== 4) {
                            // check left and top cells
                            if (!this.#isNullOrOutOfBounds(gridData, a, b - 1) && !this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                addToPossibleRotations(a, b, 270, ["l", "t"]);
                            }
                            // left and bottom cells
                            if (!this.#isNullOrOutOfBounds(gridData, a, b - 1) && !this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                addToPossibleRotations(a, b, 180, ["l", "b"]);
                            }
                            // right and top cells
                            if (!this.#isNullOrOutOfBounds(gridData, a, b + 1) && !this.#isNullOrOutOfBounds(gridData, a - 1, b)) {
                                addToPossibleRotations(a, b, 0, ["r", "t"]);
                            }
                            // right and bottom cells
                            if (!this.#isNullOrOutOfBounds(gridData, a, b + 1) && !this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                addToPossibleRotations(a, b, 90, ["r", "b"]);
                            }
                        }

                    } else if (img.includes("straight")) {
                        if (a === 0 || a === 4) {
                            if (!this.#isEnd(ends, a, b)) {
                                addToPossibleRotations(a, b, 0, ["l", "r"]);
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === "b" || endDir === "t") {
                                    addToPossibleRotations(a, b, 90, ["b", "t"]);
                                } else {
                                    addToPossibleRotations(a, b, 0, ["l", "r"]);
                                }
                            }
                        }
                        if (b === 0 || b === 4) {
                            if (!this.#isEnd(ends, a, b)) {
                                addToPossibleRotations(a, b, 90, ["b", "t"]);
                            } else {
                                const endDir = this.#isEnd(ends, a, b)[0];
                                if (endDir === "l" || endDir === "r") {
                                    addToPossibleRotations(a, b, 0, ["l", "r"]);
                                } else {
                                    addToPossibleRotations(a, b, 90, ["b", "t"]);
                                }
                            }
                        }
                        if (a !== 0 && a !== 4 && b !== 0 && b !== 4) {
                            //check top and bottom cells
                            if (!this.#isNullOrOutOfBounds(gridData, a - 1, b) && !this.#isNullOrOutOfBounds(gridData, a + 1, b)) {
                                addToPossibleRotations(a, b, 90, ["b", "t"]);
                            }
                            // check left and right cells
                            if (!this.#isNullOrOutOfBounds(gridData, a, b - 1) && !this.#isNullOrOutOfBounds(gridData, a, b + 1)) {
                                addToPossibleRotations(a, b, 0, ["l", "r"]);
                            }
                        }
                    }
                }
            }
            if (b === 4) {
                b = 0;
                a += 1;
            } else {
                b += 1;
            }
        }
        ////
        for (const key in this.#possible_rotations_obj) {
            if (this.#possible_rotations_obj[key].length > 1) {
                this.#possible_rotations_obj[key] = this.#removeDuplicates(this.#possible_rotations_obj[key]);
            }
        }

    }
    #createAdjacents() {
        for (const key in this.#possible_rotations_obj) {
            if (this.#possible_rotations_obj[key].length === 1) {
                for (const possible_rot of this.#possible_rotations_obj[key]) {
                    const a = Number(key.split("_")[0]);
                    const b = Number(key.split("_")[1]);
                    possible_rot.adj = this.#createLimitationsForAdjacentCells(this.#problemGrid, a, b, possible_rot.connections);
                }
            }
        }
    }
    #createLimitationsForAdjacentCells(grid, a, b, connections) {
        const obj = {};
        for (const direction of connections) {
            const array = this.#possibleOptionsForAdjacentCell(grid, a, b, direction);
            if (array !== null) {
                obj[direction] = array;
            } else {
                obj[direction] = [];
            }
        }
        return obj;
    }
    #getConnection(img, rotation) {
        let rot = rotation;
        if (rot >= 360) {
            while (rot >= 360) {
                rot -= 360;
            }
        }
        const connections = [];
        if (img.includes("angle")) {
            if (rot === 0) {
                connections.push("r");
                connections.push("t");
            } else if (rot === 90) {
                connections.push("b");
                connections.push("r");
            } else if (rot === 180) {
                connections.push("b");
                connections.push("l");
            } else if (rot === 270) {
                connections.push("t");
                connections.push("l");
            }
        } else if (img.includes("cross")) {
            connections.push("t");
            connections.push("r");
            connections.push("b");
            connections.push("l");
        } else if (img.includes("straight")) {
            if (rot === 0 || rot === 180) {
                connections.push("r");
                connections.push("l");
            } else if (rot === 90 || rot === 270) {
                connections.push("t");
                connections.push("b");
            }
        }
        return connections;
    }
    #possibleOptionsForAdjacentCell(grid, a, b, direction) {
        const cell = this.#getAdjacentCell(grid, a, b, direction);
        if (cell === null) {
            return null;
        } else {
            const img = cell.imageName;
            const array = [];
            if (img.includes("angle")) {
                const possibleAngles = [0, 90, 180, 270];
                for (const angle of possibleAngles) {
                    if (this.#getConnection("angle", angle).includes(this.#getOppositeDir(direction))) {
                        array.push(angle);
                    }
                }
            } else if (img.includes('straight')) {
                const possibleAngles = [0, 90];
                for (const angle of possibleAngles) {
                    if (this.#getConnection("angle", angle).includes(this.#getOppositeDir(direction))) {
                        array.push(angle);
                    }
                }

            }
            return array;
        }
    }
    #reducePossibilities() {
        const newObj = {};
        for (const key in this.#possible_rotations_obj) {
            if (this.#possible_rotations_obj[key].length === 1) {
                for (const possible_rot of this.#possible_rotations_obj[key]) {
                    const a = Number(key.split("_")[0]);
                    const b = Number(key.split("_")[1]);
                    for (const dir in possible_rot.adj) {
                        const adj = possible_rot.adj[dir];
                        if (adj.length > 0) {
                            const adjCell_cords = this.#getAdjacentCords(a, b, dir);
                            if (this.#possible_rotations_obj[`${adjCell_cords[0]}_${adjCell_cords[1]}`]) {
                                const adjCell = this.#possible_rotations_obj[`${adjCell_cords[0]}_${adjCell_cords[1]}`];
                                if (adjCell.length > 1) {
                                    for (const rot of adjCell) {
                                        if (adj.includes(rot.rot)) {
                                            const n = adjCell_cords[0];
                                            const p = adjCell_cords[1]
                                            if (!newObj[`${n}_${p}`]) {
                                                newObj[`${n}_${p}`] = [{ "rot": rot.rot, "connections": rot.connections }]
                                            } else {
                                                newObj[`${n}_${p}`].push({ "rot": rot.rot, "connections": rot.connections })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const key in newObj) {
            this.#possible_rotations_obj[key] = newObj[key];
        }
    }
    #createAdjsNreducePossibilities(numOfTimes = 3) {
        for (let i = 0; i < numOfTimes; i++) {
            this.#createAdjacents();
            this.#reducePossibilities();
        }
    }
    #generateCombinations() {
        const keys = Object.keys(this.#possible_rotations_obj);
        const currentCombination = {};

        if (!this.#findSolution(keys, 0, currentCombination)) {
            console.log("No solution found.");
            return null;
        } else {
            return this.#tempGrid;
        }
    }
    #findSolution(keys, index, currentCombination) {
        if (index === keys.length) {
            if (this.#isSolution(currentCombination)) {
                return true;
            }
            return false;
        }

        const key = keys[index];
        const values = this.#possible_rotations_obj[key];

        for (const value of values) {
            currentCombination[key] = value;

            if (this.#findSolution(keys, index + 1, currentCombination)) {

                return true;
            }
            delete currentCombination[key];
        }
        return false;
    }

    #isSolution(combination) {
        const testCombination = JSON.parse(JSON.stringify(this.#problemGrid));
        for (const key in combination) {
            const [a, b] = key.split("_").map(Number);
            const value = combination[key];
            this.#updateProperty(testCombination, a, b, { "rotation": value.rot, "connections": value.connections });
        }
        if (this.#isSolved(testCombination)) {
            this.#tempGrid = testCombination;
            return true;
        }
        return false;
    }
    #updateProperty(grid, a, b, obj) {
        const cell = grid.tails[a][b];
        for (const key in obj) {
            cell[key] = obj[key];
        }
    }
    async solve() {
        console.time("GarlandSolver");
        return new Promise((resolve, reject) => {
            try {
                this.#createPossibleOptions();
                this.#createAdjsNreducePossibilities(3);
                const solution = this.#generateCombinations();
                if (solution) {
                    console.timeEnd("GarlandSolver");
                    resolve(solution);
                } else {
                    console.timeEnd("GarlandSolver");
                    reject("No solution found.");
                }
            } catch (err) {
                console.timeEnd("GarlandSolver");
                reject(err);

            }
        });
    }
}

