import "../../styles/frontPage.css";

export default function PostPreview({ post }){
    <article class="post-preview">
        <header>
            <p class="publish-date">{post.frontmatter.publishDate}</p>
            <a href={post.url}><h1 id="title">{post.frontmatter.title}</h1></a>
            <img src={post.frontmatter.img} />
        </header>
        <p>{post.frontmatter.description}</p>
        <a href={post.url}>Read more</a>
    </article>
}


