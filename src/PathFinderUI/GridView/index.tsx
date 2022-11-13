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
        <p id={'d-nalanda'}>To Nalanda</p>
        <p id={'d-gate'}>
            <img src={'/gate.png'} alt={'Gate'}/>
        </p>
        <p id={'d-techm'}>Tech M</p>
        <p id={'d-prem'}>To Prem Bazar</p>
        <p id={'d-puri'}>To Puri Gate</p>
        <p id={'d-main'}>
            <img src={'/kgp_icon.jpeg ' }/>
        </p>
        <tr style={{opacity: '0'}}>
            <td
                className={'node node-header'}
                >
                {0}
            </td>
            {
                grid[0] && grid[0].map((node, col) => {
                  return <td
                      className={'node node-header'}
                        key={col}>
                      {col+1}
                  </td>
                })
            }
        </tr>
        {grid.map((row, rowIdx) => {
            return (
                <tr key={rowIdx}>
                    <td
                        style={{opacity: '0'}}
                        className={'node node-header'}>

                        {rowIdx+1}
                    </td>
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