import { createSignal, createMemo } from "solid-js";

interface Props {
  posts: Array<{
          title: string,
          url: string,
  }>;
}

export default function Search(props: Props) {
  const [query, setQuery] = createSignal("");
  console.log(props.posts.frontmatter.title);
  const lowercased = createMemo(() => props.posts.map(({title, url}) => 
      ({
        title: title.toLowerCase(),
        url
      })
    )
  );
  
  const filtered = createMemo(() => lowercased().filter(post => 
    post.title.includes(query().toLowerCase())));
  
  return <div>
    <input 
      type='text' 
      placeholder='Search...'
      onInput={(e) => setQuery(e.target.value)} />
    <Show when={query()}>
      <div class="results">
        <For each={filtered()}>
          {(el, i) => <div>{el.name}</div>}
        </For>
      </div>
    </Show>      
  </div>
}

