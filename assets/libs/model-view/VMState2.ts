import { Button, CCInteger, Color, Enum, Node, Sprite, UIOpacity, UIRenderer, _decorator, color } from 'cc';
import { VMBase } from './VMBase';
import { VM } from './ViewModel';

const { ccclass, property, menu, help } = _decorator;

/** 比较条件 */
enum CONDITION {
    "==",        // 正常计算，比较 等于
    "!=",        // 正常计算，比较 不等于
    ">",         // 正常计算，比较>
    ">=",        // 正常计算，比较>=
    "<",         // 正常计算，比较<
    "<=",        // 正常计算，比较>=
    "range"      // 计算在范围内
}

enum ACTION {
    NODE_ACTIVE,            // 满足条件的节点激活，不满足的不激活（只对子节点的激活有效果，当前节点active = false时，组件就失去效果了，如果设置当前节点可用NODE_VISIBLE代替）
    NODE_VISIBLE,           // 满足条件的节点显示，不满足的不显示
    NODE_OPACITY,           // 满足条件的节点改变不透明度，不满足的还原255
    NODE_COLOR,             // 满足条件的节点改变颜色，不满足的恢复白色
    COMPONENT_CUSTOM,       // 自定义控制组件模式
    SPRITE_GRAYSCALE,       // 满足条件的节点cc.Sprite组件，纹理变黑白
    BUTTON_INTERACTABLE,    // 满足条件的节点cc.BUTTON组件,
}

enum CHILD_MODE_TYPE {
    NODE_INDEX,
    NODE_NAME
}

/**
 * [VM-State]
 * 监听数值状态,根据数值条件设置节点是否激活
 */
@ccclass
@menu('OopsFramework/Mvvm/VM-State2 （状态控制）')
@help('https://gitee.com/dgflash/oops-framework/wikis/pages?sort_id=12037846&doc_id=2873565')
export default class VMState2 extends VMBase {
    @property
    watchPath: string = "";

    @property({
        tooltip: '遍历子节点,根据子节点的名字或名字转换为值，判断值满足条件 来激活'
    })
    foreachChildMode: boolean = false;

    @property({
        type: Enum(CONDITION),
    })
    condition: CONDITION = CONDITION["=="];

    @property({
        type: Enum(CHILD_MODE_TYPE),
        tooltip: '遍历子节点,根据子节点的名字转换为值，判断值满足条件 来激活',
        visible: function () {
            // @ts-ignore
            return this.foreachChildMode === true;
        }
    })
    foreachChildType: CHILD_MODE_TYPE = CHILD_MODE_TYPE.NODE_INDEX;

    @property({
        displayName: 'Value: a',
        visible: function () {
            // @ts-ignore
            return this.foreachChildMode === false;
        }
    })
    watchPath2: string = '';

    @property({
        displayName: 'Value: b',
        visible: function () {
            // @ts-ignore
            return this.foreachChildMode === false && this.condition === CONDITION.range;
        }
    })
    valueB: number = 0;

    @property({
        type: Enum(ACTION),
        tooltip: '一旦满足条件就对节点执行操作'
    })
    watchPath2ction: ACTION = ACTION.NODE_ACTIVE;

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.NODE_OPACITY;
        },
        range: [0, 255],
        type: CCInteger,
        displayName: 'Action Opacity'
    })
    watchPath2ctionOpacity: number = 0;

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.NODE_COLOR
        },
        displayName: 'Action Color'
    })
    watchPath2ctionColor: Color = color(155, 155, 155);

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.COMPONENT_CUSTOM
        },
        displayName: 'Component Name'
    })
    valueComponentName: string = '';

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.COMPONENT_CUSTOM
        },
        displayName: 'Component Property'
    })
    valueComponentProperty: string = '';

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.COMPONENT_CUSTOM
        },
        displayName: 'Default Value'
    })
    valueComponentDefaultValue: string = '';

    @property({
        visible: function () {
            // @ts-ignore
            return this.watchPath2ction === ACTION.COMPONENT_CUSTOM;
        },
        displayName: 'Action Value'
    })
    valueComponentActionValue: string = '';

    @property({
        type: [Node],
        tooltip: '需要执行条件的节点，如果不填写则默认会执行本节点以及本节点的所有子节点 的状态'
    })
    watchNodes: Node[] = [];

    onLoad() {
        super.onLoad();
        // 如果数组里没有监听值，那么默认把所有子节点给监听了
        if (this.watchNodes.length == 0) {
            if (this.watchPath2ction !== ACTION.NODE_ACTIVE && this.foreachChildMode === false) {
                this.watchNodes.push(this.node);
            }
            this.watchNodes = this.watchNodes.concat(this.node.children);
        }
    }


    test(path : string){
        let paths = path.split('.');
        for (let i = 1; i < paths.length; i++) {
            const p = paths[i];
            // 如果发现了路径使用了 * ，则自动去自己的父节点查找自己所在 index 值
            if (p == '*') {
                let index = this.node.parent!.children.findIndex(n => n === this.node);
                if (index <= 0) index = 0;
                paths[i] = index.toString();
                break;
            }
        }

        // 替换掉原路径
        let watchPath = paths.join('.');
        return watchPath;

        // 提前进行路径数组 的 解析
        // let pathArr : any[]= [];
        // if (pathArr.length >= 1) {
        //     for (let i = 0; i < pathArr.length; i++) {
        //         const path = pathArr[i];
        //         let paths = path.split('.');

        //         for (let i = 1; i < paths.length; i++) {
        //             const p = paths[i];
        //             if (p == '*') {
        //                 let index = this.node.parent!.children.findIndex(n => n === this.node);
        //                 if (index <= 0) index = 0;
        //                 paths[i] = index.toString();
        //                 break;
        //             }

        //         }

        //         this.watchPathArr[i] = paths.join('.');
        //     }
        // }
    }

    start() {
        if (this.enabled) {
            this.onValueInit();
        }
    }

    // 当值初始化时
    protected onValueInit() {
        let value = VM.getValue(this.watchPath);
        this.checkNodeFromValue(value);
    }

    // 当值被改变时
    protected onValueChanged(newVar: any, oldVar: any, pathArr: any[]) {
        this.checkNodeFromValue(newVar);
    }

    // 检查节点值更新
    private checkNodeFromValue(value: any) {
        if (this.foreachChildMode) {
            this.watchNodes.forEach((node, index) => {
                let v = (this.foreachChildType === CHILD_MODE_TYPE.NODE_INDEX) ? index : node.name;
                let check = this.conditionCheck(value, v);
                // log('遍历模式', value, node.name, check);
                this.setNodeState(node, check);
            })
        }
        else {
            let check = this.conditionCheck(value, this.VM.getValue(this.watchPath2), this.valueB);
            this.setNodesStates(check);
        }
    }

    // 更新 多个节点 的 状态
    private setNodesStates(checkState?: boolean) {
        let nodes = this.watchNodes;
        let check = checkState;
        nodes.forEach((node) => {
            this.setNodeState(node, check);
        })
    }

    /** 更新单个节点的状态 */
    private setNodeState(node: Node, checkState?: boolean) {
        let n = this.watchPath2ction;
        let check = checkState;
        switch (n) {
            case ACTION.NODE_ACTIVE:
                node.active = check ? true : false;
                break;
            case ACTION.NODE_VISIBLE: {
                let opacity = node.getComponent(UIOpacity);
                if (opacity == null)
                    opacity = node.addComponent(UIOpacity);

                if (opacity) {
                    opacity.opacity = check ? 255 : 0;
                }
                break;
            }
            case ACTION.NODE_OPACITY: {
                let opacity = node.getComponent(UIOpacity);
                if (opacity == null)
                    opacity = node.addComponent(UIOpacity);

                if (opacity) {
                    opacity.opacity = check ? this.watchPath2ctionOpacity : 255;
                }
                break;
            }
            case ACTION.NODE_COLOR: {
                let uir = node.getComponent(UIRenderer);
                if (uir) {
                    uir.color = check ? this.watchPath2ctionColor : color(255, 255, 255);
                }
                break;
            }
            case ACTION.COMPONENT_CUSTOM:
                let comp: any = node.getComponent(this.valueComponentName);
                if (comp == null) return;
                if (this.valueComponentProperty in comp) {
                    comp[this.valueComponentProperty] = check ? this.valueComponentActionValue : this.valueComponentDefaultValue;
                }
                break;
            case ACTION.SPRITE_GRAYSCALE: {
                let sprite = node.getComponent(Sprite);
                if (sprite) {
                    sprite.grayscale = check!;
                }
                break;
            }
            case ACTION.BUTTON_INTERACTABLE: {
                let sprite = node.getComponent(Button);
                if (sprite) {
                    sprite.interactable = check!;
                }
                break;
            }
            default:
                break;
        }
    }

    /** 条件检查 */
    private conditionCheck(v: any, a: any, b?: any): boolean {
        let cod = CONDITION;
        switch (this.condition) {
            case cod["=="]:
                if (v == a) return true;
                break;
            case cod["!="]:
                if (v != a) return true;
                break;
            case cod["<"]:
                if (v < a) return true;
                break;
            case cod[">"]:
                if (v > a) return true;
                break;
            case cod[">="]:
                if (v >= a) return true;
                break;
            case cod["<"]:
                if (v < a) return true;
                break;
            case cod["<="]:
                if (v <= a) return true;
                break;
            case cod["range"]:
                if (v >= a && v <= b) return true;
                break;
            default:
                break;
        }

        return false;
    }
}