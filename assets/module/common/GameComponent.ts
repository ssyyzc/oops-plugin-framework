/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-12-13 11:36:00
 */
import { Asset, Button, Component, EventHandler, EventKeyboard, EventTouch, Input, Node, Prefab, Sprite, SpriteFrame, __private, _decorator, input, isValid } from "cc";
import { BaseGameComponent } from "./BaseGameComponent";
import { Toggle } from "cc";
import { smc } from "db://assets/script/game/common/SingletonModuleComp";
import { PanelStyle } from "db://assets/script/component/Style/PanelStyle";
import { UnlockItem } from "db://assets/script/gui/unlock/UnlockItem";
import { ToggleStyle } from "db://assets/script/component/Style/ToggleStyle";
import { FuncBtnComp } from "db://assets/script/gui/unlock/view/FuncBtnComp";
import { CCEntity } from "./CCEntity";
import { FuncHintComp } from "db://assets/script/gui/unlock/view/FuncHintComp";
import { ListenerFunc } from "../../core/common/event/EventMessage";

const { ccclass } = _decorator;

/**
 * 游戏显示对象组件模板
 * 1、当前对象加载的资源，会在对象释放时，自动释放引用的资源
 * 2、当前对象支持启动游戏引擎提供的各种常用逻辑事件
 */
@ccclass("GameComponent")
export class GameComponent extends BaseGameComponent {
    getUnlockItemByClassName(){
        return smc.unlock.UnlockModel.nameMap.get(this.constructor.name)
    }
    
    _unlockItem ?: UnlockItem
    setUnlockItem(item ?: UnlockItem){
        this._unlockItem = item
        
        let panelStyle = this.node.getComponent(PanelStyle)
        if(!panelStyle) return

        if(item){
            panelStyle.setTitle(item.UnlockItemModel.table.name)
            panelStyle.setWenhaoState(!!item.UnlockItemModel.table.desc)
        }else{
            panelStyle.setWenhaoState(false)
        }
    }

    onToggle(tog: number, toggle: ToggleStyle){

    }

    onToggleSub(tog: number, toggle: ToggleStyle){

    }

    onItemUpdate(id: number, listener: ListenerFunc, object: any){
        this.on("item_" + id, listener, object)
    }

    addFuncBtn(node : Node, id : number, key ?: number, entity ?: CCEntity){
        let fun = node.getComponent(FuncBtnComp)
        if(!fun){
            fun = node.addComponent(FuncBtnComp)
        }
        fun.setUnlockId(id, key)

        if(entity){
            fun.setEntity(entity)
        }
    }

    addFuncHint(node : Node, id : number, key ?: number){
        let hit = node.getComponentInChildren(FuncHintComp)
        if(!hit){
            let n = this.createPrefabNode("common/prefab/hitN")
            hit = n.getComponent(FuncHintComp)!
            hit.setFuncId(id, key)
            n.parent = node
            hit.updatePos()
        }else{
            hit.setFuncId(id, key)
        }
    }

    btn_wenhao(){
        if(!this._unlockItem) return
        smc.account.loadHelp(this._unlockItem.UnlockItemModel.table.name, this._unlockItem.UnlockItemModel.table.desc)
    }
}