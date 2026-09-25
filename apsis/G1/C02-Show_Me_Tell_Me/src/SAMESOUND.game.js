// @asset ENG01CH02SAMESOUND
// @version v-01
// @title Same First Sound
// @engine tap-identify
/* A6 · Same First Sound · Phonics and Spelling > Sounds at the Start of Word · O4
   Source: book p.31, 2D A (verbatim word box): book stop exit staff hand sign.
   Answer set: stop, staff, sign. Words only are spoken (no isolated /s/: TTS
   cannot say a single sound). Round 3 is the book task as printed (six words),
   the one screen allowed more than three cards. */
(function () {
  var W = {
    book: { text: "book", art: "book" },
    stop: { text: "stop", art: "stop" },
    exit: { text: "exit", art: "exit" },
    staff: { text: "staff", art: "staff" },
    hand: { text: "hand", art: "hand" },
    sign: { text: "sign", art: "sign" }
  };
  function same(target, a, b, c, answer) {
    return {
      text: "Which word starts like <b>" + target + "</b>?",
      say: "Which word starts with the same sound as " + target + "?",
      target: W[target],
      options: [W[a], W[b], W[c]],
      answer: [answer],
      hint2: "Listen. " + target + ". " + target + "."
    };
  }
  function two(a, b, c, answers) {
    return {
      text: "Two words start the same. Tap them both.",
      say: "Two words start with the same sound. Tap them both.",
      options: [W[a], W[b], W[c]],
      answer: answers
    };
  }

  var CONTENT = {
    rounds: [
      {
        banner: "Round 1", bannerSay: "Round one. Find the word that starts the same.",
        markFirst: true,
        items: [
          same("stop", "staff", "book", "hand", "staff"),
          same("sign", "exit", "stop", "hand", "stop"),
          same("staff", "book", "sign", "exit", "sign")
        ]
      },
      {
        banner: "Round 2", bannerSay: "Round two. Find two words that start the same.",
        markFirst: true,
        items: [
          two("stop", "hand", "sign", ["stop", "sign"]),
          two("book", "staff", "stop", ["staff", "stop"]),
          two("exit", "sign", "staff", ["sign", "staff"])
        ]
      },
      {
        banner: "Book challenge", bannerSay: "Book challenge! Find three words that start with the same sound.",
        markFirst: true,
        items: [
          {
            text: "Find three words that start with the same sound.",
            say: "Read the words. Find three words that start with the same sound.",
            options: [W.book, W.stop, W.exit, W.staff, W.hand, W.sign],
            answer: ["stop", "staff", "sign"]
          }
        ]
      }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SAMESOUND",
    version: "v-01",
    title: "Same First Sound",
    kicker: "Grade 1 · English · Chapter 2",
    sub: "Find words that start the same.",
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: 7
  });
})();
