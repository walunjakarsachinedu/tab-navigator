import { TabNavigatorOverlayI } from "../interface/tab-navigator-overlay";
import { TabData } from "../types/types";
import { EventEmitter, EventHandler } from "../util/event-emitter";
import dialogStyle from '../styles/dialog.css';

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
    style.textContent = dialogStyle;
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
  
      if (target.matches('LI, .li-item-title, .favicon, .subtitle')) {
        let liElement: HTMLElement = target.tagName === 'LI' ? target : target.closest('LI') as HTMLElement;
  
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
          this.itemDeletedEmitter.emit(this.tabs[index]);
          this.removeItem(index);
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
  
  
  show(tabs: TabData[], _selectedTabIndex: number = 0): void {
    this.tabs = tabs;
    this.selectedTabIndex = _selectedTabIndex;
    const list = this.shadowRoot.querySelector('ul')!;
    list.innerHTML = '';
    tabs.forEach((tab) => {
      const favIcon = document.createElement('img');
      favIcon.src = tab.favIconUrl;
      favIcon.classList.add('favicon');
      favIcon.style.width = '16px';
      favIcon.style.height = '16px';
      favIcon.style.marginRight = '16px';

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
      item.appendChild(favIcon);
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
    if(this.selectedTabIndex >= this.tabs.length) this.selectedTabIndex = this.tabs.length - 1; 
    this.show(this.tabs, this.selectedTabIndex);
    if(this.tabs.length > 0) this.selectItem(this.selectedTabIndex);
  }
}
