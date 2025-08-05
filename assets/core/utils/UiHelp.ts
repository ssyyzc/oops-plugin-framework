import { assetManager, Color, ImageAsset, Label, Node, RichText, Sprite, SpriteAtlas, SpriteFrame, Texture2D, } from "cc";
import { oops } from "../Oops";
import { dragonBones } from "cc";
import { isValid } from "cc";

/** 常用ui控制工具 */
export class UiHelp {
    /**
     * 设置图片
     * @param node 需要设置的节点
     * @param dAtlas 图集 || url || 手机相册图片路径
     * @param imgPath 图集中的图片名字
     * @returns 
     */
    public static SetSpriteFrame(node: Node | null | undefined, dAtlas: SpriteAtlas | string, imgPath: string = "") {
        if (!dAtlas) {
            return;
        }

        if(!node){
            console.error('SetSpriteFrame No Node!');
            return;
        }

        if (typeof dAtlas === 'string') {
            if(dAtlas.indexOf("http") >= 0){
                if (dAtlas.slice(dAtlas.length - 4) == ".png") {
                    // 远程 url 带图片后缀名
                    assetManager.loadRemote<ImageAsset>(dAtlas, function (err, imageAsset) {
                        if (!err) {
                            const spriteFrame = new SpriteFrame();
                            const texture = new Texture2D();
                            texture.image = imageAsset;
                            spriteFrame.texture = texture;
                            
                            if (node.isValid) {
                                node.getComponent(Sprite)!.spriteFrame = spriteFrame;
                            }
                        } else {
                            console.log("加载头像失败");
                        }
                    });
                } else {
                    // 远程 url 不带图片后缀名，此时必须指定远程图片文件的类型
                    assetManager.loadRemote<ImageAsset>(dAtlas, {ext: '.png'}, function (err, imageAsset) {
                        if (!err) {
                            const spriteFrame = new SpriteFrame();
                            const texture = new Texture2D();
                            texture.image = imageAsset;
                            spriteFrame.texture = texture;
                            
                            if(node.isValid){
                                node.getComponent(Sprite)!.spriteFrame = spriteFrame;
                            }
                        } else {
                            console.log("加载头像失败");
                        }
                    });
                }
            }else{
                oops.res.load(`${dAtlas}/spriteFrame`, SpriteFrame, (err: Error, sp: SpriteFrame) => {
                    if (err) {
                        console.error(`加载【${`${dAtlas}/spriteFrame`}】的 图片 资源不存在`);
                        return;
                    }
                    if (!node || !node.isValid) return;
                    node!.getComponent(Sprite)!.spriteFrame = sp;
                    sp.addRef();
                });
            }
        } else {
            let framec = dAtlas.getSpriteFrame(imgPath);
            if(node.isValid){
                node.getComponent(Sprite)!.spriteFrame = framec;
            }
        }
    }

    public static SetLabel(node: Node | undefined, str: number | string | undefined){
        if (!node || !node.isValid) {
            return console.error("Label节点不存在");
        }

        if (typeof str === 'number') {
            str = str.toString();
        } else if (str == undefined) {
            str = "";
        }
        if (node.getComponent(Label)) {
            node.getComponent(Label)!.string = str;
        }else{
            node.getComponent(RichText)!.string = str;
        }

      
    }

    /**
     * 设置label颜色
     * @param node 需要设置的节点
     * @param color 颜色:new Color(255, 255, 255, 255)
     */
    public static SetLabelColor(node: Node | undefined, color: Color = new Color(255, 255, 255, 255)) {
        if (!node || !node.isValid) {
            return console.error("Label节点不存在");
        }
        if (node.getComponent(Label)) {
            node.getComponent(Label)!.color = color;
        }   
    }


    public static async setAtlasSpriteEx(node: Node, path: string[]|null, cb : Function = null!) {
        if(!path || path.length < 2) return 
        await this.setAtlasSprite(node, path[0], path[1], cb!);
    }

    public static setAtlasSprite(node: Node, atlasPath: string, frameKey: string, cb : Function = null!) {
        return new Promise((resolve, reject) => {
            oops.res.load(atlasPath, SpriteAtlas, null, (err : any, atlas : SpriteAtlas) => {
                if (err) {
                    console.error(`加载【${`${atlasPath}`}】的 图片 资源不存在`, node?.name);
                    resolve(null);
                    return;
                }
                if (!node || !node.isValid) return;
                if(!atlas.getSpriteFrame(frameKey)) console.warn("没有找到对应的图片", frameKey, atlasPath, atlas);
                node!.getComponent(Sprite)!.spriteFrame = atlas.getSpriteFrame(frameKey);
                atlas.addRef();
                cb?.(atlas.getSpriteFrame(frameKey))
                resolve(null);
            })
        })
    }

    public static async loadDBRes(node: Node, path: string, cb?:Function) {
        let p1 =  oops.res.loadAsync(path + '_tex', dragonBones.DragonBonesAtlasAsset)
        let p2 =  oops.res.loadAsync(path + '_ske', dragonBones.DragonBonesAsset)

        // const uirender = node.getComponent(UIRenderer)
        // if(uirender && !(uirender instanceof dragonBones.ArmatureDisplay)){
        //     uirender._destroyImmediate()
        // }

        const res = await Promise.all([p1, p2])
        if(!isValid(node)) return
        const db = node.getComponent(dragonBones.ArmatureDisplay)!
        db.dragonAtlasAsset = res[0];
        db.dragonAsset = res[1];
        res[0].addRef();
        res[1].addRef();
        // console.log('addref', res)

        // console.log(db, res)
        db.armatureName = 'Armature';
        db.playAnimation("idle");

        // const idx = SDK.getAppIdx()
        // db.armature()?.getSlots()?.forEach(slot => {
        //     if(slot.displayList.length > 1) slot.displayIndex = idx
        // })
        cb?.(res)
    }

    // /**
    //  * 设置透明度
    //  * @param node 需要设置的节点
    //  * @param opacity 透明度:0~255
    //  */
    // public static SetOpacity(node: Node, opacity: number) {
    //     const opacityComp = node.getComponent(UIOpacity) ? node.getComponent(UIOpacity) : node.addComponent(UIOpacity);
    //     opacityComp.opacity = clamp(opacity, 0, 255);
    // }

    // /**
    //  * 获取输入框的文字
    //  * @param node 需要设置的节点
    //  * @returns 返回字符串
    //  */
    // public static GetEditBoxStr(node: Node): string{
    //     return node.getComponent(EditBox).string;
    // }

    // /**
    //  * 设置输入框的文字
    //  * @param node 需要设置的节点
    //  * @param string 需要展示的内容
    //  */
    // public static SetEditBoxStr(node: Node, string: string | number){
    //     node.getComponent(EditBox).string = typeof string == "string" ? string : String(string);
    // }

    // /**
    //  * 设置进度条
    //  * @param node 需要设置的节点
    //  * @param progress 进度百分比，0～1之间
    //  */
    // public static SetProgressBar(node: Node, progress: number | string) {
    //     var _progress = progress;

    //     if (typeof _progress != 'number') {
    //         _progress = Number(progress);

    //         if(!_progress){
    //             return console.error("progress = ", progress, "(SetProgressBar参数类型错误)");
    //         }
    //     }

    //     if(_progress > 1 || _progress < 0){
    //         console.warn("progress = ", progress, "（progress不在0～1之间，请核对progress值是否正确）");
    //     }

    //     node.getComponent(ProgressBar).progress = clamp01(_progress);
    // }

    // /**
    //  * 设置按钮是否可以交互
    //  * @param node 需要设置的节点
    //  * @param interactable true:可交互，false:不可交互
    //  */
    //  public static SetBtnInteractable(node: Node, interactable: boolean) {
    //     let button = node.getComponent(Button);
    //     if (!button) {
    //         console.error("没有添加Button组件");
    //         return;
    //     }
    //     button.interactable = interactable;
    // }

    // /**
    //  * 设置图片填充百分比
    //  * @param node 需要设置的节点
    //  * @param progress 填充范围的标准化数值（同样从 0 ~ 1）
    //  */
    // public static SetSpriteFillRange(node: Node, progress: number | string) {
    //     const sprite = node.getComponent(Sprite);
    //     if(!sprite){
    //         console.error("没有添加Sprite组件");
    //         return;
    //     }
    //     if(sprite.type != Sprite.Type.FILLED){
    //         console.error("Sprite组件type类型错误");
    //         return;
    //     }

    //     var _progress = progress;

    //     if (typeof _progress != 'number') {
    //         _progress = Number(progress);

    //         if(!_progress){
    //             return console.error("progress = ", progress, "(SetProgressBar参数类型错误)");
    //         }
    //     }

    //     if(_progress > 1 || _progress < 0){
    //         console.warn("progress = ", progress, "（progress不在0～1之间，请核对progress值是否正确）");
    //     }

    //     sprite.fillRange = _progress;
    // }

    /**
     * 
     * @param node 需要添加动画的节点
     * @param aniName 动画文件名字
     * @param animation 播放某个动画的名字,默认是animation，可传可不传
     * @param type 1:sp, 2:龙骨
     */
    public static async SetAnimation(node: Node, path: string, animation: string = "animation", type: number = 1) {
    //     if (type == 1) {
    //         //skeleton
    //         ResourceMng.loadRes("animation/" + aniName, sp.SkeletonData, function (err, skeletonData) {
    //             if (err) {
    //                 console.error('资源加载失败')
    //                 return;
    //             }
    //             var spSkeleton:sp.Skeleton;
    //             if (node.getComponent(sp.Skeleton)) {
    //                 spSkeleton = node.getComponent(sp.Skeleton);
    //             } else {
    //                 spSkeleton = node.addComponent(sp.Skeleton);
    //             }

    //             spSkeleton.skeletonData = skeletonData;
    //             spSkeleton.animation = animation;
    //         })
    //     } else {
            let p1 = oops.res.loadAsync(path + '_tex', dragonBones.DragonBonesAtlasAsset)
            let p2 = oops.res.loadAsync(path + '_ske', dragonBones.DragonBonesAsset)
            const res = await Promise.all([p1, p2])

            var db : dragonBones.ArmatureDisplay
            if (node.getComponent(dragonBones.ArmatureDisplay)) {
                db = node.getComponent(dragonBones.ArmatureDisplay)!
            } else {
                db = node.addComponent(dragonBones.ArmatureDisplay)!
            }
            db.dragonAtlasAsset = res[0];
            db.dragonAsset = res[1];
            res[0].addRef();
            res[1].addRef();

            db.armatureName = 'Armature';
            db.playAnimation(animation);
            return res
    //     }
    }
}