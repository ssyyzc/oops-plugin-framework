/** 引擎 utils.ts 中有一些基础数学方法 */

/** 随机管理 */
export class RandomManager {
    private static _instance: RandomManager;
    private random: any = null!;

    /** 随机数管理单例对象 */
    static get instance(): RandomManager {
        if (this._instance == null) {
            this._instance = new RandomManager();
            this._instance.setRandom(Math.random);
        }
        return this._instance;
    }

    /** 设置第三方随机库 */
    setRandom(random: any) {
        this.random = random;
    }

    private getRandom(): number {
        return this.random();
    }

    /** 设置随机种子 */
    setSeed(seed: number) {
        //@ts-ignore
        this.seedrandom = new Math.seedrandom(seed);
    }

    /**
     * 是否触发概率
     * @param num 概率0-1
     * @returns 
     */
    isBingo(num: number): boolean{
        return this.getRandom() <= num;
    }

    /**
     * 生成指定范围的随机浮点数
     * @param min   最小值
     * @param max   最大值
     */
    getRandomFloat(min: number = 0, max: number = 1): number {
        return this.getRandom() * (max - min) + min;
    }

    /**
     * 生成指定范围的随机整数
     * @param min   最小值
     * @param max   最大值
     * @param type  类型
     * @example
    var min = 1;
    var max = 10;
    // [min,max) 得到一个两数之间的随机整数,这个值不小于min（如果min不是整数的话，得到一个向上取整的 min），并且小于（但不等于）max  
    RandomManager.instance.getRandomInt(min, max, 1);

    // [min,max] 得到一个两数之间的随机整数，包括两个数在内,这个值比min大（如果min不是整数，那就不小于比min大的整数），但小于（但不等于）max
    RandomManager.instance.getRandomInt(min, max, 2);

    // (min,max) 得到一个两数之间的随机整数
    RandomManager.instance.getRandomInt(min, max, 3);
     */
    getRandomInt(min: number, max: number, type: number = 2): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        switch (type) {
            case 1: // [min,max) 得到一个两数之间的随机整数,这个值不小于min（如果min不是整数的话，得到一个向上取整的 min），并且小于（但不等于）max  
                return Math.floor(this.getRandom() * (max - min)) + min;
            case 2: // [min,max] 得到一个两数之间的随机整数，包括两个数在内,这个值比min大（如果min不是整数，那就不小于比min大的整数），但小于（但不等于）max
                return Math.floor(this.getRandom() * (max - min + 1)) + min;
            case 3: // (min,max) 得到一个两数之间的随机整数
                return Math.floor(this.getRandom() * (max - min - 1)) + min + 1;
        }
        return 0;
    }

    getRandomBoolean() : Boolean {
        return this.getRandomInt(0, 1) == 1
    }

    /**
     * 根据最大值，最小值范围生成随机数数组
     * @param min   最小值
     * @param max   最大值
     * @param n     随机个数
     * @example
    var a = RandomManager.instance.getRandomByMinMaxList(50, 100, 5)
    console.log("随机的数字", a);
     */
    getRandomByMinMaxList(min: number, max: number, n: number): Array<number> {
        var result: Array<number> = [];
        for (let i = 0; i < n; i++) {
            result.push(this.getRandomInt(min, max))
        }
        return result;
    }

    /**
     * 获取数组中随机对象
     * @param objects 对象数组
     * @param n 随机个数
     * @example
    var b = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var r = RandomManager.instance.getRandomByObjectList(b, 5);
    console.log("原始的对象", b);
    console.log("随机的对象", r);
     */
    getRandomByObjectList<T>(objects: Array<T>, n: number, type = 1): Array<T> {
        var temp: Array<T> = objects.slice();
        var result: Array<T> = [];
        for (let i = 0; i < n; i++) {
            let index = this.getRandomInt(0, temp.length, type);
            result.push(temp.splice(index, 1)[0]);
        }
        return result;
    }

    /**
     * 定和随机分配
     * @param n     随机数量
     * @param sum   随机元素合
     * @example
    var c = RandomManager.instance.getRandomBySumList(5, -100);
    console.log("定和随机分配", c);
     */
    getRandomBySumList(n: number, sum: number): number[] {
        let residue = sum;
        let value = 0;
        const result: Array<number> = [];
        for (let i = 0; i < n; i++) {
            value = this.getRandomInt(0, residue, 3);
            if (i == n - 1) {
                value = residue;
            }
            else {
                residue -= value;
            }
            result.push(value);
        }
        return result;
    }

    // 从列表中选择
    select(list: any[], num : number){
        // 不修改原数组
        list = list.slice().sort(() => {
            return Math.random() > 0.5 ? 1 : -1
        })

        return list.slice(0, num)
    }

    selectOne(list : any[]){
        let li = this.select(list, 1)
        return li[0]
    }

    selectNumbers(min : number, max : number, num: number){
        if (num > max - min + 1) {
            throw new Error("m cannot be greater than n + 1");
        }
        
        const result = new Set();
        while (result.size < num) {
            const num = this.getRandomInt(min, max)
            result.add(num);
        }
        return Array.from(result);
    }

    // 随机打乱列表
    luanxu(list: any[]) {
        list = list.slice().sort(() => {
            return Math.random() > 0.5 ? 1 : -1
        })
        return list
    }

    getSingleByWeight<T extends {weight: number}>(list: T[]) {
        let sumW = 0
        let range : number[] = []
        list.forEach((cfg, i) => {
            sumW += Number(cfg.weight)
            if (i == 0) {
                range.push(Number(cfg.weight))
            } else {
                range.push(range[range.length - 1] + Number(cfg.weight))
            }

        });

        let idx = 0
        let rdm = Math.floor(Math.random() * sumW)
        for (let i = 0; i < range.length; i++) {
            if (rdm < range[i]) {
                idx = i
                break;
            }
        }
        return { cfg: list[idx], i: idx }
    }
}