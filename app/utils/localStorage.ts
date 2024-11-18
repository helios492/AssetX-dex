class LocalStorage {
  static get(key: string) {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  static set(key: string, value: any): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static remove(key: string) {
    if (typeof window !== 'undefined') {
      if (window.localStorage.getItem(key) !== null) {
        window.localStorage.removeItem(key);
        return true;
      }
    }
    return false;
  }
}

export default LocalStorage;
