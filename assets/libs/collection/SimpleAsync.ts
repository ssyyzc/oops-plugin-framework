export class SimpleQueue {
    ps : Promise<void>[] = []
    push(fun : Function) {
        this.ps.push(new Promise(async (resolve, reject) => {
            await fun()
            resolve()
        }))
    }

    wait(){
        return Promise.all(this.ps)
    }
}