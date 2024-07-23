async function getCurrentWindowId() : Promise<number> {
  return new Promise((resolve, _) => {
    chrome.windows.getLastFocused({populate: false}, (window) => {
      resolve(window.id!);
    });
  });
}

function removeSchemaFromUrl(url: string): string {
  return url.replace(/^(https?|ftp):\/\//, '');
}



export { getCurrentWindowId, removeSchemaFromUrl };