type TabData = {id: number, url: string, title: string, status: string};
type TabSelectCallback = (index: number, tab: TabData) => void;

export { TabData, TabSelectCallback };