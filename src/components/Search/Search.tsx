import { createSignal, createMemo } from "solid-js";

interface Props {
  posts: Array<{
          title: string,
          url: string,
  }>;
}

export default function Search(props: Props) {
  const [query, setQuery] = createSignal("");

  const lowCaseQuery = createMemo(() => props.posts.map(({title, url}) => 
      ({
        title: title?.toLowerCase(),
        url
      })
    )
  );
  
  const filteredPost = createMemo(() => lowCaseQuery().filter(post => post.title?.includes(query().toLowerCase())));
  
  return <div>
    <input 
      type='text' 
      placeholder='Search...'
      onInput={(e) => setQuery(e.target.value)} 
    />
    <Show when={query()}>
      <div class="results">
        <For each={filteredPost()}>
          {(el, i) => <div>{el.title}</div>}
        </For>
      </div>
    </Show>      
  </div>
}

