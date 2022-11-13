import {CellNode} from "./PriorityQueue";
export default class Queue {
    items: CellNode[];
    // front: number;
    // rear: number;

    constructor() {
        this.items = [];
        // this.front = 0;
        // this.rear = 0;
    }
    enqueue(item: CellNode) {
        this.items.push(item);
        // this.items[this.rear] = item;
        // this.rear++;
    }
    dequeue() {
        return this.items.shift();
        // const item = this.items[this.front];
        // delete this.items[this.front];
        // this.front++;
        // return item;
    }
    getFront() {
        return this.items[0];
    }

    clear(){
        this.items  = [];
    }

    isEmpty() {
        return this.items.length == 0;
    }

    isInOpen(element: CellNode){
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].col === element.col && this.items[i].row === element.row) {
                return true;
            }
        }
        return false;
    }

    update(element: CellNode){
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].col === element.col && this.items[i].row === element.row) {
                this.items[i] = element;
                break;
            }
        }
    }
}