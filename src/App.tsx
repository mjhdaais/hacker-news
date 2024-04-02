import { useState, useEffect, useReducer } from 'react';

const initialStories = [ 
    { 
      title: 'React', 
      url: 'https://reactjs.org/', 
      author: 'Jordan Walke', 
      num_comments: 3, 
      points: 4, 
      objectID: 0,
    }, 
    { 
      title: 'Redux', 
      url: 'https://redux.js.org/', 
      author: 'Dan Abramov, Andrew Clark', 
      num_comments: 2, 
      points: 5, 
      objectID: 1, 
    }, 
  ];
  
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
  
const storiesReducer = (state, action) => { 
  switch (action.type) { 
    case 'STORIES_FETCH_INIT': 
      return { 
        ...state, isLoading: true, 
        isError: false, 
      }; 
    case 'STORIES_FETCH_SUCCESS': 
      return { 
        ...state, isLoading: false, 
        isError: false, 
        data: action.payload, 
      }; 
    case 'STORIES_FETCH_FAILURE': 
      return { 
        ...state, isLoading: false, 
        isError: true, 
      }; 
    case 'REMOVE_STORY': 
      return { 
        ...state, data: state.data.filter( 
          (story) => action.payload.objectID !== story.objectID 
        ), 
    }; 
    default: throw new Error(); 
    } 
};
  
const getAsyncStories = () => 
  new Promise((resolve) => 
    setTimeout( 
      () => resolve(
        { data: { stories: initialStories } }
      ), 2000 ) 
    );

const useSemiPersistentState = (key, initialState) => { 
  const [value, setValue] = useState( localStorage.getItem(key) || initialState ); 
  
    useEffect(() => { 
      localStorage.setItem(key, value); 
    }, [value, key]); 
    
    return [value, setValue]; 
};

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState( 'search', 'React' );
  
  const [url, setUrl] = useState( `${API_ENDPOINT}${searchTerm}`
  );
  
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [isError, setIsError] = useState(false);
    
  useEffect(() => { 
    localStorage.setItem('search', searchTerm); 
  }, [searchTerm]);
  
  const handleFetchStories = useCallback(() => {
  if (!searchTerm) return;
  
  dispatchStories({ type: 'STORIES_FETCH_INIT' });
  
  fetch(url)
    .then(response => response.json())
    .then(result => dispatchStories({ type: 'STORIES_FETCH_SUCCESS', payload: result.hits }))
    .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));
}, [url]);

useEffect(() => {
  handleFetchStories();
}, [handleFetchStories]);

  
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value); 
  };
  
  const handleSearchSubmit = () => { 
    setUrl(`${API_ENDPOINT}${searchTerm}`); 
  };
  
  const searchedStories = stories.data.filter(
    (story) => story.title.toLowerCase().includes(searchTerm.toLowerCase()) 
  );
  
  const handleRemoveStory = (item) => { 
    dispatchStories({ 
      type: 'REMOVE_STORY', 
      payload: item, 
    });
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel 
        id="search" 
        label="Search" 
        value={searchTerm} 
        onInputChange={handleSearchInput}
      >
        <strong>Search:</strong> 
      </InputWithLabel>
      
      <button 
        type="button" 
        disabled={!searchTerm} 
        onClick={handleSearchSubmit} 
      > Submit </button>
      
      <hr />
      
      {stories.isError && <p>Something went wrong ...</p>} 
      {stories.isLoading ? (
        <p>Loading ...</p> 
      ) : ( 
        <List 
          list={stories.data} 
          onRemoveItem={handleRemoveStory} 
        /> 
      )}
    </div>
  );
}

const List = ({ list, onRemoveItem }) => (
  <ul> 
    {list.map((item) => ( 
      <Item 
        key={item.objectID} 
        item={item} 
        onRemoveItem={onRemoveItem}
      />
    ))}
  </ul> 
)

const Item = ({ item, onRemoveItem }) => { 
  return (
    <li> 
      <span> 
        <a href={item.url}>{item.title}</a>
      </span> 
      <span>{item.author}</span> 
      <span>{item.num_comments}</span> 
      <span>{item.points}</span> 
      <span> 
        <button 
          type="button" 
          onClick={() => onRemoveItem(item)}
        > Dismiss </button> 
        </span>
    </li> 
);
}

const InputWithLabel = ({ 
  id, 
  value, 
  type = 'text', 
  onInputChange, 
  children
}) => ( 
  <> 
    <label htmlFor={id}>{children}</label> 
    &nbsp; 
    <input 
      id={id} 
      type={type} 
      value={value} 
      autoFocus
      onChange={onInputChange} 
    /> 
  </> 
  );

export default App;
