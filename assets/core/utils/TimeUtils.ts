/** 时间工具 */
export class TimeUtil {
    /**
     * 间隔天数
     * @param time1 开始时间
     * @param time2 结束时间
     * @returns 
     */
    static daysBetween(time1: number | string | Date, time2: number | string | Date): number {
        if (time2 == undefined) {
            time2 = +new Date();
        }
        let startDate = new Date(time1).toLocaleDateString()
        let endDate = new Date(time2).toLocaleDateString()
        let startTime = new Date(startDate).getTime();
        let endTime = new Date(endDate).getTime();
        return Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }

    /** 间隔秒数，时间顺序无要求，最后会获取绝对值 */
    static secsBetween(time1: number, time2: number) {
        let dates = Math.abs((time2 - time1)) / (1000);
        dates = Math.floor(dates) + 1;
        return dates;
    }

    /**
     * 代码休眠时间
     * @param ms 毫秒
     */
    static async sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms)
        });
    }

    // ------ NEW CODE ----------
    private static readonly START_DATE = new Date(Date.UTC(2025, 9, 1));

    // 获取当前时间距离2025年10月1日
    static getDayNum() {
        const curDate = new Date();
        const diffMs = Math.abs(curDate.getTime() - TimeUtil.START_DATE.getTime());
        const dayNum = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return dayNum;
    }

    /**
     *  获取当前月份的最大天数
     * @returns 
     */
    static getMaxDayInCurrentMonth(): number {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 月份从 0 开始，所以需要加 1
        return new Date(year, month, 0).getDate(); // 0 表示上个月的最后一天
    }

    /**
     * 获取当前日期
     * @returns 
     */
    static getCurrentDay(): number {
        return new Date().getDate();
    }
}