import { tween } from "cc";
import { easing } from "cc";
import { Tween } from "cc";
import { ITweenOption } from "cc";
import { Node } from "cc";
import { Vec3 } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

declare module "cc" {
    interface Tween {
        jump(duration: number, to: Vec3, jumpHeight: number, opts?: ITweenOption): Tween;
        bezier(duration : number, p : Vec3, end : Vec3, opts?: ITweenOption): Tween;
    }
}

//一阶贝塞尔
function lineBezier(v1 : Vec3, v2 : Vec3, t : number) : Vec3{
    let tempV3 : Vec3 = new Vec3()
    Vec3.lerp(tempV3, v1, v2, t)
    return tempV3
}

if (!EDITOR_NOT_IN_PREVIEW) {
    Object.defineProperty(Tween.prototype, "bezier", {
        value : function(duration : number, p : Vec3, end : Vec3, opts?: ITweenOption) {
            opts = opts ?? {}
            let old = opts.onUpdate

            let begin : Vec3
            // console.log("tttttttt", this, this.target)
            // let begin = this.target.position
            
            // @ts-ignore
            opts.onUpdate = (target : Node, ratio: number) => {
                if(!begin) begin = target.position

                let temp1 = lineBezier(begin, p, ratio)
                let temp2 = lineBezier(p, end, ratio)
                target.position = lineBezier(temp1, temp2, ratio)
                if(old){
                    old(target, ratio)
                }
            }
            
            this.to(duration, { position: end }, opts);
            return this
        }
    })

    Object.defineProperty(Tween.prototype, "jump", {
        value : function(duration: number, to: Vec3, jumpHeight: number, opts?: ITweenOption) {
            opts = opts ?? {}
            let old = opts.onUpdate
            
            // @ts-ignore
            opts.onUpdate = (target : Node, ratio: number) => {
                target.y = target.y + jumpHeight * 4 * ratio * (1 - ratio)
                if(old) old(target, ratio)
            }
            
            this.to(duration, { position: to }, opts);
            return this
            // const tweenPos = new Vec3();
            // const jumpTween = this//tween(this);
            // const totalNum = jumpNum * 2;
        
            // this.jumpY = 0;
            // let startPosY = 0;
            // const yUpTween = tween().to(duration / totalNum, { jumpY: jumpHeight }, {
            //     onStart: (target: Node) => {
            //         startPosY = target.position.y;
            //         target.jumpY = 0;
            //     },
            //     onUpdate: (target: Node, ratio) => {
            //         tweenPos.set(target.position);
            //         tweenPos.y = startPosY + target.jumpY;
            //         target.position = tweenPos;
            //     },
            //     onComplete: (target: Node) => {
            //         target.jumpY = 0;
            //     }, easing: 'quadOut'
            // }).to(duration / totalNum, { jumpY: jumpHeight }, {
            //     onStart: (target: Node) => {
            //         startPosY = target.position.y;
            //     },
            //     onUpdate: (target: Node, ratio) => {
            //         tweenPos.set(target.position);
            //         tweenPos.y = startPosY - target.jumpY;
            //         target.position = tweenPos;
            //     },
            //     onComplete: (target: Node) => {
            //         target.jumpY = 0;
            //     }, easing: 'quadIn',
            // }).union().repeat(jumpNum);
        
            // this.jumpOffsetY = 0;
            // let offsetY = 0;
            // console.log("this, ****", this, this.target)
            // const offsetYTween = tween().to(duration, { jumpOffsetY: to.y - this.target.position.y }, {
            //     onStart: (target: Node) => {
            //         offsetY = to.y - target.position.y;
            //         target.jumpOffsetY = 0;
            //     },
            //     onUpdate: (target: Node, ratio) => {
            //         const interpOffsetY = easing.quadOut(ratio!) * offsetY;
            //         tweenPos.set(target.position);
            //         tweenPos.y += interpOffsetY;
            //         target.position = tweenPos;
            //     },
            //     onComplete: (target: Node) => {
            //         target.jumpOffsetY = 0;
            //     }, easing: 'quadOut'
            // });
        
            // this.jumpX = this.position.x;
            // this.jumpZ = this.position.z;
            // const xzTween = tween().to(duration, { jumpX: to.x, jumpZ: to.z }, {
            //     onStart: opts?.onStart,
            //     onUpdate: (target: Node, ratio) => {
            //         tweenPos.set(target.position);
            //         tweenPos.x = target.jumpX;
            //         tweenPos.z = target.jumpZ;
            //         target.position = tweenPos;
            //         opts?.onUpdate?.();
            //     },
            //     onComplete: (target: Node) => {
            //         // delete target.jumpX;
            //         // delete target.jumpY;
            //         // delete target.jumpZ;
            //         // delete target.jumpOffsetY;
            //         target.jumpX = target.position.x;
            //         target.jumpZ = target.position.z;
            //         opts?.onComplete?.();
            //     }
            // })
        
            // jumpTween.parallel(yUpTween, offsetYTween, xzTween);
            // return jumpTween;
        }
    })


}