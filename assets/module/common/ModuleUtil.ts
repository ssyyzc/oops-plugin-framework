import { Node, __private } from "cc";
import { oops } from "../../core/Oops";
import { resLoader } from "../../core/common/loader/ResLoader";
import { UICallbacks } from "../../core/gui/layer/Defines";
import { DelegateComponent } from "../../core/gui/layer/DelegateComponent";
import { ViewUtil } from "../../core/utils/ViewUtil";
import { ecs } from "../../libs/ecs/ECS";
import { CompType } from "../../libs/ecs/ECSModel";
import { CCComp } from "./CCComp";
import { CCVMParentComp } from "./CCVMParentComp";

export class ModuleUtil {
    /**
     * 添加界面组件
     * @param ent      模块实体
     * @param ctor     界面逻辑组件
     * @param uiId     界面资源编号
     * @param uiArgs   界面参数
     */
    static addViewUi<T extends CCVMParentComp | CCComp>(
        ent: ecs.Entity,
        ctor: __private.__types_globals__Constructor<T> | __private.__types_globals__AbstractedConstructor<T>,
        uiId: number,
        uiArgs: any = null) {
        const uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                const comp = node.getComponent(ctor) as ecs.Comp;
                //@ts-ignore
                if (!ent.has(ctor)) ent.add(comp);
            }
        };
        oops.gui.open(uiId, uiArgs, uic);
    }

    /**
     * 异步添加视图层组件
     * @param ent      模块实体
     * @param ctor     界面逻辑组件
     * @param uiId     界面资源编号
     * @param uiArgs   界面参数
     * @returns 界面节点
     */
    static addViewUiAsync<T extends CCVMParentComp | CCComp>(
        ent: ecs.Entity,
        ctor: __private.__types_globals__Constructor<T> | __private.__types_globals__AbstractedConstructor<T>,
        uiId: number,
        uiArgs: any = null): Promise<Node | null> {
        return new Promise<Node | null>((resolve, reject) => {
            const uic: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    const comp = node.getComponent(ctor) as ecs.Comp;
                    ent.add(comp);
                    resolve(node);
                },
                onLoadFailure: () => {
                    resolve(null);
                }
            };
            oops.gui.open(uiId, uiArgs, uic);
        });
    }

    /**
     * 通过资源内存中获取预制上的组件添加到ECS实体中
     * @param ent        模块实体
     * @param ctor       界面逻辑组件
     * @param parent     显示对象父级
     * @param url        显示资源地址
     * @param bundleName 资源包名称
     */
    static addView<T extends CCVMParentComp | CCComp>(
        ent: ecs.Entity,
        ctor: __private.__types_globals__Constructor<T> | __private.__types_globals__AbstractedConstructor<T>,
        parent: Node,
        url: string,
        bundleName: string = resLoader.defaultBundleName) {
        const node = ViewUtil.createPrefabNode(url, bundleName);
        const comp = node.getComponent(ctor)!;
        ent.add(comp);
        node.parent = parent;
        return node;
    }

    /**
     * 业务实体上移除界面组件
     * @param ent            模块实体
     * @param ctor           界面逻辑组件
     * @param uiId           界面资源编号
     * @param isDestroy      是否释放界面缓存（默认为释放界面缓存）
     * @param onRemoved      窗口关闭完成事件
     */
    static removeViewUi(ent: ecs.Entity, ctor: CompType<ecs.IComp>, uiId: number, isDestroy: boolean = true, onRemoved?: Function) {
        const node = oops.gui.get(uiId);
        if (!node) {
            if (onRemoved) onRemoved();
            return;
        }

        const comp = node.getComponent(DelegateComponent);
        if (comp) {
            if (comp.vp.callbacks.onBeforeRemove) {
                comp.onCloseWindowBefore = () => {
                    ent.remove(ctor, isDestroy);
                    if (onRemoved) onRemoved();
                };
            }
            else if (comp.vp.callbacks.onRemoved) {
                comp.onCloseWindow = () => {
                    ent.remove(ctor, isDestroy);
                    if (onRemoved) onRemoved();
                };
            }
            else {
                ent.remove(ctor, isDestroy);
                if (onRemoved) onRemoved();
            }
        }
        else {
            ent.remove(ctor, isDestroy);
            if (onRemoved) onRemoved();
        }

        oops.gui.remove(uiId, isDestroy);
    }
}