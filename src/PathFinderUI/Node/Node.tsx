import React, {Component} from 'react';

import './Node.css';
import {CellNode} from "../../algorithms/PriorityQueue";

interface NodeProps {
    node: CellNode
    col: number,
    isFinish: boolean,
    isStart: boolean,
    isWall: boolean,
    onMouseDown: (row: number, col: number) => void,
    onMouseEnter: (row: number, col: number) => void,
    onMouseUp: () => void,
    mouseIsPressed: boolean,
    row: number,
}

export default class NodeUI extends Component<NodeProps, {}> {
    render() {
        const {
            col,
            isFinish,
            isStart,
            isWall,
            onMouseDown,
            onMouseEnter,
            onMouseUp,
            row,
        } = this.props;

        const extraClassName = isFinish
            ? 'node-finish'
            : isStart
                ? 'node-start'
                : isWall
                    ? 'node-wall'
                    : '';

        return (
            <td
                id={`node-${row}-${col}`}
                className={`node ${extraClassName}`}
                onMouseDown={() => onMouseDown(row, col)}
                onMouseEnter={() => onMouseEnter(row, col)}
                onMouseUp={() => onMouseUp()}>
                {
                    <p>
                        {/*{this.props.node.isStartNode && "S"}*/}
                        {/*{this.props.node.isGoalNode && "G"}*/}
                        {/*f={this.props.node.fValue === Infinity ? '∞' : this.props.node.fValue}*/}
                        {/*<br/>*/}
                        {/*g={this.props.node.gValue === Infinity ? '∞' : this.props.node.gValue}*/}
                        {/*<br/>*/}
                        {/*h={this.props.node.hValue}*/}
                        {
                            // `${this.props.node.col}`
                        }
                    </p>
                }
            </td>
        );
    }
}
