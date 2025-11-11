import { JsonUtil } from "./JsonUtil";

export class TableUtils {
    static getIdsByKey(tableName: string, key: string, value: any){
        let data = JsonUtil.get(tableName);
        let list = []
        for(let id in data){
            let info : any = data[id]
            if(info[key] == value){
                list.push(id)
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