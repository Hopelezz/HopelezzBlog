// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Auth from '../../components/Author.astro'\n","title":"Communist Manifesto by Karl Marx","publishDate":"18 JUL 2022","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":null,"img":"https://images-na.ssl-images-amazon.com/images/I/51vHCno0a4L._SX330_BO1,204,203,200_.jpg","tags":"Politics, Dystopic, World View, Communist,"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/11-communist-manifesto.md";
						const url = "/book/11-communist-manifesto";
						function rawContent() {
							return "\r\n# Rating : 3/10\r\n### _Politics, Dystopic, World View, Communist_\r\n\r\n> **Disclaimer:** If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating. \r\n> <br/>\r\n> Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you'd be tainted. \r\n> <br/>\r\n> I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n> \"We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\"\r\n\r\nI came to this book out of sheer interest for Dystopics and those interests started with a book called \"Brave New World\" back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision. \r\n\r\n## The Book\r\n\r\nThe Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.\r\n\r\nI was discussing this with my friend after having read the book. He said:\r\n> \"Communism is a concept that isn't inherant in humans, one that has to be forced.\"\r\n\r\n";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.d; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
