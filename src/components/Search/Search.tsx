//@ts-check
import { createSignal, createMemo } from "solid-js";
import PostPreview from '../../components/Blog/PostPreview.astro';

//Inside the posts we are looking at the frontmatter object for Title, Description, Tags, and URL
//Note: tags is a string separated by commas.
interface Props {
  posts: Array<{
      frontmatter: {
        title: string;
        description: string;
        tags: string;
        url: string;
      }
  }>;
}

//an export default function called Search that uses the createSignal and createMemo functions to create a search bar. This will filter the posts by using Title, Description, or Tags. The search bar is a input field that takes in a string and returns a list of posts using the PostPreview component that match the search string.
export default function Search({ posts }: Props) {
  const [search, setSearch] = createSignal("");
  const filteredPosts = createMemo(() => {
    const searchString = search.toString().toLowerCase();

    if (!searchString) {
      return posts;
    }
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

  return (
    <div className="search-container">
      <div>Searching for something?</div>
      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
      <div className="search-results">
        {filteredPosts().map((post) => <PostPreview post={post} />
        )}
      </div>
    </div>
  );
}

//@ts-check
// Language: typescript
// Path: src\components\Search\Search.tsx
