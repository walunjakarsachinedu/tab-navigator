import { EventEmitter, EventHandler } from "../util/event-emitter";

/**
 * @class Handles keyboard interactions, tracking key presses/releases and emitting events.
 */
class MyKeyboard {
  private _keysPressed: Set<String>;
  private _keyDownEvent: EventEmitter<Set<String>>;
  private _keyUpEvent: EventEmitter<String>;
  
  constructor() {
    this._keysPressed = new Set();
    this._keyDownEvent = new EventEmitter<Set<String>>();
    this._keyUpEvent = new EventEmitter<String>();

    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) this._clearKeys();
    });
    window.addEventListener('blur', this._clearKeys);
  }


  removeKeyDownListener(listener: EventHandler<Set<String>>) {
    this._keyDownEvent.removeListener(listener);
  }

  removeKeyUpListener(listener: EventHandler<String>) {
    this._keyUpEvent.removeListener(listener);
  }

  listenKeyDown(listener: EventHandler<Set<String>>) {
    this._keyDownEvent.addListener(listener);
  }
  listenKeyUp(listener: EventHandler<String>) {
    this._keyUpEvent.addListener(listener);
  }

  private _clearKeys() {
    if(this._keysPressed) this._keysPressed.clear();
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if(e.code == null) return;
    const keyCode = this._getKeyName(e.code);
    if(!this._keysPressed.has(keyCode)) {
        this._keysPressed.add(keyCode);
        this._keyDownEvent.emit(this._keysPressed);
    }
  }
  private _onKeyUp(e: KeyboardEvent): void {
    if(e.code == null) return;
    const keyCode = this._getKeyName(e.code);
    if(this._keysPressed.has(keyCode)) {
        this._keysPressed.delete(keyCode);
        this._keyUpEvent.emit(keyCode);
    }
  }

  private _keyCodeToName: {[key: string]: string} =  {
    "MetaLeft": "Meta",
    "MetaRight": "Meta",
    "AltLeft": "Alt",
    "AltRight": "Alt",
    "ShiftLeft": "Shift",
    "ShiftRight": "Shift",
    "CtrlLeft": "Ctrl",
    "CtrlRight": "Ctrl",
  };
  private _getKeyName(keyCode: string): string {
    if(keyCode.startsWith("Key")) keyCode = keyCode.slice(3);
    else if(keyCode in this._keyCodeToName) keyCode = this._keyCodeToName[keyCode];
    return keyCode.toLowerCase();
  }
}


export default MyKeyboard;