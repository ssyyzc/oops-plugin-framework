import { Component, Node, Prefab, _decorator } from 'cc';
// import { myLog } from '../../../common/myLog';
import { cocosUtil } from './cocosUtils';
import { utilTools } from './utilTools';
const { ccclass, property } = _decorator;

@ccclass('NodePoolUtil')
export class NodePoolUtil extends Component {

    itemNode: any;

    freeNodeArr: any = [];
    itemNodeArr: any = [];

    onLoad() {

    }

    init(itemNode: Node | Prefab) {
        if (itemNode instanceof Prefab) {
            itemNode = cocosUtil.instantiate(itemNode);
        }
        this.itemNode = itemNode;
    }

    getNode() {
        let node = this.freeNodeArr.shift();
        if (!node) {
            if (!this.itemNode) {
                // myLog.e(this.node);
            }
            node = cocosUtil.instantiate(this.itemNode);
            node.parent = this.node;
        }
        if (!node.active) {
            node.active = true;
        }
        node.use = true;

        return node;
    }

    recycleNode(node: Node) {
        if (!this.itemNode) {
            this.itemNode = node;
        }
        node.active = false;
        if (this.freeNodeArr.indexOf(node) == -1) {
            this.freeNodeArr.push(node);
        }
        // @ts-ignore
        node.use = false;
    }

    recycleAllNode() {
        utilTools.forArr(this.node.children, (node: Node) => {
            this.recycleNode(node);
        });
    }

    forEachUseNode(cb: Function) {
        utilTools.forArr(this.node.children, (node: any, index: number) => {
            if (!node.use) {
                return;
            }
            cb(node, index);
        });
    }

}

