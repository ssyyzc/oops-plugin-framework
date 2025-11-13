import { Node } from "cc";
import { ITweenOption } from "cc";
import { Tween } from "cc";
import { __private } from "cc";
import { tween } from "cc";
import { Vec3 } from "cc";

/** 动画工具 */
export class TweenUtil {
    /**
     * 间隔天数
     * @param time1 开始时间
     * @param time2 结束时间
     * @returns 
     */

    static to(node: Node, duration: number, props: __private._cocos_tween_tween__ConstructorType<Node>, opts?: ITweenOption<Node> | undefined){
        return new Promise((resolve, reject) => {
            tween(node)
            .to(duration, props, opts)
            .call(() => {
                resolve(null)
            })
            .start()
        })
    }


    static exec(node: Node, tweens : Tween){
        return new Promise((resolve, reject) => {
            tween(node)
            .then(
                tweens
            )
            .call(() => {
                resolve(null)
            })
            .start()
        })
    }

    static execAsync(tweens : Tween){
        return new Promise((resolve, reject) => {
            tweens
            .call(() => {
                resolve(null)
            })
            .start()
        })
    }
}