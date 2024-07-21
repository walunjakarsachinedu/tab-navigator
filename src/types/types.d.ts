type TabData = {id: number, url: string, title: string, status: string, favIconUrl: string, windowId: number };
type TabSelectCallback = (index: number, tab: TabData) => void;

export { TabData, TabSelectCallback };