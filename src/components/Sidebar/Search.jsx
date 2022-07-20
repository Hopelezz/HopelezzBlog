import { createSignal } from "solid-js";

import PostPreview from '../Search/PostPreview.jsx';



export default function Search(props) {

  const [results, setResults] = createSignal(props.allPosts);

  function handleInput(event) {
      const searchString = event.target.value.toLowerCase();
      const filteredPosts = props.allPosts.filter((post) => {
        
        return (
                post.frontmatter.title?.toLowerCase().includes(searchString) ||
                post.frontmatter.description?.toLowerCase().includes(searchString) ||
                post.frontmatter.tags?.split(",").some((tag) => tag.toLowerCase().includes(searchString))
            );
            
    });
      console.log(filteredPosts.map((post) => post.frontmatter.tags));
      setResults(filteredPosts);
  }

  return (
    <div>
      <input 
            type='text' 
            name='searchBar' 
            id='searchBar' 
            placeholder='Search...'
            onInput={handleInput}></input>
        <div>
            <For each={results()}>{(p) => (
               <PostPreview post={p}/>
            )}</For>
        </div>
    </div>
  );
}