/** @jsxImportSource solid-js */
import { createSignal, For, Show } from "solid-js";
import '../../styles/search.css'



interface Props {
  posts: Array<{
        title: string;
        author: string;
        writer: string;
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
    console.log(value);
    const fPosts = props.posts.filter(post => { //filter the posts
      const { title, description, tags, author } = post;  //get the frontmatter of the post
      return (
        title?.toLowerCase().includes(value) ||
        description?.toLowerCase().includes(value) ||
        author?.toLowerCase().includes(value) ||
        tags?.toLowerCase().includes(value)
      )
    }); //slice the array to the first 10

    setFilteredPosts(fPosts).slice(0.10);  //set the filtered posts signal to the filtered posts
  }

  return (
    <div class="searchContainer">
      <div class="search-input">
        <input
          type="text"
          placeholder="&lt;Search... &#47;&gt;"
          onInput={handleInput}
          value={search()}
          class="surface3 searchBar"
        />
        <i class="icon fas fa-search"></i>
      </div>

      <Show when={search()}>
        <div class="resultContainer">
          <ul role="list">
            <For each={filteredPosts()} fallback={<li class="surface4 searchResult">No results found</li>}>
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