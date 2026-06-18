/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-12-13 11:36:00
 */
import { Asset, Component, ImageAsset, Sprite, SpriteAtlas, SpriteFrame, Texture2D, __private, _decorator, assetManager, isValid } from "cc";
import { oops } from "../../core/Oops";
import { AssetType, CompleteCallback, Paths, ProgressCallback, resLoader } from "../../core/common/loader/ResLoader";
import { Node } from "cc";

const { ccclass } = _decorator;

/** 加载资源类型 */
export enum ResType {
    Load,
    LoadDir
}

/** 资源加载记录 */
export interface ResRecord {
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
 * 资源管理组件模板
 * 当前对象加载的资源，会在对象释放时，自动释放引用的资源
 */
@ccclass("ResComponent")
export class ResComponent extends Component {
    /** 资源路径 */
    protected resPaths: Map<ResType, Map<string, ResRecord>> = null!;

    /**
     * 获取资源
     * @param path          资源路径
     * @param type          资源类型
     * @param bundleName    远程资源包名
     */
    getRes<T extends Asset>(path: string, type?: __private.__types_globals__Constructor<T> | null, bundleName?: string): T | null {
        return oops.res.get(path, type, bundleName);
    }

    /**
     * 添加资源使用记录
     * @param type          资源类型
     * @param bundleName    资源包名
     * @param paths         资源路径
     */
    protected addPathToRecord<T>(type: ResType, bundleName: string, paths?: string | string[] | AssetType<T> | ProgressCallback | CompleteCallback | null) {
        if (this.resPaths == null) this.resPaths = new Map();

        var rps = this.resPaths.get(type);
        if (rps == null) {
            rps = new Map();
            this.resPaths.set(type, rps);
        }

        if (paths instanceof Array) {
            let realBundle = bundleName;
            for (let index = 0; index < paths.length; index++) {
                let realPath = paths[index];
                let key = this.getResKey(realBundle, realPath);
                let rp = rps.get(key);
                if (rp) {
                    rp.refCount++;
                }
                else {
                    rps.set(key, { path: realPath, bundle: realBundle, refCount: 1 });
                }
            }
        }
        else if (typeof paths === "string") {
            let realBundle = bundleName;
            let realPath = paths;
            let key = this.getResKey(realBundle, realPath);
            let rp = rps.get(key);
            if (rp) {
                rp.refCount++;
            }
            else {
                rps.set(key, { path: realPath, bundle: realBundle, refCount: 1 });
            }
        }
        else {
            let realBundle = oops.res.defaultBundleName;
            let realPath = bundleName;
            let key = this.getResKey(realBundle, realPath);
            let rp = rps.get(key);
            if (rp) {
                rp.refCount++;
            }
            else {
                rps.set(key, { path: realPath, bundle: realBundle, refCount: 1 });
            }
        }
    }

    protected getResKey(realBundle: string, realPath: string): string {
        let key = `${realBundle}:${realPath}`;
        return key;
    }

    /**
     * 加载一个资源
     * @param bundleName    远程包名
     * @param paths         资源路径
     * @param type          资源类型
     * @param onProgress    加载进度回调
     * @param onComplete    加载完成回调
     */
    load<T extends Asset>(bundleName: string, paths: Paths, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    load<T extends Asset>(bundleName: string, paths: Paths, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    load<T extends Asset>(bundleName: string, paths: Paths, onComplete?: CompleteCallback): void;
    load<T extends Asset>(bundleName: string, paths: Paths, type: AssetType<T>, onComplete?: CompleteCallback): void;
    load<T extends Asset>(paths: Paths, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    load<T extends Asset>(paths: Paths, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    load<T extends Asset>(paths: Paths, onComplete?: CompleteCallback): void;
    load<T extends Asset>(paths: Paths, type: AssetType<T>, onComplete?: CompleteCallback): void;
    load<T extends Asset>(
        bundleName: string,
        paths?: Paths | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ) {
        this.addPathToRecord(ResType.Load, bundleName, paths);
        oops.res.load(bundleName, paths, type, onProgress, onComplete);
    }

    /**
     * 异步加载一个资源
     * @param bundleName    远程包名
     * @param paths         资源路径
     * @param type          资源类型
     */
    loadAsync<T extends Asset>(bundleName: string, paths: Paths, type: AssetType<T>): Promise<T>;
    loadAsync<T extends Asset>(bundleName: string, paths: Paths): Promise<T>;
    loadAsync<T extends Asset>(paths: Paths, type: AssetType<T>): Promise<T>;
    loadAsync<T extends Asset>(paths: Paths): Promise<T>;
    loadAsync<T extends Asset>(bundleName: string,
        paths?: Paths | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback): Promise<T> {
        this.addPathToRecord(ResType.Load, bundleName, paths);
        return oops.res.loadAsync(bundleName, paths, type);
    }

    /**
     * 加载文件夹中的资源
     * @param bundleName    远程包名
     * @param dir           文件夹名
     * @param type          资源类型
     * @param onProgress    加载进度回调
     * @param onComplete    加载完成回调
     */
    loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(bundleName: string, dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(bundleName: string, dir: string, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(
        bundleName: string,
        dir?: string | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ) {
        let realDir: string;
        let realBundle: string;
        if (typeof dir === "string") {
            realDir = dir;
            realBundle = bundleName;
        }
        else {
            realDir = bundleName;
            realBundle = oops.res.defaultBundleName;
        }

        this.addPathToRecord(ResType.LoadDir, realBundle, realDir);
        oops.res.loadDir(bundleName, dir, type, onProgress, onComplete);
    }

    /** 释放资源 */
    release() {
        if (this.resPaths) {
            const rps = this.resPaths.get(ResType.Load);
            if (rps) {
                rps.forEach((value: ResRecord) => {
                    for (let i = 0; i < value.refCount; i++) {
                        console.log("ResComponent 开始释放资源", value.path, value.bundle)
                        oops.res.release(value.path, value.bundle);
                    }
                });
                rps.clear();
            }
        }
    }

    /** 释放文件夹的资源 */
    releaseDir() {
        if (this.resPaths) {
            const rps = this.resPaths.get(ResType.LoadDir);
            if (rps) {
                rps.forEach((value: ResRecord) => {
                    oops.res.releaseDir(value.path, value.bundle);
                });
            }
        }
    }

    /**
     * 设置图片资源
     * @param target  目标精灵对象
     * @param path    图片资源地址
     * @param bundle  资源包名
     */
    private async setSprite(target: Sprite, path: string, bundle: string = resLoader.defaultBundleName) {
        const spriteFrame = await this.loadAsync(bundle, path + "/spriteFrame", SpriteFrame);
        if (!spriteFrame || !isValid(target)) {
            const rps = this.resPaths?.get(ResType.Load);
            if (rps) {
                const key = this.getResKey(bundle, path);
                rps.delete(key);
                oops.res.release(path, bundle);
            }
            return;
        }
        spriteFrame.addRef();
        target.spriteFrame = spriteFrame;
    }

    /**
     * 设置远程图片资源
     * @param target  目标精灵对象
     * @param url     远程图片地址
     */
    private setRemoteSpriteFrame(target: Sprite, url: string) {
        if (url.slice(url.length - 4) === ".png") {
            assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
                if (err) {
                    console.error(`加载远程图片失败: ${url}`);
                    return;
                }
                if (!isValid(target)) return;
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                target.spriteFrame = spriteFrame;
            });
        } else {
            assetManager.loadRemote<ImageAsset>(url, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.error(`加载远程图片失败: ${url}`);
                    return;
                }
                if (!isValid(target)) return;
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                target.spriteFrame = spriteFrame;
            });
        }
    }



    /**
     * 设置图片资源（支持图集）
     * @param target  目标精灵对象
     * @param paths   图片资源地址或 [图集路径, 图片名] 或 [bundle, 图集路径, 图片名]
     * @param bundle  资源包名（paths为string时使用）
     */
    async setSpriteFrame(node: Node|null|undefined, paths: string[] | string, bundle: string = resLoader.defaultBundleName) {
        if(!node){
            // console.error('SetSpriteFrame No Node!');
            return;
        }
        let target = node.getComponent(Sprite)
        if(!target) return

        if (!paths) return;

        if (typeof paths === 'string') {
            if (paths.indexOf("http") >= 0) {
                this.setRemoteSpriteFrame(target, paths);
                return;
            }
            await this.setSprite(target, paths, bundle);
            return;
        }

        if (paths.length === 1) {
            if (paths[0].indexOf("http") >= 0) {
                this.setRemoteSpriteFrame(target, paths[0]);
                return;
            }
            await this.setSprite(target, paths[0], bundle);
            return;
        }

        let b = bundle;
        let atlasPath: string;
        let imgPath: string;

        if (paths.length >= 3) {
            b = paths[0];
            atlasPath = paths[1];
            imgPath = paths[2];
        } else {
            atlasPath = paths[0];
            imgPath = paths[1];
        }

        if (!atlasPath) {
            await this.setSprite(target, imgPath, b);
            return;
        }

        const atlas = await this.loadAsync(b, atlasPath, SpriteAtlas);
        if (!atlas || !isValid(target)) {
            const rps = this.resPaths?.get(ResType.Load);
            if (rps) {
                const key = this.getResKey(b, atlasPath);
                rps.delete(key);
                oops.res.release(atlasPath, b);
            }
            return;
        }
        atlas.addRef();
        const spriteFrame = atlas.getSpriteFrame(imgPath);
        if (spriteFrame) {
            target.spriteFrame = spriteFrame;
        }
    }

    protected onDestroy() {
        if (this.resPaths) {
            this.release();
            this.releaseDir();
            this.resPaths.clear();
            this.resPaths = null!;
        }
    }
}
