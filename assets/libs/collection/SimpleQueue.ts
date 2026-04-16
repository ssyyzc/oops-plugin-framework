export class SimpleQueue {
    ps : Promise<any>[] = []

    wait_count = 0
    constructor(wait_count ?: number){
        this.wait_count = wait_count || 0
    }

    async push(fun : Function | Promise<any>) {
        if(fun instanceof Promise){
            this.ps.push(fun)
        }else{
            this.ps.push(new Promise(async (resolve, reject) => {
                await fun()
                resolve(null)
            }))
        }

        //到达检测数量时，自动等待所有任务完成
        if(this.wait_count > 0 && this.ps.length >= this.wait_count){
            let ps = this.ps
            this.ps = []
            return Promise.all(ps)
        }
    }

    wait(){
        return Promise.all(this.ps)
    }
}