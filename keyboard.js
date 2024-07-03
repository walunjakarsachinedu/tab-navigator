class MyKeyboard {
  keysPressed = new Set();
  keyDownListener = new Set();
  keyUpListener = new Set();
  
  constructor() {
    $(window).keydown(this._onKeyDown.bind(this));
    $(window).keyup(this._onKeyUp.bind(this));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) this._clearKeys();
    });
    window.addEventListener('blur', this._clearKeys);
  }


  concelListener(listener) {
    this.keyUpListener.delete(listener);
    this.keyDownListener.delete(listener);
  }

  listenKeyDown(listener) {
    this.keyDownListener.add(listener);
  }
  listenKeyUp(listener) {
    this.keyUpListener.add(listener);
  }

  _clearKeys() {
    if(this.keysPressed) this.keysPressed.clear();
  }

  _onKeyDown(e) {
    const keyCode = this._getKeyName(e.code);
    if(!this.keysPressed.has(keyCode)) {
        this.keysPressed.add(keyCode);
        for(let listener of this.keyDownListener) listener(this.keysPressed);
    }
  }
  _onKeyUp(e) {
    const keyCode = this._getKeyName(e.code);
    if(this.keysPressed.has(keyCode)) {
        for(let listener of this.keyUpListener) listener(this.keysPressed);
        this.keysPressed.delete(keyCode);
    }
  }

  _keyCodeToName =  {
    "MetaLeft": "Meta",
    "MetaRight": "Meta",
    "AltLeft": "Alt",
    "AltRight": "Alt",
    "ShiftLeft": "Shift",
    "ShiftRight": "Shift",
  };
  _getKeyName(keyCode) {
    if(keyCode.startsWith("Key")) return keyCode.slice(3);
    if(keyCode in this._keyCodeToName) return this._keyCodeToName[keyCode];
    return keyCode;
  }
}