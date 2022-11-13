import React, {Component} from 'react';
import NodeUI from './Node/Node';
import {dijkstra} from '../algorithms/dijkstra';
import {AStar} from '../algorithms/aStar';
import {dfs} from '../algorithms/dfs';
import {bfs} from '../algorithms/bfs';

import './PathFinderUi.css';
import {PriorityQueue} from "../algorithms/PriorityQueue";

export interface NodeCell {
    distance: number,
    isStart: boolean,
    row: number,
    col: number,
    isFinish: boolean,
    isVisited: boolean,
    distanceToFinishNode: number,
    isWall: boolean,
    previousNode: NodeCell | null,
    isNode: boolean,
    isEndEvent?: boolean,
}

export type Graph = NodeCell[][];

interface PathFinderUIProps {

}

interface PathFinderUIState {
    grid: NodeCell[][], // @TODO: fix this
    START_NODE_ROW: number,
    FINISH_NODE_ROW: number,
    START_NODE_COL: number,
    FINISH_NODE_COL: number,
    mouseIsPressed: boolean
    ROW_COUNT: number,
    COLUMN_COUNT: number,
    MOBILE_ROW_COUNT: number,
    MOBILE_COLUMN_COUNT: number,
    isRunning: boolean
    isStartNode: boolean
    isFinishNode: boolean
    isWallNode: boolean // xxxxxxx
    currRow: number,
    currCol: number,
    isDesktopView: boolean
    stop: boolean,
    interval: number,

    activeIndex: number,
    rangeLimit: number,
    activeStack: NodeCell[],
}

export default class PathFinderUI extends Component<PathFinderUIProps, PathFinderUIState> {
    private priorityQueue: PriorityQueue = new PriorityQueue();

    constructor(props: PathFinderUIProps) {
        super(props);
        this.state = {
            grid: [],
            START_NODE_ROW: 5,
            FINISH_NODE_ROW: 5,
            START_NODE_COL: 5,
            FINISH_NODE_COL: 15,
            mouseIsPressed: false,
            ROW_COUNT: 25,
            COLUMN_COUNT: 35,
            MOBILE_ROW_COUNT: 10,
            MOBILE_COLUMN_COUNT: 20,
            isRunning: false,
            isStartNode: false,
            isFinishNode: false,
            isWallNode: false, // xxxxxxx
            currRow: 0,
            currCol: 0,
            isDesktopView: true,
            interval: 10,
            stop: true,
            activeIndex: 0,
            rangeLimit: 0,
            activeStack: [],
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.toggleIsRunning = this.toggleIsRunning.bind(this);
    }

    componentDidMount() {
        const grid = this.getInitialGrid();
        this.setState({grid});
    }

    toggleIsRunning() {
        this.setState({isRunning: !this.state.isRunning});
    }

    toggleView() {
        if (!this.state.isRunning) {
            this.clearGrid();
            this.clearWalls();
            const isDesktopView = !this.state.isDesktopView;
            let grid;
            if (isDesktopView) {
                grid = this.getInitialGrid(
                    this.state.ROW_COUNT,
                    this.state.COLUMN_COUNT,
                );
                this.setState({isDesktopView, grid});
            } else {
                if (
                    this.state.START_NODE_ROW > this.state.MOBILE_ROW_COUNT ||
                    this.state.FINISH_NODE_ROW > this.state.MOBILE_ROW_COUNT ||
                    this.state.START_NODE_COL > this.state.MOBILE_COLUMN_COUNT ||
                    this.state.FINISH_NODE_COL > this.state.MOBILE_COLUMN_COUNT
                ) {
                    alert('Start & Finish Nodes Must Be within 10 Rows x 20 Columns');
                } else {
                    grid = this.getInitialGrid(
                        this.state.MOBILE_ROW_COUNT,
                        this.state.MOBILE_COLUMN_COUNT,
                    );
                    this.setState({isDesktopView, grid});
                }
            }
        }
    }

    /******************** Set up the initial grid ********************/
    getInitialGrid = (
        rowCount = this.state.ROW_COUNT,
        colCount = this.state.COLUMN_COUNT,
    ) => {
        const initialGrid = [];
        for (let row = 0; row < rowCount; row++) {
            const currentRow = [];
            for (let col = 0; col < colCount; col++) {
                currentRow.push(this.createNode(row, col));
            }
            initialGrid.push(currentRow);
        }
        return initialGrid;
    };

    createNode = (row: number, col: number): NodeCell => {
        return {
            row,
            col,
            isStart:
                row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
            isFinish:
                row === this.state.FINISH_NODE_ROW &&
                col === this.state.FINISH_NODE_COL,
            distance: Infinity,
            distanceToFinishNode:
                Math.abs(this.state.FINISH_NODE_ROW - row) +
                Math.abs(this.state.FINISH_NODE_COL - col),
            isVisited: false,
            isWall: false,
            previousNode: null,
            isNode: true,
        };
    };

    /******************** Control mouse events ********************/
    handleMouseDown(row: number, col: number) {
        if (!this.state.isRunning) {
            if (this.isGridClear()) {
                if (document.getElementById(`node-${row}-${col}`)?.className === 'node node-start') {
                    this.setState({
                        mouseIsPressed: true,
                        isStartNode: true,
                        currRow: row,
                        currCol: col,
                    });
                } else if (document.getElementById(`node-${row}-${col}`)?.className === 'node node-finish') {
                    this.setState({
                        mouseIsPressed: true,
                        isFinishNode: true,
                        currRow: row,
                        currCol: col,
                    });
                } else {
                    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
                    this.setState({
                        grid: newGrid,
                        mouseIsPressed: true,
                        isWallNode: true,
                        currRow: row,
                        currCol: col,
                    });
                }
            } else {
                this.clearGrid();
            }
        }
    }

    isGridClear() {
        for (const row of this.state.grid) {
            for (const node of row) {
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)?.className;
                if (nodeClassName === 'node node-visited' || nodeClassName === 'node node-shortest-path') {
                    return false;
                }
            }
        }
        return true;
    }

    handleMouseEnter(row: number, col: number) {
        if (!this.state.isRunning) {
            if (this.state.mouseIsPressed) {
                // TODO: hard coded
                const nodeClassName = document.getElementById(`node-${row}-${col}`)?.className;
                if (this.state.isStartNode) {
                    if (nodeClassName !== 'node node-wall') {
                        const prevStartNode = this.state.grid[this.state.currRow][this.state.currCol];
                        prevStartNode.isStart = false;
                        // TODO: hard coded
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`)!.className = 'node';

                        this.setState({currRow: row, currCol: col});
                        const currStartNode = this.state.grid[row][col];
                        currStartNode.isStart = true;
                        // TODO: hard coded
                        document.getElementById(`node-${row}-${col}`)!.className = 'node node-start';
                    }
                    this.setState({START_NODE_ROW: row, START_NODE_COL: col});
                } else if (this.state.isFinishNode) {
                    if (nodeClassName !== 'node node-wall') {
                        const prevFinishNode = this.state.grid[this.state.currRow][
                            this.state.currCol
                            ];
                        prevFinishNode.isFinish = false;

                        // TODO: hard coded
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`)!.className = 'node';

                        this.setState({currRow: row, currCol: col});
                        const currFinishNode = this.state.grid[row][col];
                        currFinishNode.isFinish = true;

                        // TODO: hard coded
                        document.getElementById(`node-${row}-${col}`)!.className = 'node node-finish';
                    }
                    this.setState({FINISH_NODE_ROW: row, FINISH_NODE_COL: col});
                } else if (this.state.isWallNode) {
                    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
                    this.setState({grid: newGrid});
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
        } else if (this.state.isFinishNode) {
            const isFinishNode = !this.state.isFinishNode;
            this.setState({isFinishNode, mouseIsPressed: false});
        } else if (this.state.isWallNode) {
            const isWallNode = !this.state.isWallNode;
            this.setState({isWallNode, mouseIsPressed: false});
            this.getInitialGrid();
        }
    }

    /******************** Clear Board/Walls ********************/

    clearGrid() {
        if (!this.state.isRunning) {
            const newGrid = this.state.grid.slice();
            for (const row of newGrid) {
                for (const node of row) {
                    // TODO: hard coded
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)!.className;
                    if (nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish' && nodeClassName !== 'node node-wall') {

                        // TODO: hard coded
                        document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node';

                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode =
                            Math.abs(this.state.FINISH_NODE_ROW - node.row) +
                            Math.abs(this.state.FINISH_NODE_COL - node.col);
                    }
                    if (nodeClassName === 'node node-finish') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = 0;
                    }
                    if (nodeClassName === 'node node-start') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode =
                            Math.abs(this.state.FINISH_NODE_ROW - node.row) +
                            Math.abs(this.state.FINISH_NODE_COL - node.col);
                        node.isStart = true;
                        node.isWall = false;
                        node.previousNode = null;
                        node.isNode = true;
                    }
                }
            }
        }
    }

    clearWalls() {
        if (!this.state.isRunning) {
            const newGrid = this.state.grid.slice();
            for (const row of newGrid) {
                for (const node of row) {

                    // TODO: hard coded
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)!.className;
                    if (nodeClassName === 'node node-wall') {
                        // TODO: hard coded
                        document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node';
                        node.isWall = false;
                    }
                }
            }
        }
    }

    /******************** Create Animations ********************/
    visualize(algo: string) {
        if (!this.state.isRunning) {
            this.clearGrid();
            this.toggleIsRunning();
            const {grid} = this.state;
            const startNode =
                grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
            const finishNode =
                grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
            let visitedNodesInOrder: NodeCell[];
            switch (algo) {
                case 'Dijkstra':
                    visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
                    break;
                case 'AStar':
                    visitedNodesInOrder = AStar(grid, startNode, finishNode);
                    break;
                case 'BFS':
                    visitedNodesInOrder = bfs(grid, startNode, finishNode);
                    break;
                case 'DFS':
                    visitedNodesInOrder = dfs(grid, startNode, finishNode);
                    break;
                default:
                    //TODO: should never get here
                    visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
                    break;
            }
            this.setState({activeIndex: 0, rangeLimit: visitedNodesInOrder.length});
            const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
            nodesInShortestPathOrder.push({
                isEndEvent: true,
                distance: 0,
                isStart: false,
                row: 0,
                col: 0,
                isFinish: false,
                isVisited: false,
                distanceToFinishNode: 0,
                isWall: false,
                previousNode: null,
                isNode: false
            });
            this.animate(visitedNodesInOrder, nodesInShortestPathOrder);
        }
    }

    componentDidUpdate(prevProps: Readonly<PathFinderUIProps>, prevState: Readonly<PathFinderUIState>, snapshot?: any) {
        if(prevState.activeIndex !== this.state.activeIndex) {

        }
    }

    startAStar() {
        if (!this.state.isRunning) {
            this.clearGrid();
            this.toggleIsRunning();
            const {grid} = this.state;
            const startNode =
                grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
            const finishNode =
                grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];


            // reset the queue
            this.priorityQueue.clear();

        }
    }

    nextMove(){
        //
    }

    animate(visitedNodesInOrder: NodeCell[], nodesInShortestPathOrder: NodeCell[]) {
        if(this.state.stop) return;
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, this.state.interval * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];

                // TODO: hard coded
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)!.className;
                if (nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                    document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node node-visited';
                }
            }, this.state.interval * i);
        }
    }

    /******************** Create path from start to finish ********************/
    animateShortestPath(nodesInShortestPathOrder: NodeCell[]) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            // if (nodesInShortestPathOrder[i] === 'end') {
            if (nodesInShortestPathOrder[i].isEndEvent) { // the end event is triggered
                setTimeout(() => {
                    this.toggleIsRunning();
                }, i * 50);
            } else {
                setTimeout(() => {
                    const node = nodesInShortestPathOrder[i];

                    // TODO: hard coded
                    const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`)!.className;
                    if (nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                        // TODO: hard coded
                        document.getElementById(`node-${node.row}-${node.col}`)!.className = 'node node-shortest-path';
                    }
                }, i * 40);
            }
        }
    }

    render() {
        const {grid, mouseIsPressed} = this.state;
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
                    <a className="navbar-brand" href="/">
                        <b>IIT KGP</b>
                    </a>
                    {/*<button*/}
                    {/*    className="navbar-toggler"*/}
                    {/*    type="button"*/}
                    {/*    data-toggle="collapse"*/}
                    {/*    data-target="#navbarNav"*/}
                    {/*    aria-controls="navbarNav"*/}
                    {/*    aria-expanded="false"*/}
                    {/*    aria-label="Toggle navigation">*/}
                    {/*    <span className="navbar-toggler-icon"></span>*/}
                    {/*</button>*/}
                    {/*<div className="collapse navbar-collapse" id="navbarNav">*/}
                    {/*    <ul className="navbar-nav">*/}
                    {/*        <li className="nav-item">*/}
                    {/*            <a*/}
                    {/*                className="nav-link"*/}
                    {/*                href="http://www.github.com/PrudhviGNV/pathFinderVisualizer">*/}
                    {/*                {' '}*/}
                    {/*                PathFinder Visualizer code{' '}*/}
                    {/*            </a>*/}
                    {/*        </li>*/}
                    {/*        <li className="nav-item">*/}
                    {/*            <a className="nav-link" href="https://prudhvignv.github.io">*/}
                    {/*                Check Out Other Cool Projects*/}
                    {/*            </a>*/}
                    {/*        </li>*/}
                    {/*    </ul>*/}
                    {/*</div>*/}
                </nav>

                <table
                    className="grid-container"
                    onMouseLeave={() => this.handleMouseLeave()}>
                    <tbody className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                            <tr key={rowIdx}>
                                {row.map((node, nodeIdx) => {
                                    const {row, col, isFinish, isStart, isWall} = node;
                                    return (
                                        // <NodeUI
                                        //     key={nodeIdx}
                                        //     col={col}
                                        //     isFinish={isFinish}
                                        //     isStart={isStart}
                                        //     isWall={isWall}
                                        //     mouseIsPressed={mouseIsPressed}
                                        //     onMouseDown={(row, col) =>
                                        //         this.handleMouseDown(row, col)
                                        //     }
                                        //     onMouseEnter={(row, col) =>
                                        //         this.handleMouseEnter(row, col)
                                        //     }
                                        //     onMouseUp={() => this.handleMouseUp(row, col)}
                                        //     row={row}></NodeUI>
                                        <div></div>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => this.clearGrid()}>
                    Clear Grid
                </button>
                <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => this.clearWalls()}>
                    Clear Walls
                </button>
                <button
                    disabled={!this.state.stop}
                    type="button"
                    className="btn btn-warning"
                    onClick={() => this.setState({stop: false})}>
                    Resume
                </button>
                <button
                    disabled={this.state.stop}
                    type="button"
                    className="btn btn-warning"
                    onClick={() => this.setState({stop: true})}>
                    Pause
                </button>
                <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => this.clearWalls()}>
                    Clear Walls
                </button>
                {/*<button*/}
                {/*    type="button"*/}
                {/*    className="btn btn-primary"*/}
                {/*    onClick={() => this.visualize('Dijkstra')}>*/}
                {/*    Dijkstra's*/}
                {/*</button>*/}
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.visualize('AStar')}>
                    A* Aglo
                </button>
                {/*<button*/}
                {/*    type="button"*/}
                {/*    className="btn btn-primary"*/}
                {/*    onClick={() => this.visualize('BFS')}>*/}
                {/*    Bread First Search*/}
                {/*</button>*/}
                {/*<button*/}
                {/*    type="button"*/}
                {/*    className="btn btn-primary"*/}
                {/*    onClick={() => this.visualize('DFS')}>*/}
                {/*    Depth First Search*/}
                {/*</button>*/}
                {/*{this.state.isDesktopView ? (*/}
                {/*    <button*/}
                {/*        type="button"*/}
                {/*        className="btn btn-light"*/}
                {/*        onClick={() => this.toggleView()}>*/}
                {/*        Mobile View*/}
                {/*    </button>*/}
                {/*) : (*/}
                {/*    <button*/}
                {/*        type="button"*/}
                {/*        className="btn btn-dark"*/}
                {/*        onClick={() => this.toggleView()}>*/}
                {/*        Desktop View*/}
                {/*    </button>*/}
                {/*)}*/}
            </div>
        );
    }
}

/******************** Create Walls ********************/
const getNewGridWithWallToggled = (grid: NodeCell[][], row: number, col: number) => {
    // mouseDown starts to act strange if I don't make newGrid and work off of grid instead.
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    if (!node.isStart && !node.isFinish && node.isNode) {
        const newNode = {
            ...node,
            isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
    }
    return newGrid;
};

// Backtracks from the finishNode to find the shortest path.
// Only works when called after the pathfinding methods.
function getNodesInShortestPathOrder(finishNode: NodeCell) {
    const nodesInShortestPathOrder = [];
    let currentNode: NodeCell | null = finishNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}
