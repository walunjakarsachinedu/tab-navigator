import { Match, TabData } from "../types/types";

function fuzzySearch(
  tabData: TabData[],
  searchTerm: string,
): (TabData & { match: Match })[] {
  return tabData
    .map<TabData & { match: Match }>((tab) => {
      const titleMatchIndices = _getMatchIndices(tab.title, searchTerm);
      const remainingSearchTerm = searchTerm.slice(titleMatchIndices.length);
      const urlMatchIndices = _getMatchIndices(tab.url, remainingSearchTerm);
      return {
        ...tab,
        match: {
          title: titleMatchIndices,
          url: urlMatchIndices,
          rank: _calculateRank({
            title: titleMatchIndices,
            url: urlMatchIndices,
          }),
        },
      };
    })
    .filter(
      (tab) =>
        tab.match.title.length + tab.match.url.length == searchTerm.length,
    )
    .filter((tab) => tab.match.rank != 0)
    .sort((a, b) => b.match.rank - a.match.rank);
}

function _getMatchIndices(text: string, search: string): number[] {
  const matchIndices: number[] = [];
  let searchIndex = 0;

  for (let i = 0; i < text.length && searchIndex < search.length; i++) {
    if (text[i].toLowerCase() === search[searchIndex].toLowerCase()) {
      matchIndices.push(i);
      searchIndex++;
    }
  }
  return matchIndices;
}

function _calculateRank(match: { title: number[]; url: number[] }): number {
  const titleScore =
    match.title.length > 0
      ? 1 / (match.title[0] + 1) +
        match.title.length +
        _closenessScore(match.title)
      : 0;
  const urlScore =
    match.url.length > 0
      ? 1 / (match.url[0] + 1) + match.url.length + _closenessScore(match.url)
      : 0;
  return titleScore + urlScore;
}

function _closenessScore(indices: number[]): number {
  let score = 0;
  for (let i = 1; i < indices.length; i++) {
    score += 1 / (indices[i] - indices[i - 1]);
  }
  return score;
}

export { fuzzySearch };
