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
import { PanelStyle } from "db://assets/script/game/component/Style/PanelStyle";
import { UnlockItem } from "db://assets/script/game/unlock/UnlockItem";

const { ccclass } = _decorator;

/** 加载资源类型 */
enum ResType {
    Load,
    LoadDir
}

/** 资源加载记录 */
interface ResRecord {
    /** 资源包名 */
    bundle: string,
    /** 资源路径 */
    path: string,
    /** 引用计数 */
    refCount: number,
    /** 资源编号 */
    resId?: number
}

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
    
    setUnlockItem(item ?: UnlockItem){
        if(!item) return
        let panelStyle = this.node.getComponent(PanelStyle)
        if(!panelStyle) return


        panelStyle.setTitle(item.UnlockItemModel.table.name)
    }

    onToggle(tog: Toggle | number){

    }

    onToggleSub(tog: Toggle | number){


    }
}