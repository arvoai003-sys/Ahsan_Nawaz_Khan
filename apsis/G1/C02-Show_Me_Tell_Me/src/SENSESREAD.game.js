// @asset ENG01CH02SENSESREAD
// @version v-01
// @title Read-along Our Senses
// @engine read-along
/* A13 · Read-along: Our Senses · Reading and Comprehension > Our Senses(Reading and Comprehension) · O8

   Book, verbatim: 2F Non-fiction Reading.
   - p.33 title "Our senses" and its five labels: see hear smell taste touch.
   - p.34 "We have five senses." and the five boxes, each with its heading:
     Sight: We see things with our eyes. We see light and colour.
     Hearing: We hear with our ears.   Smell: We smell with our nose.
     Taste: We taste with our tongue.  Touch: We touch and feel things with our hands.
   Word Hunt words are ours; everything read is the book's. Recognition only. */
(function () {
  var CONTENT = {
    pages: [
      { cover: true, art: ["eyes", "ears", "nose"], text: "Our senses" },
      { art: ["eyes", "ears", "nose", "tongue", "hand"], text: "see hear smell taste touch", hunt: "touch" },
      { art: ["eyes", "ears", "nose", "tongue", "hand"], text: "We have five senses.", hunt: "five" },
      { heading: "Sight", art: ["eyes", "sun", "ball"], text: "We see things with our eyes. We see light and colour.", hunt: "eyes" },
      { heading: "Hearing", art: ["ears", "bell", "drum"], text: "We hear with our ears.", hunt: "ears" },
      { heading: "Smell", art: ["nose", "flower"], text: "We smell with our nose.", hunt: "nose" },
      { heading: "Taste", art: ["tongue", "icecream", "mango"], text: "We taste with our tongue.", hunt: "tongue" },
      { heading: "Touch", art: ["hand", "pet"], text: "We touch and feel things with our hands.", hunt: "hands" }
    ],
    levels: [
      { name: "Read to Me", art: "storybook", ribbon: "Book", mode: "listen", bannerSay: "Read to me! Listen and look at the words." },
      { name: "Read by Myself", art: "book", ribbon: "Book", mode: "self", bannerSay: "Read by myself! Tap a word to hear it." },
      { name: "Word Hunt", art: "reallife", ribbon: "Book", mode: "hunt", bannerSay: "Word hunt! Find the word on each page." }
    ]
  };

  ReadAlong.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SENSESREAD",
    version: "v-01",
    title: "Read-along: Our Senses",
    intro: "Let's read about our senses!",
    theme: "balloons",
    buddy: "kid",
    heroArt: "ears",
    levels: CONTENT.levels,
    start: ReadAlong.start,
    resume: ReadAlong.resume,
    score: function () { return 0; },
    max: ReadAlong.max
  });
})();
