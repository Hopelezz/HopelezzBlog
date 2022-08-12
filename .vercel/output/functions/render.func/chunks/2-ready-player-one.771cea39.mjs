// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Ready Player One by Ernest Cline","publishDate":"02 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game","img":"https://covers.openlibrary.org/b/id/8750149-L.jpg","tags":"cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.md";
						const url = "/book/2-ready-player-one";
						function rawContent() {
							return "\r\n# Rating : 9/10\r\n\r\n### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r\n\r\n\r\nI was hooked from the moment I started the book. Barely putting it down!\r\n\r\n>\"Going outside is highly overrated\"\r\n\r\nReady Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r\nJust to give you an idea.\r\n\r\n##### Movies: \r\n\r\n- Montey Python\r\n- Blade Runner\r\n- Ghost Busters\r\n- Back to the Future\r\n- Ferris Buller's Day Off\r\n- Weird Science\r\n- WarGames\r\n- Pretty in Pink\r\n- Breakfast Club\r\n\r\n##### Books: (All Amazing Authors!)\r\n- Vonnegut\r\n- Orson Scott Card\r\n- Stephen King\r\n- Terry Pratchett\r\n- J.R.R. Tolkien\r\n- Douglas Adams\r\n\r\n##### Music: \r\n\r\n- SchoolHouse Rock\r\n- Pat Benatar\r\n- They Might Be Giants\r\n- Rush\r\n\r\n##### TV Shows: \r\n- A-Team\r\n- Twilight Zone\r\n- Gundam\r\n- Spider-Man\r\n- Ultraman\r\n- Cowboy Bebop\r\n- Kikaida\r\n- Voltron\r\n- Max Headroom\r\n- Family Ties\r\n- Star Trek\r\n- Dr.Who\r\n- The Cosmos\r\n##### GAMES:\r\n- PacMan\r\n- Dig Dug\r\n- Joust\r\n- Black Tiger\r\n- Adventure\r\n- and many others\r\n\r\n>\"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness.\"";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.h; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };
