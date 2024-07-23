type TabData = {id: number, url: string, title: string, status: string, favIconUrl: string, windowId: number };
type TabSelectCallback = (index: number, tab: TabData) => void;
type Match = {title: number[], url: number[], rank: number };

export { TabData, TabSelectCallback, Match };