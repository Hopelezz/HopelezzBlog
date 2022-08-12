// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Slapstick by Kurt Vonnegut","publishDate":"12 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"Depicts Vonnegut's views of loneliness, both on an individual and social scale.","img":"https://covers.openlibrary.org/b/id/6632174-L.jpg","tags":"Presidents, Fiction, American fiction"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/6-slapstick.md";
						const url = "/book/6-slapstick";
						function rawContent() {
							return "\r\n# Rating : 10/10\r\n### _Fiction, American, Autobiographical_\r\n\r\n>\"This is the closest I will ever come to writing an autobiography. I have called it \"Slapstick\" because it is grotesque, situational poetry -- like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\"\r\n\r\nYou see, Kurt's sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident. \r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction… No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can’t put down. Strap in you’re going for a ride!\r\n\r\nWilbur and Eliza Swain are twins. At birth the parents were told they wouldn’t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly: \r\n\r\n>“I felt as though my head were turning to wood” or “my skull was filling up with maple syrup”\r\n\r\nA bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who’s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered “useless: without her brother, but that’s far from reality. \r\n\r\nThis mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There’s tiny China men `No. Seriously. “Tiny” China men`, a mysterious “green death” disease that’s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it’s absurd, yet with the way Kurt portrays his story you can’t help, but be wonder struck and amazed by the tale.\r\n\r\n>“Hi ho.”";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.m; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
