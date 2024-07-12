import { TabData } from "../types";
import { EventHandler } from "../util/event-emitter";

export interface TabNavigatorOverlayI {
  /** Display the overlay with the provided list of tabs. */
  show: (tabs: TabData[]) => void;
  
  /** Hide the overlay. */
  hide: () => void;
  
  /** Highlight the specified item by index. */
  selectItem: (tabIndex: number) => void;
  
  /** Register an event listener for when an item is selected by mouse click or pressing Enter. */
  onItemSelected: (listener: EventHandler<TabData>) => void;

  /** Register an event listener for when an item is deleted. */
  onItemDeleted: (listener: EventHandler<TabData>) => void;
}