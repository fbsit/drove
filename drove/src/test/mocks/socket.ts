import { EventEmitter } from 'events';

export function createFakeSocket() {
  const ee = new EventEmitter();
  return {
    on: ee.on.bind(ee),
    emit: ee.emit.bind(ee),
    disconnect: () => {},
    __ee: ee,
  } as any;
}

export function installSocketMock() {
  const socket = createFakeSocket();
  // @ts-ignore
  globalThis.__SOCKET__ = socket;
  return socket;
}


