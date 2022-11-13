// User defined class
// to store element and its priority

export interface CellNodeI {
    num: number
    fValue: number;
    gValue: number;
    hValue: number;

    col: number;
    row: number;

    isVisited: boolean;
    isWall: boolean;
    isStartNode: boolean;
    isGoalNode: boolean;
    isInClosedSet: boolean;
    isInOpenSet: boolean;
}

export class CellNode {
    fValue: number;
    gValue: number;
    hValue: number;

    col: number;
    row: number;

    isVisited: boolean;
    isWall: boolean;
    isStartNode: boolean;
    isGoalNode: boolean;

    isInClosedSet: boolean;
    isInOpenSet: boolean;

    previousNode: CellNode | null;

    constructor(data: CellNodeI) {
        this.hValue = data.fValue;
        this.fValue = data.fValue;
        this.gValue = data.fValue;
        this.col = data.col;
        this.row = data.row;
        this.isVisited = data.isVisited;
        this.isWall = data.isWall;
        this.isStartNode = data.isStartNode;
        this.isGoalNode = data.isGoalNode;
        this.isInClosedSet = data.isInClosedSet;
        this.isInOpenSet = data.isInOpenSet;
        this.previousNode = null;
    }
}

// PriorityQueue class
export class PriorityQueue {

    // An array is used to implement priority
    items: CellNode[];


    constructor() {
        this.items = [];
    }

    clear(){
        this.items = []
    }

    pop() {
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    update(element: CellNode){
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].col === element.col && this.items[i].row === element.row) {
                this.items[i] = element;
                break;
            }
        }
        this.items.sort((a, b) => a.fValue - b.fValue);
    }

    // enqueue function to add element
    // to the queue as per priority
    push(element: CellNode) {
        // creating object from queue element
        let qElement = element;
        let contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].fValue > qElement.fValue) {
                // Once the correct location is found it is
                // enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    top() {
        return this.items[0];
    }

    isEmpty() {
        // return true if the queue is empty.
        return this.items.length == 0;
    }

    isInOpenSet(element: CellNode) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].col === element.col && this.items[i].row === element.row) {
                return true;
            }
        }
        return false;
    }

}
