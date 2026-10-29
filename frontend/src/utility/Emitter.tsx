import EventEmitter from 'eventemitter3'

type EventName = string | symbol
type EventHandler = (...args: unknown[]) => void

const eventEmitter = new EventEmitter()

const Emitter = {
    on: (event: EventName, fn: EventHandler) => eventEmitter.on(event, fn),
    once: (event: EventName, fn: EventHandler) => eventEmitter.once(event, fn),
    off: (event: EventName, fn?: EventHandler) => eventEmitter.off(event, fn),
    emit: (event: EventName, payload?: unknown) => eventEmitter.emit(event, payload)
}

Object.freeze(Emitter)

export default Emitter
