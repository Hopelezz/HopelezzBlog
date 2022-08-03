// Static
						const frontmatter = {"layout":"../../layouts/BlogPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Most Recent Post Button... A Start","publishDate":"16 JUL 2022","name":"Mark Spratt","href":"https://twitter.com/_Hopelezz","description":"A simple button, to navigate to the most recent post.","tags":"framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/4-most-recent-post-button.md";
						const url = "/blog/4-most-recent-post-button";
						function rawContent() {
							return "\r\n# The Concept\r\n\r\nSo I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.\r\n\r\n## How it works\r\n\r\nAs soon as you press the `Most Recent` button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the `publishDate` propert field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. \r\n\r\n```astro\r\n---\r\nlayout: ../../layouts/BlogPost.astro\r\nsetup: |\r\n  import Author from '../../components/Author.astro'\r\ntitle: Most Recent Post Button... A Start\r\npublishDate: 16 JUL 2022   <-- //This is the date of the post of this post. \r\nname: Mark Spratt\r\nhref: https://twitter.com/_Hopelezz\r\ndescription: A simple button, to navigate to the most recent post.\r\ntags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla\r\n---\r\n```\r\n\r\nThis `publishDate` field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community. \r\n\r\n```js\r\n  let allPosts = await Astro.glob('../pages/*.md');\r\n  // sorts the blog posts by publishedDate\r\n  allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());\r\n```\r\n\r\nI then use:\r\n```js\r\n  let mostRecentPost = allPosts[0];\r\n```\r\nTo get all the information about the most recent post. With this I can return the url route to the button.\r\n\r\nNow that I have a variable with just a single post object I can pass it's url property to the components `href` property. This will then link the button to the most recent post.\r\n\r\n```js\r\n<LeftSidebar mostRecentBlogPost={mostRecentBlogPost} />\r\n```\r\n\r\nI decided to name the href property `mostRecentPost` because inside the LeftSidebar component I have an anchor that will read:\r\n```html\r\n    <a href={mostRecentPost.url}>Most Recent Post</a>\r\n```\r\n\r\nmaking the href property more concise.\r\n\r\n> Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the `blogPosts` object.\r\n\r\n```js\r\n  import { getBlogPosts } from '../utils/api.astro';\r\n  const blogPosts = await getBlogPosts(blogPosts);\r\n```\r\n\r\n> This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it's using astro props to fetch the post routes.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n._; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
