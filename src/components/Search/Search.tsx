//@ts-check
/** @jsxImportSource solid-js */
import { createSignal, For, Show } from "solid-js";

//Inside the posts we are looking at the frontmatter object for Title, Description, Tags, and URL
//Note: tags is a string separated by commas.
interface Props { 
  posts: Array<{
      frontmatter: {
        title: string;
        publishDate: string;
        name: string;
        description: string;
        tags: string;
      }
      url: string;
  }>;
}

export default function Search(props: Props) {
  const [search, setSearch] = createSignal(""); //create a signal for the search input
  const [filteredPosts, setFilteredPosts] = createSignal(props.posts); //Initialize with all posts
  
  function handleInput(e: any) {
    const { value } = e.currentTarget;  //get the value of the input
    setSearch(value.toLowerCase()); //set the search signal to the value of the input
    
    const filteredPosts = props.posts.filter(post => {
      const { title, description, tags } = post.frontmatter;  //get the frontmatter of the post
      
      return (
        title?.toLowerCase().includes(value) ||
        description?.toLowerCase().includes(value) ||
        tags?.toLowerCase().includes(value)
      );
    });
    setFilteredPosts(filteredPosts);  //set the filtered posts signal to the filtered posts
  }

  return (
    <div class="searchContainer"> 
      <input
        type="text"
        placeholder="Search..."
        onInput={handleInput}
        value={search()}
        class="searchBar"
      />

      <Show when={search()}>
        <div class="listContainer">
          <For each={filteredPosts()} fallback={<div>No results found</div>}>
            {(post, i) => 
              <div class="searchlist" data-index={i() + 1}>
                <a href={post.url}>{post.frontmatter.title}</a>
              </div>              
            }
          </For>
        </div>
      </Show>
    </div>
  );           
}