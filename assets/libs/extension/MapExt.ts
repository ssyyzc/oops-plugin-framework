
declare global {
    interface Map<K, V> {
        keyOf(value: V): K;
    }
}

// 实现
Map.prototype.keyOf = function <K, V>(this: Map<K, V>, value: V): K {
    let index = 0;
    for (const [k, v] of this) {
        if (v === value) return k;
        index++;
    }
    return undefined as any;
};

export { };

