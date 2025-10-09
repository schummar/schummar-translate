import { useEffect, useState } from 'react';

export class Observable<T> {
  listensers = new Set<(value: T) => void>();

  constructor(private _value: T) {}

  get value() {
    return this._value;
  }

  set value(value: T) {
    this._value = value;

    for (const listener of this.listensers) {
      listener(value);
    }
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listensers.add(listener);

    return () => {
      this.listensers.delete(listener);
    };
  }
}

export function useObservable<T>(observable: Observable<T>): T {
  const [value, setValue] = useState(observable.value);

  useEffect(() => {
    return observable.subscribe((value) => {
      setValue(value);
    });
  }, [observable]);

  return value;
}
