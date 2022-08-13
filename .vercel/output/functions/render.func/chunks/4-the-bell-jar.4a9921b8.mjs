// Static
						const frontmatter = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"The Bell Jar by Sylvia Plath","publishDate":"05 Oct 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"A semi-autobiographical with the names of places and people changed. The book is","img":"https://covers.openlibrary.org/b/id/8457807-L.jpg","tags":"women college students, summer, Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health, American, Adult, Fiction, Mental Depression, Suicidal behavior, Mentally ill, Psychiatric hospital patients, Mental illness, Women authors, Treatment, Women periodical editors, College students, Suicide, Psychological fiction, Autobiographical fiction, Roman à clef, open_syllabus_project, Women psychotherapy patients, Fiction, psychological, American fiction (fictional works by one author), Young women, fiction, Students, fiction, Children's fiction, Depression, mental, fiction, Fiction, biographical, Fiction, general, New york (n.y.), fiction, Large type books, American literature"};
						const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/4-the-bell-jar.md";
						const url = "/book/4-the-bell-jar";
						function rawContent() {
							return "\r\n# Rating : 8/10\r\n### _Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health_\r\n\r\n_This book could be a trigger for those who deal with <u>suicidal tendencies</u>._\r\n\r\nReading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.\r\n\r\n>“It was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn’t know what I was doing in New York.”\r\n\r\nAnd thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong. \r\n\r\nI would love to tell you about different details about the book past this point, but I can’t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.\r\n\r\nOr in Esther’s own words:\r\n>“I felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.”\r\n\r\nI’ve come to the conclusion I’m not fond much of teen angst because it only translates to me as \"snooty\". Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you’re deciding on which book to read next!";
						}
						async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}
						function $$loadMetadata() {
							return load().then((m) => m.$$metadata);
						}
						
						// Deferred
						async function load() {
							return (await import('../entry.js').then(function (n) { return n.i; }));
						}
						function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						function getHeaders() {
							return load().then((m) => m.metadata.headers);
						}

export { $$loadMetadata, Content, compiledContent, load as default, file, frontmatter, getHeaders, rawContent, url };