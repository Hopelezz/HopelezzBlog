//@ts-check
import { createSignal, createMemo, For, Show } from "solid-js";

//Inside the posts we are looking at the frontmatter object for Title, Description, Tags, and URL
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

//an export default function called Search that uses the createSignal and createMemo functions to create a search bar. This will filter the posts by using Title, Description, or Tags. The search bar is a input field that takes in a string and returns a list of posts using the PostPreview component that match the search string.
export default function Search({ posts }: Props) {
  const [search, setSearch] = createSignal("");
  const filteredPosts = createMemo(() => {
    const searchString = search.toString().toLowerCase();

    //turns the tags string into an array of lowercase strings separated by commas
    const tags = searchString.split(",").map(tag => tag.trim().toLowerCase());
    
    //filters the posts by title, description, or tags
    return posts.filter(post => {
      return (
        post.frontmatter.title.toLowerCase().includes(searchString) ||
        post.frontmatter.description.toLowerCase().includes(searchString) ||
        tags.some(tag => tag.includes(searchString))
      );
    });
  }, [posts, search]); //only re-run the filteredPosts function when the posts or search changes

  //return input and filter the existing posts on index page
  return (
    <div class="search">
      <p>
        Searching for something?
      </p>

      <input
        type="text"
        placeholder="Search"
        value={search}
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

//@ts-check
// Language: typescript
// Path: src\components\Search\Search.tsx
