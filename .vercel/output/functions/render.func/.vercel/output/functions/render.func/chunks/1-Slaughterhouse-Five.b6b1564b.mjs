// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Slaughterhouse-Five By Kurt Vonnegut","publishDate":"01 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"A 1969 semi-autobiographic science fiction-infused anti-war novel by Kurt Vonnegut.","img":"https://covers.openlibrary.org/b/id/7890961-L.jpg","tags":"American science fiction, bombing of Dresden, military fiction, war stories, World War II, World War, 1939-1945, literature and the war, war, free will and determinism, literary fiction, Fiction, Animals, Boats and boating, Juvenile fiction, Domestic animals, American fiction (fictional works by one author), Large type books, Fiction, general, Fiction, war & military, World war, 1939-1945, fiction, Classic Literature, Drama, Accessible book, Protected DAISY, In library, Vonnegut, kurt, 1922-2007, American literature, history and criticism, Destruction and pillage, Literature, American literature"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/1-Slaughterhouse-Five.md";
						const url = "/book/1-Slaughterhouse-Five";
						function rawContent() {
							return "\r\n# Rating : 9/10\r\n### _American Science Fiction, Military Fiction_\r\n\r\n\r\nI felt that the ending was abrupt and just fell off, but that's not the selling point of the story! I loved the wit and subtle humor that's sprinkled throughout the book. \r\n\r\n>\"and the Russians came and arrested everybody except for the two horses\"\r\n\r\n>\"This could be useful for Rocketry\"\r\n\r\nSo many fun nuggets of humor... but it's bittersweet when the next moment Vonnegut's talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he's the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes  \r\n\r\n>\"and then they just...die...So It Goes\"\r\n\r\nVonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.e; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
