// Returns all nodes in the order in which they were visited.
// Make nodes point back to their previous node so that we can compute the shortest path
// by backtracking from the finish node.

import {Graph, NodeCell} from "../PathFinderUI";

export function AStar(grid: Graph, startNode: NodeCell, finishNode: NodeCell) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid); // Q: different from using grid or slice of grid???

    while (unvisitedNodes.length) {
        sortByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift();
        // If we encounter a wall, we skip it.
        if (closestNode && !closestNode.isWall) {
            // If the closest node is at a distance of infinity,
            // we must be trapped and should stop.
            if (closestNode.distance === Infinity) return visitedNodesInOrder;
            closestNode.isVisited = true;
            visitedNodesInOrder.push(closestNode);
            if (closestNode === finishNode) return visitedNodesInOrder;
            updateUnvisitedNeighbors(closestNode, grid);
        }
    }

    return unvisitedNodes;
}

function getAllNodes(grid: Graph) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

function sortByDistance(unvisitedNodes: NodeCell[]) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node: NodeCell, grid: Graph) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = node.distance + 1 + neighbor.distanceToFinishNode;
        neighbor.previousNode = node;
    }
}

function getUnvisitedNeighbors(node: NodeCell, grid: Graph) {
    const neighbors = [];
    const {col, row} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
}
