import React from "react";
import {NodeCell} from "../index";
import {CellNode, PriorityQueue} from "../../algorithms/PriorityQueue";
import GridView from "../GridView";
import {constants} from "os";
import gridView from "../GridView";

interface Props {

}

interface States {
    grid: CellNode[][],

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
}

export default class AStar extends React.Component<Props, States> {
    private openList: PriorityQueue = new PriorityQueue();
    private closeList: CellNode[] = [];
    private dx: number[] = [-1, 0, 1, 0];
    private dy: number[] = [0, 1, 0, -1];

    constructor(props: Props) {
        super(props);

        this.state = {
            grid: [],
            START_NODE_ROW: 5,
            FINISH_NODE_ROW: 0,
            START_NODE_COL: 5,
            FINISH_NODE_COL: 0,
            mouseIsPressed: false,
            ROW_COUNT: 22,
            COLUMN_COUNT: 25,
            isRunning: false,
            isStartNode: false,
            isFinishNode: false,
            isWallNode: false,
            currRow: 0,
            currCol: 0,

            animateCol: 5,
            animateRow: 5,
            animationStatus: false,
            activeCell: null
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
        for (let row = 0; row < rowCount; row++) {
            const currentRow: CellNode[] = [];
            for (let col = 0; col < colCount; col++) {
                currentRow.push({
                    row: row,
                    col: col,

                    fValue: 0,
                    gValue: 0,
                    hValue: 0,

                    isVisited: false,
                    isWall: false,
                    isStartNode: row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
                    isGoalNode: row === this.state.FINISH_NODE_ROW &&
                        col === this.state.FINISH_NODE_COL,
                    isInClosedSet: false,
                    isInOpenSet: false,
                    previousNode: null,
                });
            }
            initialGrid.push(currentRow);
        }
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
                    this.setState({
                        mouseIsPressed: true,
                        isWallNode: true,
                        currRow: row,
                        currCol: col,
                        grid: grid,
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
            this.closeList = [];
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

                        this.setState({currRow: row, currCol: col, animateCol: col, animateRow: row, grid, activeCell: grid[row][col]});
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
                    }
                    this.setState({grid});
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
        for(let i=0; i<this.closeList.length; i++){
            if(this.closeList[i].row===node.row && this.closeList[i].col===node.col){
                return true;
            }
        }
        return false;
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

            if(!this.openList.isInOpenSet(childNode)) {
                childNode.gValue = node.gValue + 1;
                childNode.fValue = childNode.gValue + childNode.hValue;

                // 4. put children in open list
                childNode.previousNode = node;
                this.openList.push(childNode);
                node.isInOpenSet = true;
            }else{
                if (childNode.isInOpenSet && childNode.gValue >  (node.gValue + 1)) {
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

    async markPath(){
        const grid = this.state.grid;
        let cur = this.state.grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
        while(cur.previousNode){
            document.getElementById(`node-${cur.row}-${cur.col}`)!.className = 'node path-node';
            await this.waitFor(100);
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

        this.setState({grid, animationStatus: true});
        this.moveNext();
    }

    resume(){
        this.setState({animationStatus: true});
        this.moveNext();
    }

    async waitFor(ms: number = 50): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    render() {
        return <div>
            <nav>
                <img src={'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/1200px-IIT_Kharagpur_Logo.svg.png'} />

                <div className={'title'}>
                    <h5>
                        A* Path Finding Algorithm
                    </h5>
                    <p>
                        IIT Kharagpur (2022-23) <br/> Vikas Surera, Abhishek Singh, Satyendra Nagar
                    </p>
                </div>

            </nav>

            <div className={'play-area'}>


                <div>
                    <div className={'active-row'}>
                        <h5 className={'mr-3'}>Active Node:</h5>
                        {
                            this.state.activeCell && <div className={'active-cell'}>
                             <div>
                                 ({this.state.activeCell.row}, {this.state.activeCell.col})
                             </div>
                            <div>
                                F: {this.state.activeCell.fValue} G: {this.state.activeCell.gValue} H: {this.state.activeCell.hValue}
                            </div>
                            </div>
                        }
                    </div>
                    <GridView grid={this.state.grid}
                              handleMouseDown={this.handleMouseDown}
                              handleMouseEnter={this.handleMouseEnter}
                              handleMouseUp={this.handleMouseUp}
                              handleMouseLeave={this.handleMouseLeave}
                              mouseIsPressed={this.state.mouseIsPressed}
                    />

                    <br/>
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
                        className="btn btn-warning mr-2"
                        // onClick={() => this.setState({animationStatus: true})}>
                        onClick={() => this.start()}>
                        Start
                    </button>
                </div>

                <div className={"stack stack-open"}>
                    <div className={'stack-container'}>
                        <div className={'stack-title'}>Open List</div>
                        <div className={'stack-content'}>
                            {
                                this.openList.items.map((node, index) => {
                                    return <div className={`stack-node stack-node-open`} key={index}>
                                        {`(${node.row}, ${node.col})`} F: {node.fValue} G: {node.gValue} H: {node.hValue}
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
                                        {`(${node.row}, ${node.col})`} F: {node.fValue} G: {node.gValue} H: {node.hValue}
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
        </div>
            ;
    }
}