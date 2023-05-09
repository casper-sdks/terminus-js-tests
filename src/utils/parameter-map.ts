/**
 A class that wraps a map with a string key that allows for any generic type when putting and getting values.
 *
 * @author ian@meywood.com
 */
export class ParameterMap {

    private static instance = new ParameterMap();
    private map = new Map<string, any>;

    public static getInstance(): ParameterMap {
        return ParameterMap.instance;
    }

    public put<T>(key: string, value: T) {
        this.map.set(key, value);
    }

    public get<T>(key: string): T {
        return this.map.get(key);
    }

    public clear() {
        this.map.clear();
    }

}