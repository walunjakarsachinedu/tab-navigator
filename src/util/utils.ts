async function getCurrentWindowId(): Promise<number> {
  return new Promise((resolve, _) => {
    chrome.windows.getLastFocused({ populate: false }, (window) => {
      resolve(window.id!);
    });
  });
}

function removeSchemaFromUrl(url: string): string {
  return url.replace(/^(https?|ftp):\/\//, "");
}

const _keyCodeToName: { [key: string]: string } = {
  MetaLeft: "Meta",
  MetaRight: "Meta",
  AltLeft: "Alt",
  AltRight: "Alt",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  CtrlLeft: "Ctrl",
  CtrlRight: "Ctrl",
};

function getKeyName(keyCode: string): string {
  if (keyCode.startsWith("Key")) keyCode = keyCode.slice(3);
  else if (keyCode in _keyCodeToName) keyCode = _keyCodeToName[keyCode];
  return keyCode.toLowerCase();
}

export { getCurrentWindowId, removeSchemaFromUrl, getKeyName };
