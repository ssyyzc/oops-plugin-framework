import { JsonUtil } from "./JsonUtil";

export class TableUtils {
    static getIdsByKey<T>(tab: new () => T, key: keyof T, value: any){
        let data = JsonUtil.get((tab as any).TableName);
        let list = []
        for(let id in data){
            let info : any = data[id]
            if(info[key] == value){
                list.push(Number(id))
            }
        }
        return list
    }


    static getTabByKey<T>(tab: new () => T, key: keyof T, value: any) : T[]{
        let data = JsonUtil.get((tab as any).TableName);
        let list : T[] = []
        for(let id in data){
            let info : any = data[id]
            if(info[key] == value){
                list.push(info)
            }
        }
        return list
    }

    static getRandomId<T>(tab: new () => T){
        let data = JsonUtil.get((tab as any).TableName);
        let list = []
        for(let id in data){
            list.push(Number(id))
        }
        return list[Math.floor(Math.random() * list.length)]
    }

    static getTable<T>(Cls: new () => T, id: number) : T{
        let c = new Cls() as any
        c.init(id)
        return c
    }
}