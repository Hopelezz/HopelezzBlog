// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"The Martian by Andy Weir","publishDate":"14 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"A space expedition goes horribly wrong...","img":"https://covers.openlibrary.org/b/id/11446888-L.jpg","tags":"Sci-fi, Comedy, Charming, Is-A-Movie"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/7-the-martian.md";
						const url = "/book/7-the-martian";
						function rawContent() {
							return "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy, Charming, Is-A-Movie_\r\n\r\nA space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?\r\n\r\nThe story advances through update logs in a unique and comical way through Watney's optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.\r\n\r\n>I guess you could call it a failure, but I prefer the term learning experience.\r\n\r\nHe has this witty and charming personality that’s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it’s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that’s been begging to be told for centuries.\r\n\r\nSide note: For those who’ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.k; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
