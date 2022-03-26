const baseURL = 'https://wr4a6p937i.execute-api.ap-northeast-2.amazonaws.com/dev/';
const input = document.querySelector('input.SearchInput__input');
const autocomplete = document.querySelector('.Suggestion');
const selectedLanguagesElement = document.querySelector('.SelectedLanguage');
const form = document.querySelector('.SearchInput');

const state = {
  selectedIndex: -1,
  keyword: window.localStorage.getItem('keyword') || null,
  languages: window.localStorage.getItem('languages') ? JSON.parse(window.localStorage.getItem('languages')) : [],
  selectedLanguages: window.localStorage.getItem('selected-languages') ? JSON.parse(window.localStorage.getItem('selected-languages')) : [],
};

const app = () => {
  let debounce = null;
  const initialize = (props = {}) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    input.focus();
    input.addEventListener('input', (e) => {
      const { value } = e.target;
      state.keyword = value;
      state.selectedIndex = -1;
      if (debounce) window.clearTimeout(debounce);
      window.localStorage.setItem('keyword', state.keyword);
      debounce = window.setTimeout(async () => {
        try {
          const languages = await getLanguages(value);
          window.localStorage.setItem('languages', JSON.stringify(languages));
          state.languages = languages || [];
          renderList();
        } catch (e) {
          state.languages = [];
          renderList();
        }
      }, 500);
    });
    autocomplete.querySelector('ul').addEventListener('click', (e) => {
      const { target } = e;
      const language = target.innerText;
      onClickListItem(language);
    });
    input.value = props.keyword;
    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowUp') setIndex(-1);
      if (e.code === 'ArrowDown') setIndex(1);
    });
    window.addEventListener('keyup', (e) => {
      e.preventDefault();
      const target = state.languages[state.selectedIndex];
      if (e.code === 'Enter') {
        state.selectedIndex = -1;
        if (target) onClickListItem(target);
      }
    });
    renderList();
    renderSelectedLanguages(props.selectedLanguages || []);
  };
  const renderSelectedLanguages = (languages = []) => {
    const html = [...languages].map((language) => `<li>${language}</li>`);
    selectedLanguagesElement.querySelector('ul').innerHTML = html.join('\n');
  };
  const setIndex = (step) => {
    const result = state.selectedIndex + step;
    if (result < 0) state.selectedIndex = state.languages.length - 1;
    else if (result >= state.languages.length) state.selectedIndex = 0;
    else state.selectedIndex = result;
    renderList();
  };
  const renderList = () => {
    const html = [...state.languages].map((language) => {
      const regex = new RegExp(`(${state.keyword})`, 'gmi');
      const data = language.replace(regex, '<span class="Suggestion__item--matched">$1</span>');
      const isSelectedLanguage = state.selectedLanguages.includes(language);
      if (isSelectedLanguage) return `<li class="Suggestion__item--selected">${data}</li>`;
      return `<li>${data}</li>`;
    });
    autocomplete.style.display = state.languages.length > 0 ? 'block' : 'none';
    autocomplete.querySelector('ul').innerHTML = html.join('\n');
    const selectedItem = autocomplete.querySelectorAll('ul li')[state.selectedIndex];
    if (selectedItem) selectedItem.classList.add('Suggestion__item--selected');
  };
  const getLanguages = async (keyword) => {
    try {
      const response = await fetch(`${baseURL}languages?keyword=${keyword}`);
      if (!response.ok) throw response;
      return response.json();
    } catch (e) {
      return [];
    }
  };
  const onClickListItem = (language) => {
    const index = state.selectedLanguages.indexOf(language);
    if (index > -1) state.selectedLanguages.splice(index, 1);
    if (state.selectedLanguages.length >= 5) state.selectedLanguages.splice(0, 1);
    state.selectedLanguages.push(language);
    state.selectedIndex = -1;
    renderSelectedLanguages(state.selectedLanguages);
    renderList();
    window.alert(language);
    window.localStorage.setItem('selected-languages', JSON.stringify(state.selectedLanguages));
  };
  initialize(state);
};

app();
