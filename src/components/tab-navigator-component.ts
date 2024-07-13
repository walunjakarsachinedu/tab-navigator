import { TabNavigatorOverlayI } from "../interface/tab-navigator-overlay";
import { TabData } from "../types";
import { EventEmitter, EventHandler } from "../util/event-emitter";

export class TabNavigatorOverlay implements TabNavigatorOverlayI {
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  tabs: TabData[] = [];
  private selectedTabIndex: number = 0;
  private itemSelectedEmitter: EventEmitter<TabData> = new EventEmitter();
  private itemDeletedEmitter: EventEmitter<TabData> = new EventEmitter();

  constructor() {
    this.container = document.createElement('div');
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    this.initializeStyles();
    this.initializeUI();
  }

  private initializeStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap');

      .dialog {
        font-family: "Fira Code", monospace;
        font-size: 12px;
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e1e1e;
        color: #ffffff;
        border: 1px solid #333;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        padding: 10px;
        z-index: 10000;
        display: none;
        width: 500px;
        max-height: 70%;

        overflow-y: auto;
        scrollbar-width: thin; 
        scrollbar-color: #888888 #f0f0f0;
      }
      @media (max-width: 768px) {
        .dialog {
            width: 70%;
        }
      }

      .dialog ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .dialog li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        cursor: pointer;
      }
      .dialog li.selected {
        background: #007acc;
      }
      .dialog li:hover:not(.selected) {
        background: #333333;
      }
      .text-truncate {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-grow: 1;
        line-height: 1.5;
      }
      .remove-button {
        margin-left: 10px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
      }

      .subtitle {
        color: #cfd6ff !important;
      }

      .sidebar::-webkit-scrollbar {
        width: 8px; /* Width of the scrollbar */
        height: 8px; /* Height of the scrollbar (for horizontal scrollbar) */
        border-radius: 10px; /* Rounded corners */
      }

      .sidebar::-webkit-scrollbar-thumb {
        background-color: #888888; /* Color of the scrollbar thumb */
        border-radius: 10px; /* Rounded corners */
      }

      .sidebar::-webkit-scrollbar-track {
        background-color: #f0f0f0; /* Color of the scrollbar track */
        border-radius: 10px; /* Rounded corners */
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  get element() {
    return this.container;
  }

  private initializeUI() {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
  
    const list = document.createElement('ul');
    dialog.appendChild(list);
  
    this.shadowRoot.appendChild(dialog);
    document.body.appendChild(this.container);
  
    // Add event listener for list item clicks
    list.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
  
      if (target.tagName === 'LI' || target.classList.contains('li-item-title')) {
        let liElement: HTMLElement | null = target;
        if (target.classList.contains('li-item-title')) {
          liElement = target.parentElement as HTMLElement;
        }
  
        const index = Array.from(list.children).indexOf(liElement);
        if (index !== -1) {
          this.selectItem(index);
          this.itemSelectedEmitter.emit(this.tabs[index]);
        }
      }
    });
  
    // Add event listener for remove button clicks
    list.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('remove-button')) {
        const liElement = target.parentElement as HTMLElement;
        const index = Array.from(list.children).indexOf(liElement);
        if (index !== -1) {
          this.removeItem(index);
          this.itemDeletedEmitter.emit(this.tabs[index]);
        }
      }
    });
  
    document.addEventListener('keydown', (event) => {
      if (dialog.style.display === 'block') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          if (this.selectedTabIndex !== null) {
            this.selectItem((this.selectedTabIndex + (event.key === 'ArrowUp' ? -1 : 1) + this.tabs.length) % this.tabs.length);
          }
        } else if (event.key === 'Enter' && this.selectedTabIndex !== null) {
          this.itemSelectedEmitter.emit(this.tabs[this.selectedTabIndex]);
        }
      }
    });
  }
  
  
  show(tabs: TabData[]): void {
    this.tabs = tabs;
    this.selectedTabIndex = 0;
    const list = this.shadowRoot.querySelector('ul')!;
    list.innerHTML = '';
    tabs.forEach((tab) => {
      const title = document.createElement('div');
      title.classList.add("text-truncate", "li-item-title")
      title.textContent = tab.title;
      const subtitle = document.createElement('div');
      subtitle.textContent = tab.url.replace(/^(https?|ftp):\/\//, '');
      subtitle.classList.add("text-truncate", "subtitle", "pl-2");
      title.appendChild(subtitle);

      const removeButton = document.createElement('button');
      removeButton.innerHTML = '&#x2715;'; // Unicode character for "✕"
      removeButton.classList.add('remove-button');

      const item = document.createElement('li');
      item.appendChild(title);
      item.appendChild(removeButton);

      list.appendChild(item);
    });
    this.shadowRoot.querySelector('.dialog')!.setAttribute('style', 'display: block;');
  }

  hide(): void {
    this.shadowRoot.querySelector('.dialog')!.setAttribute('style', 'display: none;');
  }

  selectItem(tabIndex: number): void {
    const list = this.shadowRoot.querySelector('ul')!;
    Array.from(list.children).forEach((item, index) => {
      if (index === tabIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    this.selectedTabIndex = tabIndex;
  }


  onItemSelected(listener: EventHandler<TabData>): void {
    this.itemSelectedEmitter.addListener(listener);
  }

  onItemDeleted(listener: EventHandler<TabData>): void {
    this.itemDeletedEmitter.addListener(listener);
  }

  removeItem(tabIndex: number): void {
    this.tabs.splice(tabIndex, 1);
    this.show(this.tabs);
  }
}
