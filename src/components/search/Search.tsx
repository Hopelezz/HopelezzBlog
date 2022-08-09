/** @jsxImportSource solid-js */
import { createSignal, For, Show } from "solid-js";
import { Post } from '../../utils/types';


interface Props { 
  posts: Array<{
        title: string;
        writter: string;
        description: string;
        tags: string;
        url: string;
  }>;
}


/**
 * The Search component is responsible for rendering the search bar and the
 * results of the search.
 * @param props search value
 * @returns a list of posts titles and links
 */
export default function Search(props: Props) {
   const [search, setSearch] = createSignal(""); //create a signal for the search input
  const [filteredPosts, setFilteredPosts] = createSignal(props.posts); //Initialize with all posts
  
  function handleInput(e: any) {
    const { value } = e.currentTarget;  //get the value of the input
    setSearch(value.toLowerCase()); //set the search signal to the value of the input
    
    const fPosts = props.posts.filter(post => { //filter the posts
      const { title, description, tags } = post;  //get the frontmatter of the post
      return (
        title?.toLowerCase().includes(value) ||
        description?.toLowerCase().includes(value) ||
        tags?.toLowerCase().includes(value)
      );
    });
    setFilteredPosts(fPosts);  //set the filtered posts signal to the filtered posts
  }

  return (
    <div class="searchContainer"> 
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        placeholder="Search..."
        onInput={handleInput}
        value={search()}
        class="searchBar"
      />

      <Show when={search()}>
        <ul class="listContainer">
          <For each={filteredPosts()} fallback={<div class="searchlist">No results found</div>}>
            {(post, i) => 
              <li class="searchlist">
                <a href={post.url}>{post.title}</a>
              </li>
            }
          </For>
        </ul>
      </Show>
    </div>
  );           
}