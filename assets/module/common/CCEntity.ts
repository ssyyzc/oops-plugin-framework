import { __private, Node } from "cc";
import { resLoader } from "../../core/common/loader/ResLoader";
import { gui } from "../../core/gui/Gui";
import { LayerUIElement, UIParam } from "../../core/gui/layer/LayerUIElement";
import { oops } from "../../core/Oops";
import { ViewUtil } from "../../core/utils/ViewUtil";
import { ecs } from "../../libs/ecs/ECS";
import { ECSEntity } from "../../libs/ecs/ECSEntity";
import { CompType } from "../../libs/ecs/ECSModel";
import { CCBusiness } from "./CCBusiness";
import { CCView } from "./CCView";
import { CCViewVM } from "./CCViewVM";
import { ListenerFunc } from "../../core/common/event/EventMessage";
import { GameComponent } from "./GameComponent";
import { EffectSingleCase } from "../../libs/animator-effect/EffectSingleCase";
import { smc } from "db://assets/script/game/common/SingletonModuleComp";
import { Vec3 } from "cc";

export type ECSCtor<T extends ecs.Comp> = __private.__types_globals__Constructor<T> | __private.__types_globals__AbstractedConstructor<T>;
export type ECSView = CCViewVM<CCEntity> | CCView<CCEntity>;

/** ECS 游戏模块实体 */
export abstract class CCEntity extends ecs.Entity {
    //#region 子模块管理
    /** 单例子实体 */
    private singletons: Map<any, ECSEntity> = null!;

    /** 添加单例子实体 */
    addChildSingleton<T>(cls: any): T {
        if (this.singletons == null) this.singletons = new Map();
        if (this.singletons.has(cls)) {
            console.error(`${cls.name} 单例子实体已存在`);
            return null!;
        }
        let entity = cls.create();
        this.singletons.set(cls, entity);
        this.addChild(entity);
        return entity as T;
    }

    /** 获取单例子实体 */
    getChildSingleton<T>(cls: any): T {
        return this.singletons.get(cls) as T;
    }

    /** 移除单例子实体 */
    removeChildSingleton(cls: any) {
        let entity = this.singletons.get(cls);
        if (entity) {
            this.singletons.delete(cls);
            this.removeChild(entity);
        }
    }
    //#endregion

    //#region 游戏视图层管理
    /**
     * 通过资源内存中获取预制上的组件添加到ECS实体中
     * @param ctor       界面逻辑组件
     * @param parent     显示对象父级
     * @param path       显示资源地址
     * @param bundleName 资源包名称
     */
    addPrefab<T extends ECSView>(ctor: ECSCtor<T>, parent: Node, path: string, bundleName: string = resLoader.defaultBundleName) {
        const node = ViewUtil.createPrefabNode(path, bundleName);
        let comp = node.getComponent(ctor)!;
        if(!comp){
            comp = node.addComponent(ctor as any)
        }
        this.add(comp);
        node.parent = parent;
        return node
    }

    async addPrefabAsync<T extends ECSView>(ctor: ECSCtor<T>, parent: Node, path: string, bundleName: string = resLoader.defaultBundleName) {
        const node = await ViewUtil.createPrefabNodeAsync(path, bundleName);
        let comp = node.getComponent(ctor)!;
        if(!comp){
            comp = node.addComponent(ctor as any)
        }
        this.add(comp);
        node.parent = parent;
        return node
    }


    async addPrefabPoolAsync<T extends ECSView>(ctor: ECSCtor<T>, parent: Node, path: string, bundleName: string = resLoader.defaultBundleName) {
        let eid = this.eid
        let node = await EffectSingleCase.instance.loadAndShow(path, null!, {bundleName : bundleName})
        if (!this.isValid || this.eid != eid) {
            EffectSingleCase.instance.put(node)
            return null
        }
        node.getComponent(ctor)?.destroy()
        let comp = node.addComponent(ctor as any)
        this.add(comp as any);
        node.parent = parent;
        return node
    }



    /**
     * 添加视图层组件
     * @param ctor     界面逻辑组件
     * @param params   界面参数
     * @returns 界面节点
     */
    addUi<T extends ECSView>(ctor: ECSCtor<T>, params?: UIParam): Promise<Node> {
        return new Promise<Node>(async (resolve, reject) => {
            const key = gui.internal.getKey(ctor);
            if (key) {
                if (params == null) {
                    params = { preload: true };
                }
                else {
                    params.preload = true;
                }

                const node = await oops.gui.open(key, params);
                let comp = node.getComponent(ctor) as ecs.Comp;
                if(!comp){
                    //@ts-ignore
                    comp = node.addComponent(ctor as any); //as ecs.Comp;
                    //@ts-ignore
                    if(comp.onAdded) comp.onAdded(params?.data)
                }

                // 通过 @gui.register 的 unlock_id 自动绑定 UnlockItem
                const config = gui.internal.getConfig(key);
                if (config && config.unlock_id) {
                    let unlockItem = smc.unlock.getItem(config.unlock_id);
                    if (unlockItem) {
                        let gc = (comp as unknown as GameComponent);
                        gc.setUnlockItem(unlockItem);
                    }
                }

                this.add(comp);
                oops.gui.show(key);
                resolve(node);
            }
            else {
                console.error(`${key} 界面组件未使用 gui.register 注册`);
            }
        });
    }

    /**
     * 移除视图层组件
     * @param ctor      界面逻辑组件
     */
    removeUi(ctor: CompType<ecs.IComp>) {
        const key = gui.internal.getKey(ctor);
        if (key) {
            const node = oops.gui.get(key);
            if (node == null) {
                // console.error(`${key} 界面重复关闭`);
                return;
            }

            const comp = node.getComponent(LayerUIElement);
            if (comp) {
                // 处理界面关闭动画播放完成后，移除ECS组件，避免使用到组件实体数据还在动画播放时在使用导致的空对象问题
                comp.onClose = this.remove.bind(this, ctor);
                oops.gui.remove(key);
            }
        }
        else {
            this.remove(ctor);
        }
    }
    //#endregion

    //#region 游戏业务层管理
    /** 模块业务逻辑组件 */
    private businesss: Map<any, CCBusiness<CCEntity>> = null!;

    /**
    * 批量添加组件
    * @param ctors 组件类
    * @returns 
    */
    addBusinesss<T extends CCBusiness<CCEntity>>(...clss: any[]) {
        for (let ctor of clss) {
            this.addBusiness<T>(ctor);
        }
    }

    /**
     * 添加业务逻辑组件
     * @param cls 业务逻辑组件类
     * @returns 业务逻辑组件实例
     */
    addBusiness<T extends CCBusiness<CCEntity>>(cls: any): T {
        if (this.businesss == null) this.businesss = new Map();
        if (this.businesss.has(cls)) {
            console.error(`${cls.name} 业务逻辑组件已存在`);
            return null!;
        }
        let business = new cls();
        business.ent = this;
        business.init();
        this.businesss.set(cls, business);
        return business as T;
    }

    /**
     * 获取业务逻辑组件
     * @param cls 业务逻辑组件类
     * @returns 业务逻辑组件实例
     */
    getBusiness<T extends CCBusiness<CCEntity>>(cls: any): T {
        return this.businesss.get(cls) as T;
    }

    /**
     * 移除业务逻辑组件
     * @param cls 业务逻辑组件类
     */
    removeBusiness(cls: any) {
        let business = this.businesss.get(cls);
        if (business) this.businesss.delete(cls);
    }

    emitMessage(eventName: string, ...args: any[]) {
        oops.message.dispatchEvent(this.eid + "_" + eventName, ...args);
    }

    on(eventName: string,  listener: ListenerFunc, object: object) {
        this.off(eventName, listener, object)
        oops.message.on(this.eid + "_" + eventName, listener, object);
    }

    off(eventName: string, listener: ListenerFunc, object: object) {
        oops.message.off(this.eid + "_" + eventName, listener, object)
    }
    //#endregion

    destroy(): void {
        if (this.singletons) {
            this.singletons.clear();
            this.singletons = null!;
        }

        if (this.businesss) {
            this.businesss.forEach(business => business.destroy());
            this.businesss.clear();
            this.businesss = null!;
        }
        super.destroy();
    }
}