// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Lord of the Flies by William Golding","publishDate":"8 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":null,"img":"https://covers.openlibrary.org/b/id/12723924-L.jpg","tags":"Sci-fi, Comedy, Charming, Is-A-Movie"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/5-lord-of-the-flies.md";
						const url = "/book/5-lord-of-the-flies";
						function rawContent() {
							return "\r\n# Rating : 9/10\r\n### _Classic, Fiction, Dystopian, Adventure_\r\n\r\nAt the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn’t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves. \r\n\r\n>\"He who holds the Conch shell has the authority to speak!\"\r\n\r\nSo is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn't take long before all hell breaks loose amongst the children and their baser instincts start to take hold.\r\n\r\n>“Maybe there is a beast… Maybe it’s only us.”\r\n\r\nGolding’s writing conveys blood lust, panic, and chaos unlike any author I’ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.f; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
