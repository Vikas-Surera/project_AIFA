import React from "react";
import {NodeCell} from "../index";
import {CellNode, PriorityQueue} from "../../algorithms/PriorityQueue";
import GridView from "../GridView";
import {constants} from "os";
import gridView from "../GridView";
import iitkgp from "../map";
import iitkgp2 from "../map2";
import Queue from "../../algorithms/Queue";

interface Props {

}

export enum AlgorithmI {
    AStar = "AStar",
    BFS = "BFS",
    DFS = "DFS",
}

interface States {
    grid: CellNode[][],
    walls: number[][],

    START_NODE_ROW: number,
    FINISH_NODE_ROW: number,
    START_NODE_COL: number,
    FINISH_NODE_COL: number,

    mouseIsPressed: boolean,

    ROW_COUNT: number,
    COLUMN_COUNT: number,

    isRunning: boolean,
    isStartNode: boolean,
    isWallNode: boolean,
    isFinishNode: boolean,

    currRow: number,
    currCol: number,

    animateRow: number,
    animateCol: number,

    animationStatus: boolean
    activeCell: CellNode | null
    algo: AlgorithmI

    speed: number
}

export default class AStar extends React.Component<Props, States> {
    private openList: PriorityQueue = new PriorityQueue();
    private closeList: CellNode[] = [];
    private openListDFS: CellNode[] = [];
    private openListBFS: Queue = new Queue();
    private dx: number[] = [0, 1, 0, -1];
    private dy: number[] = [1, 0, -1, 0];

    constructor(props: Props) {
        super(props);

        this.state = {
            grid: [],
            START_NODE_ROW: 9,
            FINISH_NODE_ROW: 13,
            START_NODE_COL: 0,
            FINISH_NODE_COL: 34,
            mouseIsPressed: false,
            ROW_COUNT: 16,
            COLUMN_COUNT: 35,
            isRunning: false,
            isStartNode: false,
            isFinishNode: false,
            isWallNode: false,
            currRow: 0,
            currCol: 0,

            animateCol: 5,
            animateRow: 5,
            animationStatus: false,
            activeCell: null,
            walls: [],
            algo: AlgorithmI.AStar,
            speed: 50
        }

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.clearGrid = this.clearGrid.bind(this);
        this.getInitialGrid = this.getInitialGrid.bind(this);
        this.moveNext = this.moveNext.bind(this);
        this.start = this.start.bind(this);
    }

    componentDidMount() {
        const grid = this.getInitialGrid();
        this.setState({grid: grid, activeCell: grid[this.state.START_NODE_ROW][this.state.START_NODE_COL]});
    }

    getInitialGrid(rowCount = this.state.ROW_COUNT, colCount = this.state.COLUMN_COUNT) {
        const initialGrid: CellNode[][] = [];
        const intitalWalls: number[][] = [];
        for (let row = 0; row < rowCount; row++) {
            const currentRow: CellNode[] = [];
            const currentRowWalls: number[] = [];
            for (let col = 0; col < colCount; col++) {
                currentRowWalls.push(0);
                currentRow.push({
                    row: row,
                    col: col,

                    fValue: 0,
                    gValue: 0,
                    hValue: 0,

                    isVisited: false,
                    // isWall: iitkgp[row][col],
                    isWall: iitkgp2[row][col],
                    isStartNode: row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
                    isGoalNode: row === this.state.FINISH_NODE_ROW &&
                        col === this.state.FINISH_NODE_COL,
                    isInClosedSet: false,
                    isInOpenSet: false,
                    previousNode: null,
                });
            }
            initialGrid.push(currentRow);
            intitalWalls.push(currentRowWalls);
        }
        this.setState({walls: intitalWalls});
        return initialGrid;
    };

    /******************** Control mouse events ********************/
    handleMouseDown(row: number, col: number) {
        const grid = this.state.grid;

        if (!this.state.isRunning) {
            if (this.isGridClear()) {
                if (document.getElementById(`node-${row}-${col}`)?.className === 'node node-start') {
                    this.setState({
                        mouseIsPressed: true,
                        isStartNode: true,
                        currRow: row,
                        currCol: col,
                    });
                    grid[row][col].isStartNode = true;
                    grid[row][col].gValue = 0;
                    grid[row][col].fValue = grid[row][col].gValue + grid[row][col].hValue;

                    this.setState({animateRow: row, animateCol: col, grid: grid, activeCell: grid[row][col]});
                    this.clearGrid();
                } else if (document.getElementById(`node-${row}-${col}`)?.className === 'node node-finish') {
                    grid[row][col].isGoalNode = true;
                    grid[row][col].hValue = 0;
                    // grid[row][col].fValue = grid[row][col].gValue + grid[row][col].hValue;

                    this.setState({
                        mouseIsPressed: true,
                        isFinishNode: true,
                        currRow: row,
                        currCol: col,
                        grid: grid
                    });
                    this.clearGrid();
                } else {
                    const node = grid[row][col];
                    if (!node.isStartNode && !node.isGoalNode) {
                        grid[row][col].isWall = !grid[row][col].isWall;
                    }

                    grid[row][col].isWall = true;
                    this.state.walls[row][col] = 1;
                    this.setState({
                        mouseIsPressed: true,
                        isWallNode: true,
                        currRow: row,
                        currCol: col,
                        grid: grid,
                        walls: this.state.walls
                    });
                }


            } else {
                this.clearGrid();
            }
        }
    }

    isGridClear() {
        const grid = this.state.grid;
        for (const row of grid) {
            for (const node of row) {
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)?.className;
                if (nodeClassName === 'node node-visited' || nodeClassName === 'node node-shortest-path') {
                    return false;
                }
            }
        }
        return true;
    }

    clearGrid() {
        if (!this.state.isRunning) {
            const rowCount = this.state.ROW_COUNT;
            const colCount = this.state.COLUMN_COUNT;

            const grid = this.state.grid;

            for (let row = 0; row < rowCount; row++) {
                for (let col = 0; col < colCount; col++) {
                    const node = grid[row][col];

                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)!.className;
                    if (nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish' && nodeClassName !== 'node node-wall') {

                        // TODO: hard coded
                        document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node';

                        node.isVisited = false;
                        node.isInClosedSet = false;
                        node.isInOpenSet = false;
                        node.gValue = Infinity;
                        node.hValue =
                            Math.abs(this.state.FINISH_NODE_ROW - node.row) +
                            Math.abs(this.state.FINISH_NODE_COL - node.col);
                        node.fValue = Infinity;
                    }
                    if (nodeClassName === 'node node-finish') {
                        node.isVisited = false;
                        node.isInClosedSet = false;
                        node.isInOpenSet = false;
                        node.gValue = Infinity;
                        node.hValue = 0;
                        node.fValue = Infinity;
                    }
                    if (nodeClassName === 'node node-start') {
                        node.isVisited = false;
                        node.isInClosedSet = false;
                        node.isInOpenSet = false;
                        node.gValue = 0;
                        node.hValue =
                            Math.abs(this.state.FINISH_NODE_ROW - node.row) +
                            Math.abs(this.state.FINISH_NODE_COL - node.col);
                        node.isStartNode = true;
                        node.isWall = false;
                    }

                    grid[row][col] = node;
                }
            }

            this.openList.clear();
            this.openListBFS.clear();
            this.closeList = [];
            this.openListDFS = [];
            this.setState({animateCol: 0, animateRow: 0, grid: grid});
        }
    }

    handleMouseEnter(row: number, col: number) {
        if (!this.state.isRunning) {
            if (this.state.mouseIsPressed) {
                const grid = this.state.grid;
                // TODO: hard coded
                const nodeClassName = document.getElementById(`node-${row}-${col}`)?.className;
                if (this.state.isStartNode) {
                    if (nodeClassName !== 'node node-wall') {
                        grid[this.state.currRow][this.state.currCol].isStartNode = false;

                        // TODO: hard coded
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`)!.className = 'node';

                        grid[row][col].isStartNode = true;
                        grid[row][col].gValue = 0;
                        grid[row][col].fValue = grid[row][col].gValue + grid[row][col].hValue;

                        // TODO: hard coded
                        document.getElementById(`node-${row}-${col}`)!.className = 'node node-start';

                        this.setState({
                            currRow: row,
                            currCol: col,
                            animateCol: col,
                            animateRow: row,
                            grid,
                            activeCell: grid[row][col]
                        });
                        this.clearGrid();
                    }
                    this.setState({START_NODE_ROW: row, START_NODE_COL: col});
                    this.setState({START_NODE_ROW: row, START_NODE_COL: col});
                } else if (this.state.isFinishNode) {
                    if (nodeClassName !== 'node node-wall') {
                        grid[this.state.currRow][this.state.currCol].isGoalNode = false;


                        // TODO: hard coded
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`)!.className = 'node';

                        grid[row][col].isGoalNode = true;
                        grid[row][col].hValue = 0;
                        grid[row][col].fValue = grid[row][col].gValue + grid[row][col].hValue;

                        this.setState({currRow: row, currCol: col, grid});

                        this.clearGrid();

                        // TODO: hard coded
                        document.getElementById(`node-${row}-${col}`)!.className = 'node node-finish';
                    }
                    this.setState({FINISH_NODE_ROW: row, FINISH_NODE_COL: col});
                } else if (this.state.isWallNode) {
                    const node = grid[row][col];
                    if (!node.isStartNode && !node.isGoalNode) {
                        grid[row][col].isWall = !grid[row][col].isWall;
                        this.state.walls[row][col] = this.state.walls[row][col] === 1 ? 0 : 1;
                    }
                    this.setState({grid, walls: this.state.walls});
                }
            }
        }
    }

    handleMouseUp(row: number, col: number) {
        if (!this.state.isRunning) {
            this.setState({mouseIsPressed: false});
            if (this.state.isStartNode) {
                const isStartNode = !this.state.isStartNode;
                this.setState({isStartNode, START_NODE_ROW: row, START_NODE_COL: col});
            } else if (this.state.isFinishNode) {
                const isFinishNode = !this.state.isFinishNode;
                this.setState({
                    isFinishNode,
                    FINISH_NODE_ROW: row,
                    FINISH_NODE_COL: col,
                });
            }
            this.getInitialGrid();
        }
    }

    handleMouseLeave() {
        if (this.state.isStartNode) {
            const isStartNode = !this.state.isStartNode;
            this.setState({isStartNode, mouseIsPressed: false});
            this.clearGrid();
        } else if (this.state.isFinishNode) {
            const isFinishNode = !this.state.isFinishNode;
            this.setState({isFinishNode, mouseIsPressed: false});
            this.clearGrid();
        } else if (this.state.isWallNode) {
            const isWallNode = !this.state.isWallNode;
            this.setState({isWallNode, mouseIsPressed: false});
            this.getInitialGrid();
        }
    }

    clearWalls() {
        if (!this.state.isRunning) {
            const grid = this.state.grid;
            for (let row = 0; row < this.state.ROW_COUNT; row++) {
                for (let col = 0; col < this.state.COLUMN_COUNT; col++) {
                    // TODO: hard coded
                    let nodeClassName = document.getElementById(`node-${row}-${col}`)!.className;
                    if (nodeClassName === 'node node-wall') {
                        // TODO: hard coded
                        document.getElementById(`node-${row}-${col}`)!.className = 'node';
                        grid[row][col].isWall = false;
                    }
                }
            }
            this.setState({grid});
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<States>, snapshot?: any) {
        // if(this.state.animationStatus!==prevState.animationStatus && this.state.animationStatus){
        //     this.animate();
        // }
        // if(this.state.animationStatus) {
        //     this.animate();
        // }
    }

    isInClosedList(node: CellNode) {
        for (let i = 0; i < this.closeList.length; i++) {
            if (this.closeList[i].row === node.row && this.closeList[i].col === node.col) {
                return true;
            }
        }
        return false;
    }

    updateCloseList(node: CellNode) {
        for (let i = 0; i < this.closeList.length; i++) {
            if (this.closeList[i].row === node.row && this.closeList[i].col === node.col) {
                this.closeList[i] = node;
            }
        }
    }

    async bfsMoveNext() {
        // const grid = this.state.grid;
        if (this.openListBFS.isEmpty()) {
            this.setState({animationStatus: false});
            return;
        }
        // 6. color green the top node in open list
        // await this.waitFor();
        const cur = this.openListBFS.getFront();
        this.openListBFS.dequeue();
        const node = this.state.grid[cur.row][cur.col];
        this.setState({activeCell: node});

        // 1. Goal test
        if (node.isGoalNode) {
            // reached the goal
            // break and show the path
            // this.animateShortestPath(nodesInShortestPathOrder);
            this.setState({animationStatus: false});
            this.markPath();
            return;
        }

        if (!node.isStartNode && !node.isGoalNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node active-list-node';

        await this.waitFor();
        // this.setState({});

        // console.log('Before Open:', this.openList.items);
        // console.log('Before Close:', this.closeList);

        // 3. get child nodes
        for (let k = 0; k < 4; k++) {
            const x = node.row + this.dx[k];
            const y = node.col + this.dy[k];

            if (x < 0 || x >= this.state.ROW_COUNT || y < 0 || y >= this.state.COLUMN_COUNT) continue;

            const childNode = this.state.grid[x][y];

            if (childNode.isWall) continue;

            if (this.openListBFS.isInOpen(childNode) && childNode.gValue > (node.gValue + 1)) {
                // update the child node
                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;
                childNode.previousNode = node;

                this.openListBFS.update(childNode);
            }

            if (this.isInClosedList(childNode) && childNode.gValue > (node.gValue + 1)) {

                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                this.updateCloseList(childNode);

            }

            if (!this.openListBFS.isInOpen(childNode) && !this.isInClosedList(childNode)) {
                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                childNode.isInOpenSet = true;
                this.openListBFS.enqueue(childNode);
            }

            this.state.grid[x][y] = childNode;


            // 5. color yellow the children
            if (!childNode.isGoalNode && childNode.isInOpenSet) document.getElementById(`node-${childNode.row}-${childNode.col}`)!.className = 'node open-list-node';
            this.setState({grid: this.state.grid});
            await this.waitFor();
        }

        // 2. grey out this node
        node.isVisited = true;
        node.isInClosedSet = true;
        node.isInOpenSet = false;

        this.closeList.push(node);
        // this.openList.pop();

        // push into close and remove from open
        this.state.grid[node.row][node.col] = node;


        if (!node.isGoalNode && !node.isStartNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node close-list-node';

        console.log('After Open:', this.openList.items);
        console.log('After Close:', this.closeList);

        // this.setState({animateRow: topNode.row, animateCol: topNode.col});
        await this.waitFor();
        this.setState({grid: this.state.grid});

        if (this.state.animationStatus) this.bfsMoveNext();
    }

    isInOpenDFS(node: CellNode) {
        for (let i = 0; i < this.openListDFS.length; i++) {
            if (this.openListDFS[i].row === node.row && this.openListDFS[i].col === node.col) {
                return true;
            }
        }
        return false;
    }

    updateOpenDFS(node: CellNode) {
        for (let i = 0; i < this.openListDFS.length; i++) {
            if (this.openListDFS[i].row === node.row && this.openListDFS[i].col === node.col) {
                this.openListDFS[i] = node;
            }
        }
    }

    async dfsMoveNext() {
        // const grid = this.state.grid;
        if (this.openListDFS.length == 0) {
            this.setState({animationStatus: false});
            return;
        }
        // 6. color green the top node in open list
        // await this.waitFor();
        const cur = this.openListDFS[this.openListDFS.length - 1];
        this.openListDFS.pop()
        const node = this.state.grid[cur.row][cur.col];
        this.setState({activeCell: node});

        // 1. Goal test
        if (node.isGoalNode) {
            // reached the goal
            // break and show the path
            // this.animateShortestPath(nodesInShortestPathOrder);
            this.setState({animationStatus: false});
            this.markPath();
            return;
        }

        if (!node.isStartNode && !node.isGoalNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node active-list-node';

        await this.waitFor();
        // this.setState({});

        // console.log('Before Open:', this.openList.items);
        // console.log('Before Close:', this.closeList);

        // 3. get child nodes
        for (let k = 3; k >= 0; k--) {
            const x = node.row + this.dx[k];
            const y = node.col + this.dy[k];

            if (x < 0 || x >= this.state.ROW_COUNT || y < 0 || y >= this.state.COLUMN_COUNT) continue;

            const childNode = this.state.grid[x][y];

            if (childNode.isWall) continue;

            if (this.isInOpenDFS(childNode) && childNode.gValue > (node.gValue + 1)) {
                // update the child node
                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;
                childNode.previousNode = node;

                this.updateOpenDFS(childNode);
            }

            if (this.isInClosedList(childNode) && childNode.gValue > (node.gValue + 1)) {

                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                this.updateCloseList(childNode);

            }

            if (!this.isInOpenDFS(childNode) && !this.isInClosedList(childNode)) {
                childNode.gValue = node.gValue + 1;
                // childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                childNode.isInOpenSet = true;
                this.openListDFS.push(childNode);
            }

            this.state.grid[x][y] = childNode;


            // 5. color yellow the children
            if (!childNode.isGoalNode && childNode.isInOpenSet) document.getElementById(`node-${childNode.row}-${childNode.col}`)!.className = 'node open-list-node';
            this.setState({grid: this.state.grid});
            await this.waitFor();
        }

        // 2. grey out this node
        node.isVisited = true;
        node.isInClosedSet = true;
        node.isInOpenSet = false;

        this.closeList.push(node);
        // this.openList.pop();

        // push into close and remove from open
        this.state.grid[node.row][node.col] = node;


        if (!node.isGoalNode && !node.isStartNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node close-list-node';

        console.log('After Open:', this.openList.items);
        console.log('After Close:', this.closeList);

        // this.setState({animateRow: topNode.row, animateCol: topNode.col});
        await this.waitFor();
        this.setState({grid: this.state.grid});

        if (this.state.animationStatus) this.dfsMoveNext();
    }


    async moveNext() {

        // const grid = this.state.grid;
        if (this.openList.isEmpty()) {
            this.setState({animationStatus: false});
            return;
        }
        // 6. color green the top node in open list
        // await this.waitFor();
        const cur = this.openList.top();
        this.openList.pop();
        const node = this.state.grid[cur.row][cur.col];
        this.setState({activeCell: node});

        // 1. Goal test
        if (node.isGoalNode) {
            // reached the goal
            // break and show the path
            // this.animateShortestPath(nodesInShortestPathOrder);
            this.setState({animationStatus: false});
            this.markPath();
            return;
        }

        if (!node.isStartNode && !node.isGoalNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node active-list-node';

        await this.waitFor();
        // this.setState({});

        console.log('Before Open:', this.openList.items);
        console.log('Before Close:', this.closeList);

        // 3. get child nodes
        for (let k = 0; k < 4; k++) {
            const x = node.row + this.dx[k];
            const y = node.col + this.dy[k];

            if (x < 0 || x >= this.state.ROW_COUNT || y < 0 || y >= this.state.COLUMN_COUNT) continue;

            const childNode = this.state.grid[x][y];

            if (this.isInClosedList(childNode) || childNode.isWall) continue;

            if (!this.openList.isInOpenSet(childNode)) {
                childNode.gValue = node.gValue + 1;
                childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                this.openList.push(childNode);
                childNode.isInOpenSet = true;
            } else {
                if (childNode.isInOpenSet && childNode.gValue > (node.gValue + 1)) {
                    // update the child node
                    childNode.gValue = node.gValue + 1;
                    childNode.fValue = childNode.gValue + childNode.hValue;

                    this.openList.update(childNode);
                }
            }

            if (!childNode.isInOpenSet) {

            }

            this.state.grid[x][y] = childNode;


            // 5. color yellow the children
            if (!childNode.isGoalNode) document.getElementById(`node-${childNode.row}-${childNode.col}`)!.className = 'node open-list-node';
            this.setState({grid: this.state.grid});
            await this.waitFor();
        }

        // 2. grey out this node
        node.isVisited = true;
        node.isInClosedSet = true;
        node.isInOpenSet = false;

        this.closeList.push(node);
        // this.openList.pop();

        // push into close and remove from open
        this.state.grid[node.row][node.col] = node;


        if (!node.isGoalNode && !node.isStartNode) document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node close-list-node';

        console.log('After Open:', this.openList.items);
        console.log('After Close:', this.closeList);

        // this.setState({animateRow: topNode.row, animateCol: topNode.col});
        await this.waitFor();
        this.setState({grid: this.state.grid});

        if (this.state.animationStatus) this.moveNext();
    }

    async markPath() {
        const grid = this.state.grid;
        let cur = this.state.grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
        while (cur.previousNode) {
            document.getElementById(`node-${cur.row}-${cur.col}`)!.className = 'node path-node';
            await new Promise(resolve => setTimeout(resolve, 100))
            cur = cur.previousNode;
        }
    }

    async start() {
        // if(this.openList.items.length==0) return;
        const grid = this.state.grid;

        this.clearGrid();
        const row = this.state.START_NODE_ROW;
        const col = this.state.START_NODE_COL;

        grid[row][col].gValue = 0;
        grid[row][col].fValue = grid[row][col].hValue + grid[row][col].gValue;
        this.openList.push(grid[row][col]);

        this.setState({grid, animationStatus: true, algo: AlgorithmI.AStar});
        this.moveNext();
    }

    async startBFS() {
        const grid = this.state.grid;

        this.clearGrid();
        const row = this.state.START_NODE_ROW;
        const col = this.state.START_NODE_COL;

        grid[row][col].gValue = 0;
        grid[row][col].fValue = grid[row][col].hValue + grid[row][col].gValue;
        this.openListBFS.enqueue(grid[row][col]);

        this.setState({grid, animationStatus: true, algo: AlgorithmI.BFS});
        this.bfsMoveNext();
    }

    async startDFS() {
        const grid = this.state.grid;

        this.clearGrid();
        const row = this.state.START_NODE_ROW;
        const col = this.state.START_NODE_COL;

        grid[row][col].gValue = 0;
        grid[row][col].fValue = grid[row][col].hValue + grid[row][col].gValue;
        this.openListDFS.push(grid[row][col]);

        this.setState({grid, animationStatus: true, algo: AlgorithmI.DFS});
        this.dfsMoveNext();
    }

    resume() {
        this.setState({animationStatus: true});

        const algo = this.state.algo;

        switch (algo) {
            case AlgorithmI.AStar:
                return this.moveNext();
            case AlgorithmI.BFS:
                return this.bfsMoveNext();
            case AlgorithmI.DFS:
                return this.dfsMoveNext();
        }

    }

    async waitFor(): Promise<void> {
        const speed = this.state.speed;
        return new Promise(resolve => setTimeout(resolve, speed));
    }

    export() {
        const grid = this.state.grid;
        const data: boolean[][] = [];
        for (let i = 0; i < this.state.ROW_COUNT; i++) {
            const row = [];
            for (let j = 0; j < this.state.COLUMN_COUNT; j++) {
                row.push(grid[i][j].isWall);
            }
            data.push(row);
        }
        console.log(data);
    }

    getOpenList() {
        const algo = this.state.algo;
        switch (algo) {
            case AlgorithmI.AStar:
                return this.openList.items;
            case AlgorithmI.BFS:
                return this.openListBFS.items;
            case AlgorithmI.DFS:
                return this.openListDFS;
            default:
                return [];
        }
    }

    render() {
        // console.log(this.state.walls);
        return <div>
            <nav>
                <img
                    src={'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/1200px-IIT_Kharagpur_Logo.svg.png'}/>

                <div className={'title'}>
                    <h4>
                        Optimal Path Navigator for Freshers
                    </h4>
                    <p>
                        IIT Kharagpur (2022-23) <br/> Vikas Surera, Abhishek Singh, Satyendra Nagar
                    </p>
                </div>

            </nav>

            <div className={'play-area'}>


                <div>
                    <div className={'active-row'}>
                        <h5 className={'mr-3'}>Current Node:</h5>
                        {
                            this.state.activeCell && <div className={'active-cell'}>
                                <div>
                                    Coordinate: ({this.state.activeCell.row}, {this.state.activeCell.col})
                                </div>
                                <div>
                                    {
                                        this.state.algo === AlgorithmI.AStar ?
                                            `F: ${this.state.activeCell.fValue} G(Path length): ${this.state.activeCell.gValue} H(heuristic): ${this.state.activeCell.hValue}`
                                            :
                                            `G(Path length): ${this.state.activeCell.gValue}`
                                    }
                                </div>
                            </div>
                        }
                    </div>
                    <br/>
                    <br/>
                    <GridView grid={this.state.grid}
                              handleMouseDown={this.handleMouseDown}
                              handleMouseEnter={this.handleMouseEnter}
                              handleMouseUp={this.handleMouseUp}
                              handleMouseLeave={this.handleMouseLeave}
                              mouseIsPressed={this.state.mouseIsPressed}
                    />

                    <br/>
                    <br/>
                    <div>
                        <button
                            type="button"
                            className="btn btn-danger mr-2"
                            onClick={() => this.clearGrid()}>
                            Clear Grid
                        </button>
                        <button
                            type="button"
                            className="btn btn-warning mr-2"
                            onClick={() => this.clearWalls()}>
                            Clear Walls
                        </button>
                        <button
                            disabled={!this.state.animationStatus}
                            type="button"
                            className="btn btn-warning mr-2"
                            onClick={() => this.setState({animationStatus: false})}>
                            Pause
                        </button>

                        <button
                            disabled={this.state.animationStatus}
                            type="button"
                            className="btn btn-warning mr-2"
                            onClick={() => this.resume()}>
                            Resume
                        </button>

                        <button
                            disabled={this.state.animationStatus}
                            type="button"
                            className="btn btn-primary mr-2"
                            // onClick={() => this.setState({animationStatus: true})}>
                            onClick={() => this.start()}>
                            A*
                        </button>

                        <button
                            disabled={this.state.animationStatus}
                            type="button"
                            className="btn btn-primary mr-2"
                            // onClick={() => this.setState({animationStatus: true})}>
                            onClick={() => this.startBFS()}>
                            BFS
                        </button>

                        <button
                            disabled={this.state.animationStatus}
                            type="button"
                            className="btn btn-primary mr-2"
                            // onClick={() => this.setState({animationStatus: true})}>
                            onClick={() => this.startDFS()}>
                            DFS
                        </button>

                        {/*<button*/}
                        {/*    type="button"*/}
                        {/*    className="btn btn-warning mr-2"*/}
                        {/*    // onClick={() => this.setState({animationStatus: true})}>*/}
                        {/*    onClick={() => this.export()}>*/}
                        {/*    Export*/}
                        {/*</button>*/}
                    </div>

                    <br/>
                    <form>
                        <div className="form-group">
                            <div className={'mr-2'} style={{width: '200px'}}>Speed (ms) :</div>
                            <input type="number" className="form-control" id="exampleInputEmail1" onChange={(e) => {
                                this.setState({speed: parseInt(e.target.value)});
                            }}
                                   aria-describedby="emailHelp" placeholder="Speed" value={this.state.speed}/>

                        </div>
                    </form>
                </div>

                <div className={"stack stack-open"}>
                    <div className={'stack-container'}>
                        <div className={'stack-title'}>Open List</div>
                        <div className={'stack-content'}>
                            {
                                this.getOpenList().map((node, index) => {
                                    return <div className={`stack-node stack-node-open`} key={index}>
                                        {
                                            this.state.algo === AlgorithmI.AStar ?
                                                `(${node.row}, ${node.col}) F: ${node.fValue} G: ${node.gValue} H: ${node.hValue}`
                                                :
                                                `(${node.row}, ${node.col}) G: ${node.gValue}`
                                        }
                                    </div>
                                })}
                        </div>
                    </div>
                </div>

                <div className={"stack stack-close"}>
                    <div className={'stack-container'}>
                        <div className={'stack-title'}>Close List</div>
                        <div className={'stack-content'}>
                            {
                                this.closeList.map((node, index) => {
                                    return <div className={`stack-node stack-node-close`} key={index}>
                                        {
                                            this.state.algo === AlgorithmI.AStar ?
                                                `(${node.row}, ${node.col}) F: ${node.fValue} G: ${node.gValue} H: ${node.hValue}`
                                                :
                                                `(${node.row}, ${node.col}) G: ${node.gValue}`
                                        }
                                    </div>
                                })}
                        </div>
                    </div>
                </div>

            </div>


            {/*<button*/
            }
            {/*    type="button"*/
            }
            {/*    className="btn btn-warning"*/
            }
            {/*    onClick={() => this.clearWalls()}>*/
            }
            {/*    Clear Walls*/
            }
            {/*</button>*/
            }
            {/*<button*/
            }
            {/*    type="button"*/
            }
            {/*    className="btn btn-primary"*/
            }
            {/*    onClick={() => this.visualize('AStar')}>*/
            }
            {/*    A* Aglo*/
            }
            {/*</button>*/
            }
        </div>;
    }
}