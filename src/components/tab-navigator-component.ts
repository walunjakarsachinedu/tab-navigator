import { TabNavigatorOverlayI } from "../interface/tab-navigator-overlay";
import { Match, TabData } from "../types/types";
import { EventEmitter, EventHandler } from "../util/event-emitter";
import dialogStyle from '../styles/dialog.css';
import { fuzzySearch } from "../util/fuzzy-search";

export class TabNavigatorOverlay implements TabNavigatorOverlayI {
  public tabs: TabData[] = [];
  private _container: HTMLElement;
  private _shadowRoot: ShadowRoot;
  private _selectedTabIndex: number = 0;
  private _itemSelectedEmitter: EventEmitter<TabData> = new EventEmitter();
  private _itemDeletedEmitter: EventEmitter<TabData> = new EventEmitter();
  private searchBar!: HTMLInputElement;
  private _onItemHighlighted: EventEmitter<TabData> = new EventEmitter();

  constructor() {
    this._container = document.createElement('div');
    this._shadowRoot = this._container.attachShadow({ mode: 'open' });

    this._initializeStyles();
    this._initializeUI();
  }

  private _initializeStyles() {
    const style = document.createElement('style');
    style.textContent = dialogStyle;
    this._shadowRoot.appendChild(style);
  }

  private _initializeUI() {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');

    // Create and append the search bar
    this.searchBar = document.createElement('input');
    this.searchBar.classList.add('search-bar');
    this.searchBar.type = 'text';
    this.searchBar.placeholder = 'Search tabs';
    this.searchBar.addEventListener('input', () => {
      this.setFilteredTabs();
      this.show()
    });
    dialog.appendChild(this.searchBar);

    const list = document.createElement('ul');
    dialog.appendChild(list);
  
    this._shadowRoot.appendChild(dialog);
    document.body.appendChild(this._container);
  
    this._addEventHandler(list, dialog);
  }

  private _addEventHandler(list: HTMLUListElement, dialog: HTMLDivElement) {
    // Add event listener for list item clicks
    list.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
  
      if (target.matches('LI, .li-item-title, .favicon, .subtitle')) {
        let liElement: HTMLElement = target.tagName === 'LI' ? target : target.closest('LI') as HTMLElement;
  
        const index = Array.from(list.children).indexOf(liElement);
        if (index !== -1) {
          this.selectItem(index);
          this._itemSelectedEmitter.emit(this.filteredTabs[index]);
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
          this._itemDeletedEmitter.emit(this.filteredTabs[index]);
          this.removeItem(index);
        }
      }
    });
  
    document.addEventListener('keydown', (event) => {
      if (dialog.style.display === 'block') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          if (this._selectedTabIndex !== null) {
            this.selectItem((this._selectedTabIndex + (event.key === 'ArrowUp' ? -1 : 1) + this.filteredTabs.length) % this.filteredTabs.length);
          }
        } else if (event.key === 'Enter' && this._selectedTabIndex !== null) {
          this._itemSelectedEmitter.emit(this.filteredTabs[this._selectedTabIndex]);
        }
      }
    });
  }
  
  showSearchBar() {
    this.searchBar.style.display = 'block';
    this.searchBar.value = '';
    this.searchBar.focus();
    this.show();
  }

  hideSearchBar() {
    this.searchBar.style.display = 'none';
    this.show();
  }

  get element() {
    return this._container;
  }

  setFilteredTabs() {
    const filterText = this.searchBar.value.toLowerCase();
    this.filteredTabs = filterText=='' ? this.tabs : fuzzySearch(this.tabs, filterText);
  }

  filteredTabs: (TabData & { match?: Match })[] = [];
  
  show(tabs?: TabData[], _selectedTabIndex: number = 0): void {
    if(tabs) {
      this.tabs = tabs;
      this.setFilteredTabs();
    }
    this._selectedTabIndex = _selectedTabIndex;

    const list = this._shadowRoot.querySelector('ul')!;


    list.innerHTML = '';
    this.filteredTabs.forEach((tab) => {
      const item = this._createTabUiItem(tab);
      list.appendChild(item);
    });
    this._shadowRoot.querySelector('.dialog')!.setAttribute('style', 'display: block;');
    this.selectItem(_selectedTabIndex);
  }

  hide(): void {
    this._shadowRoot.querySelector('.dialog')!.setAttribute('style', 'display: none;');
  }

  private _createTabUiItem(tab: TabData & { match?: Match }) {
    const favIcon = document.createElement('img');
    favIcon.src = tab.favIconUrl;
    favIcon.classList.add('favicon');
    favIcon.style.width = '16px';
    favIcon.style.height = '16px';
    favIcon.style.marginRight = '16px';

    const title = document.createElement('div');
    title.classList.add("text-truncate", "li-item-title")
    if (tab.match && tab.match.title) {
      title.innerHTML = this._highlightText(tab.title, tab.match.title);
    } else {
      title.textContent = tab.title;
    }

    const subtitle = document.createElement('div');
    if (tab.match && tab.match.url) {
      subtitle.innerHTML = this._highlightText(tab.url, tab.match.url);
    } else {
      subtitle.textContent = tab.url;
    }
    subtitle.classList.add("text-truncate", "subtitle", "pl-2");
    title.appendChild(subtitle);

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '&#x2715;'; // Unicode character for "✕"
    removeButton.classList.add('remove-button');

    const item = document.createElement('li');
    item.appendChild(favIcon);
    item.appendChild(title);
    item.appendChild(removeButton);

    return item;
  }

  private _highlightText(text: string, matchIndices: number[]): string {
    if (!matchIndices || matchIndices.length === 0) {
      return text;
    }
  
    let highlightedText = '';
    let currentIndex = 0;
    
    matchIndices.forEach(index => {
      highlightedText += text.slice(currentIndex, index) + '<span class="highlight">' + text[index] + '</span>';
      currentIndex = index + 1;
    });
  
    highlightedText += text.slice(currentIndex);
    return highlightedText;
  }

  selectItem(tabIndex: number): void {
    const list = this._shadowRoot.querySelector('ul')!;
    Array.from(list.children).forEach((item, index) => {
      if (index === tabIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    this._selectedTabIndex = tabIndex;
    this._onItemHighlighted.emit(this.filteredTabs[tabIndex]);
  }

  selectNextItem(): void {
    this._selectedTabIndex = (this._selectedTabIndex + 1) % this.filteredTabs.length;
    this.selectItem(this._selectedTabIndex);
  }
  
  selectPreviousItem(): void {
    this._selectedTabIndex = (this._selectedTabIndex - 1 + this.filteredTabs.length) % this.filteredTabs.length;
    this.selectItem(this._selectedTabIndex);
  }


  onItemSelected(listener: EventHandler<TabData>): void {
    this._itemSelectedEmitter.addListener(listener);
  }

  onItemDeleted(listener: EventHandler<TabData>): void {
    this._itemDeletedEmitter.addListener(listener);
  }

  onItemHighlighted(listener: EventHandler<TabData>): void {
    this._onItemHighlighted.addListener(listener);
  }

  removeItem(tabIndex: number): void {
    this.tabs.splice(tabIndex, 1);
    this.setFilteredTabs();
    if(this._selectedTabIndex >= this.filteredTabs.length) this._selectedTabIndex = this.filteredTabs.length - 1; 
    this.show(this.filteredTabs, this._selectedTabIndex);
    if(this.filteredTabs.length > 0) this.selectItem(this._selectedTabIndex);
  }
}
