// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Supermarket by Bobby Hall","publishDate":"23 NOV 2019","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":null,"img":"https://covers.openlibrary.org/b/isbn/9781982127138-L.jpg","tags":"Fiction, psychological, Fiction, suspense"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/9-supermarket.md";
						const url = "/book/9-supermarket";
						function rawContent() {
							return "\r\n# Rating : 7/10\r\n### _Fiction, Psychological, Suspense_\r\n\r\nThe book starts off with a narrative that's compelling. It'll suck you in, but right after it shifts drastically to some boring guys' (Flynn) life. He's an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel. \r\n\r\nIt's very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they're all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets. \r\n\r\nFor the most part, it's a solid book for a new author.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.l; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
