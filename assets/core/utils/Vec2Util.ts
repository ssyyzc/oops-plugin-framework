import {Mat4, Vec2} from "cc";
import {MathUtil} from "./MathUtil";
import { v2 } from "cc";

/** 向量工具 */
export class Vec2Util {
    /**
     * X轴
     */
    static get x(): Readonly<Vec2> {
        return new Vec2(1, 0);
    }

    /**
     * Y轴
     */
    static get y(): Readonly<Vec2> {
        return new Vec2(0, 1);
    }


    /**
     * 左向量
     */
    static get left(): Readonly<Vec2> {
        return new Vec2(-1, 0);
    }

    /**
     * 右向量
     */
    static get right(): Readonly<Vec2> {
        return new Vec2(1, 0);
    }

    /**
     * 上向量
     */
    static get up(): Readonly<Vec2> {
        return new Vec2(0, 1);
    }

    /**
     * 下向量
     */
    static get down(): Readonly<Vec2> {
        return new Vec2(0, -1);
    }

    /**
     * 1向量
     */
    static get one(): Readonly<Vec2> {
        return new Vec2(1, 1);
    }

    /**
     * 0向量
     */
    static get zero(): Readonly<Vec2> {
        return new Vec2(0, 0);
    }

    /**
     * 随时间变化进度值
     * @param start  起始位置
     * @param end    结束位置
     * @param t      进度[0，1]
     */
    static progress(start: Vec2, end: Vec2, t: number): Vec2 {
        const current = new Vec2();
        current.x = MathUtil.progress(start.x, end.x, t);
        current.y = MathUtil.progress(start.y, end.y, t);
        return current;
    }

    /**
     * 求两个三维向量的和
     * @param pos1  向量1
     * @param pos2  向量2
     */
    static add(pos1: Vec2, pos2: Vec2): Vec2 {
        const outPos: Vec2 = new Vec2();
        Vec2.add(outPos, pos1, pos2);
        return outPos;
    }

    /**
     * 求两个三维向量的差
     * @param pos1  向量1
     * @param pos2  向量2
     */
    static sub(pos1: Vec2, pos2: Vec2): Vec2 {
        const outPos: Vec2 = new Vec2();
        Vec2.subtract(outPos, pos1, pos2);
        return outPos;
    }

    /**
     * 三维向量乘以常量
     * @param pos     向量
     * @param scalar  常量
     */
    static mul(pos: Vec2, scalar: number): Vec2 {
        const outPos: Vec2 = new Vec2();
        Vec2.multiplyScalar(outPos, pos, scalar);
        return outPos;
    }

    /**
     * 三维向量除常量
     * @param pos     向量
     * @param scalar  常量
     */
    static div(pos: Vec2, scalar: number): Vec2 {
        const outPos: Vec2 = new Vec2();

        outPos.x = pos.x / scalar;
        outPos.y = pos.y / scalar;

        return outPos;
    }

    /**
     * 判断两个三维向量的值是否相等
     * @param pos1  向量1
     * @param pos2  向量2
     */
    static equals(pos1: Vec2, pos2: Vec2): boolean {
        return pos1.x == pos2.x && pos1.y == pos2.y;
    }

    /**
     * 二维向量的模
     * @param pos  向量
     */
    static magnitude(pos: Vec2): number {
        return pos.length();
    }

    /**
     * 三维向量归一化
     * @param pos  向量
     */
    static normalize(pos: Vec2): Vec2 {
        const outPos: Vec2 = new Vec2(pos.x, pos.y);
        return outPos.normalize();
    }

    /**
     * 获得位置1，到位置2的方向
     * @param pos1  向量1
     * @param pos2  向量2
     */
    static direction(pos1: Vec2, pos2: Vec2): Vec2 {
        const outPos: Vec2 = new Vec2();
        Vec2.subtract(outPos, pos2, pos1)
        return outPos.normalize();
    }

    static signAngle(pos1: Vec2, pos2: Vec2): number {
        let p = pos1.clone()
        return p.signAngle(pos2)
    }

    /**
     * 获得两点间的距离
     * @param pos1  向量1
     * @param pos2  向量2
     */
    static distance(pos1: Vec2, pos2: Vec2): number {
        return Vec2.distance(pos1, pos2);
    }

    /**
     * 插值运算
     * @param posStart  开始俏步
     * @param posEnd    结束位置
     * @param t         时间
     */
    static lerp(posStart: Vec2, posEnd: Vec2, t: number): Vec2 {
        return this.bezierOne(t, posStart, posEnd);
    }

    /**
     * 一次贝塞尔即为线性插值函数
     * @param t
     * @param posStart
     * @param posEnd
     * @returns
     */
    static bezierOne(t: number, posStart: Vec2, posEnd: Vec2): Vec2 {
        if (t > 1) {
            t = 1;
        } else if (t < 0) {
            t = 0
        }

        var pStart: Vec2 = posStart.clone();
        var pEnd: Vec2 = posEnd.clone();

        return pStart.multiplyScalar(1 - t).add(pEnd.multiplyScalar(t));
    }

    /**
     * 二次贝塞尔曲线
     * @param t
     * @param posStart
     * @param posCon
     * @param posEnd
     * @returns
     */
    static bezierTwo(t: number, posStart: Vec2, posCon: Vec2, posEnd: Vec2): Vec2 {
        if (t > 1) {
            t = 1;
        } else if (t < 0) {
            t = 0
        }

        const n = (1 - t);
        const tt = t * t;

        const pStart: Vec2 = posStart.clone();
        const pos = new Vec2();

        const pCon: Vec2 = posCon.clone();
        const pEnd: Vec2 = posEnd.clone();

        pos.add(pStart.multiplyScalar(n * n));
        pos.add(pCon.multiplyScalar(2 * n * t));
        pos.add(pEnd.multiplyScalar(tt));

        return pos;
    }

    /**
     * 三次贝塞尔
     * @param t
     * @param posStart
     * @param posCon1
     * @param posCon2
     * @param posEnd
     * @returns
     */
    static bezierThree(t: number, posStart: Vec2, posCon1: Vec2, posCon2: Vec2, posEnd: Vec2): Vec2 {
        if (t > 1) {
            t = 1;
        } else if (t < 0) {
            t = 0
        }

        const n = (1 - t);
        const nn = n * n;
        const nnn = nn * n;
        const tt = t * t;
        const ttt = tt * t;

        const pStart: Vec2 = posStart.clone();
        const pos = posStart.clone();

        const pCon1: Vec2 = posCon1.clone();
        const pCon2: Vec2 = posCon2.clone();
        const pEnd: Vec2 = posEnd.clone();

        pos.add(pStart.multiplyScalar(nnn));
        pos.add(pCon1.multiplyScalar(3 * nn * t));
        pos.add(pCon2.multiplyScalar(3 * n * tt));
        pos.add(pEnd.multiplyScalar(ttt));

        return pos;
    }

    /**
     * 点乘
     * @param dir1 方向量1
     * @param dir2 方向量2
     */
    static dot(dir1: Vec2, dir2: Vec2): number {
        const tempDir1: Vec2 = dir1;
        const tempDir2: Vec2 = dir2;

        return tempDir1.x * tempDir2.x + tempDir1.y * tempDir2.y;
    }



    /**
     * vec2 旋转
     * @param v 原始向量
     * @param angleDeg 旋转角度（度）
     */
    static rotateAngle(v: Vec2, angleDeg: number): Vec2 {
        const rad = angleDeg * Math.PI / 180
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)

        return v2(
            v.x * cos - v.y * sin,
            v.x * sin + v.y * cos,
        )
    }
}