//@ts-check
// Language: typescript
// Path: src\components\Search\Search.tsx
import { createSignal, createMemo, For, Show } from "solid-js";

//Inside the posts we are looking at the frontmatter object for Title, Description, and Tags. We will also need to return the URL
//Note: tags is a string separated by commas.
interface Props {
  posts: Array<{
      frontmatter: {
        title: string;
        publishDate: string;
        description: string;
        tags: string;
      }
      url: string;
  }>;
}

export default function Search({ posts }: Props) {
  //an export default function called Search that uses the createSignal and createMemo functions to create a search bar. This will filter the posts by using Title, Description, or Tags. The search bar is a input field that takes in a string and returns a list of posts using the PostPreview component that match the search string.
  const [search, setSearch] = createSignal("");
  const filteredPosts = createMemo(() => {
    //createMemo is a function that creates a memoized function. This will only run the filter function if the search string changes.
    const searchString = search.toString().toLowerCase();
    //filters the posts by title, description, or tags
    return posts.filter(post => {
      //turns the tags: string into an array of trimmed, lowercase, and split words
      const tags = post.frontmatter.tags.split(",");
      tags.forEach(tag => tag.trim().toLowerCase());
      console.log(tags);
      return (        
        post.frontmatter.title.toLowerCase().includes(searchString) ||
        post.frontmatter.description.toLowerCase().includes(searchString) ||
        tags.some(tag => tag.includes(searchString))
      );
    });
  }, [posts, search]); 

  //return the filtered results the existing posts on index page
  return (
    <div class="search">
      <br />
      <p>
        Searching for something?
      </p>

      <input
        type="text"
        placeholder="Search"
        value={search()}
        onChange={e => setSearch(e.target.value)}
      />

      <Show when={search()}>
          <For each={filteredPosts()}>
            {post => <a href={post.url}><div> {post.frontmatter.title}
              </div></a>}
          </For>
      </Show>
    </div>
  );
}

