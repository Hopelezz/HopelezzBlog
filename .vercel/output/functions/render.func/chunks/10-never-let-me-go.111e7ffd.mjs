// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Never Let Me Go by Kazuo Ishiguro","publishDate":"20 APR 2020","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":null,"img":"https://covers.openlibrary.org/b/id/6425427-L.jpg","tags":"dystopic, Melancholy, Fiction, Organ donors, Cloning, Donation of organs, tissues, Women, Literature, New York Times bestseller, Human cloning, Science fiction, psychological, science fiction, general, England, School, children, Reminiscing, Friendship, English literature"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/10-never-let-me-go.md";
						const url = "/book/10-never-let-me-go";
						function rawContent() {
							return "\r\n# Rating : 7/10\r\n### _Melancholy, Fiction, Dystopic_\r\n\r\nI went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.\r\n\r\nThe book starts off:\r\n\r\n>“There have been times over the years when I’ve tried to leave Hailsham behind when I’ve told myself I shouldn’t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.”\r\n\r\nCentered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.\r\n\r\nIn this retelling of Kathy's life, you get a sense of gloom and anxiety that pervades these children's lives even unbeknownst to them.";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.g; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
