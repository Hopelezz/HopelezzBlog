// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Old Man's War by John Scalzi","publishDate":"2 MAR 2019","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"Hitchhickers guide to the Galaxy meets Stormship troopers!","img":"https://covers.openlibrary.org/b/id/3365280-L.jpg","tags":"Sci-fi, Comedy, Charming, Is-A-Movie"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/8-old-mans-war.md";
						const url = "/book/8-old-mans-war";
						function rawContent() {
							return "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy_\r\n\r\nHitchhickers guide to the Galaxy meets Stormship troopers! Old Man's War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I've come across in a while.\r\n\r\nPremise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.j; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
