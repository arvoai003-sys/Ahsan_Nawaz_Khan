// @asset ENG01CH02SIGNSREAD
// @version v-01
// @title Read-along Signs
// @engine read-along
/* A2 · Read-along: Signs · Reading and Comprehension > Signs(Reading and Comprehension) · O1, O2

   Book, verbatim: p.28 2B Non-fiction Reading, the four sentences in order,
   with the book's bold words ("Signs" in the first sentence, "not" in the last),
   and the page's Glossary box: "signs writing or pictures that tell or show
   people something." (shown with a colon after "signs" so it reads aloud).
   The cover word "Signs" and the Word Hunt words are ours; everything read is
   the book's. Recognition only: no score, stars just for finishing. */
(function () {
  var CONTENT = {
    pages: [
      { cover: true, art: ["stop", "exit", "slow"], text: "Signs" },
      { art: ["entrance"], text: "Signs show us where to go in.", bold: ["signs"], hunt: "go" },
      { art: ["washsign", "tap", "soap"], text: "Signs tell us what to do.", hunt: "do" },
      { art: ["bookslabel", "toyslabel"], text: "In the classroom, signs help us to find things.", hunt: "find" },
      { art: ["danger"], text: "Signs tell us where we must not go.", bold: ["not"], hunt: "not" },
      { art: ["sign", "washsign", "exit"], text: "signs: writing or pictures that tell or show people something.", bold: ["signs"], glossaryPage: true }
    ],
    glossary: { word: "signs", meaning: "writing or pictures that tell or show people something." },
    levels: [
      { name: "Read to Me", art: "storybook", ribbon: "Book", mode: "listen", bannerSay: "Read to me! Listen and look at the words." },
      { name: "Read by Myself", art: "book", ribbon: "Book", mode: "self", bannerSay: "Read by myself! Tap a word to hear it." },
      { name: "Word Hunt", art: "reallife", ribbon: "Book", mode: "hunt", bannerSay: "Word hunt! Find the word on each page." }
    ]
  };

  ReadAlong.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SIGNSREAD",
    version: "v-01",
    title: "Read-along: Signs",
    intro: "Let's read about signs!",
    theme: "library",
    buddy: "kid",
    heroArt: "storybook",
    levels: CONTENT.levels,
    start: ReadAlong.start,
    resume: ReadAlong.resume,
    score: function () { return 0; },
    max: ReadAlong.max
  });
})();
