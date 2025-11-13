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

    static getTable<T>(Cls: new () => T, id: number) : T{
        let c = new Cls() as any
        c.init(id)
        return c
    }
}