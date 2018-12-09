import {Listener} from './datamodel'

class PubSub<T> {
  private listeners: Set<Listener<T>>

  constructor() {
    this.listeners = new Set()
  }

  public add(listener: Listener<T>): Listener<T> {
    this.listeners.add(listener)
    return listener
  }

  public remove(listener: Listener<T>): Listener<T> {
    this.listeners.delete(listener)
    return listener
  }

  public emit(event: T): PubSub<T> {
    this.listeners.forEach((listener: Listener<T>) => listener(event))
    return this
  }
}

export default PubSub
