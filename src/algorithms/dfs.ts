// Returns all nodes in the order in which they were visited.
// Make nodes point back to their previous node so that we can compute the shortest path
// by backtracking from the finish node.

import {Graph, NodeCell} from "../PathFinderUI";

export function dfs(grid: Graph, startNode: NodeCell, finishNode: NodeCell) {
    const visitedNodesInOrder: NodeCell[] = [];
    const nextNodesStack = [];
    nextNodesStack.push(startNode);
    while (nextNodesStack.length) {
        const currentNode: NodeCell | undefined = nextNodesStack.pop();

        if (currentNode === finishNode) {
            return visitedNodesInOrder;
        }

        if (currentNode && !currentNode.isWall && (currentNode.isStart || !currentNode.isVisited)) {
            currentNode.isVisited = true;
            visitedNodesInOrder.push(currentNode);

            const {col, row}: { col: number, row: number } = currentNode;
            let nextNode;
            if (row > 0) {
                nextNode = grid[row - 1][col];
                if (!nextNode.isVisited) {
                    nextNode.previousNode = currentNode;
                    nextNodesStack.push(nextNode);
                }
            }
            if (row < grid.length - 1) {
                nextNode = grid[row + 1][col];
                if (!nextNode.isVisited) {
                    nextNode.previousNode = currentNode;
                    nextNodesStack.push(nextNode);
                }
            }
            if (col > 0) {
                nextNode = grid[row][col - 1];
                if (!nextNode.isVisited) {
                    nextNode.previousNode = currentNode;
                    nextNodesStack.push(nextNode);
                }
            }
            if (col < grid[0].length - 1) {
                nextNode = grid[row][col + 1];
                if (!nextNode.isVisited) {
                    nextNode.previousNode = currentNode;
                    nextNodesStack.push(nextNode);
                }
            }
        }
    }

    return nextNodesStack;
}
