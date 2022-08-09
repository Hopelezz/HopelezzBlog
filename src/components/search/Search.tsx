/** @jsxImportSource solid-js */
import { createSignal, For, Show } from "solid-js";
import '../../styles/search.css'


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
    <div class="search-input">
      <input
        type="text"
        placeholder="Search..."
        onInput={handleInput}
        value={search()}
        class="searchBar"
      />
      <div class="autocom-box">
            <For each={props.posts}>
              {(post, i) => 
                <li class="searchResult">
                  {post.title}
                </li>
              }
            </For>
      </div>
      <div class="icon"><i class="fas fa-search"></i></div>
      </div>

      <Show when={search()}>
        <div class="searchResults">
          <ul role="list">
            <For each={filteredPosts()} fallback={<li>No results found</li>}>
              {(post, i) => 
                <li class="searchResult">
                  <a href={post.url}>{post.title}</a>
                </li>
              }
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );           
}