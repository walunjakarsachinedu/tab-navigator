type EventHandler<Data> = (data: Data) => void; 

class EventEmitter<Data> {
  listeners: Set<EventHandler<Data>>; 

  constructor() {
    this.listeners = new Set();
  }

  addListener(listener: EventHandler<Data>) {
    this.listeners.add(listener);
  }

  removeListener(listener: EventHandler<Data>) {
    this.listeners.delete(listener);
  }

  clear() {
    this.listeners = new Set();
  }

  emit(data: Data) {
    for(let listener of this.listeners) listener(data);
  }
}


export {EventEmitter, EventHandler};