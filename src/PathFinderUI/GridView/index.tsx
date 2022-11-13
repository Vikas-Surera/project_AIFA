import NodeUI from "../Node/Node";
import React from "react";
import {NodeCell} from "../index";
import {CellNode} from "../../algorithms/PriorityQueue";

interface IProps {
    grid: CellNode[][];
    handleMouseDown: (row: number, col: number) => void;
    handleMouseEnter: (row: number, col: number) => void;
    handleMouseUp: (row: number, col: number) => void;
    handleMouseLeave: () => void;
    mouseIsPressed: boolean;
}

const GridView = ({
                      grid,
                      handleMouseEnter,
                      handleMouseDown,
                      mouseIsPressed,
                      handleMouseLeave,
                      handleMouseUp
                  }: IProps) => {
    return <table
        className="grid-container"
        onMouseLeave={() => handleMouseLeave()}>
        <tbody className="grid">
        {/*<tr>*/}
        {/*    {*/}
        {/*        grid[0] && grid[0].map((node, col) => {*/}
        {/*          return <td*/}
        {/*              className={'node node-header'}*/}
        {/*                key={col}>*/}
        {/*              {col}*/}
        {/*          </td>*/}
        {/*        })*/}
        {/*    }*/}
        {/*</tr>*/}
        {grid.map((row, rowIdx) => {
            return (
                <tr key={rowIdx}>
                    {row.map((node, nodeIdx) => {
                        const {row, col, isGoalNode, isStartNode, isWall} = node;
                        return (
                            <NodeUI
                                node={node}
                                key={nodeIdx}
                                col={col}
                                isFinish={isGoalNode}
                                isStart={isStartNode}
                                isWall={isWall}
                                mouseIsPressed={mouseIsPressed}
                                onMouseDown={(row, col) =>
                                    handleMouseDown(row, col)
                                }
                                onMouseEnter={(row, col) =>
                                    handleMouseEnter(row, col)
                                }
                                onMouseUp={() => handleMouseUp(row, col)}
                                row={row}></NodeUI>
                        );
                    })}
                </tr>
            );
        })}
        </tbody>
    </table>
}

export default GridView;