const expectedPaths = {
  "level-1": [
    { row: 3, col: 2, trackType: "ho" },
    { row: 3, col: 3, trackType: "ho" },
    { row: 3, col: 4, trackType: "ho" },
  ],

  "level-2": [
    { row: 1, col: 3, trackType: "ve" },
    { row: 1, col: 4, trackType: "ve" },
    { row: 2, col: 2, trackType: "ve" },
    { row: 2, col: 3, trackType: "ve" },
    { row: 2, col: 4, trackType: "ve" },
    { row: 3, col: 2, trackType: "ve" },
    { row: 3, col: 3, trackType: "ve" },
    { row: 3, col: 4, trackType: "ve" },
    { row: 4, col: 2, trackType: "ve" },
    { row: 4, col: 3, trackType: "ve" },
    { row: 4, col: 4, trackType: "ve" },
    { row: 5, col: 3, trackType: "ve" },
  ],

  "level-3": [
    { row: 2, col: 2, trackType: "se" },
    { row: 2, col: 3, trackType: "ho" },
    { row: 2, col: 4, trackType: "sw" },
    { row: 3, col: 1, trackType: "ho" },
    { row: 3, col: 2, trackType: "nw" },
    { row: 3, col: 4, trackType: "ne" },
    { row: 3, col: 5, trackType: "ho" },
  ],

  "level-4": [
  { row: 0, col: 1, trackType: "ho" },
  { row: 0, col: 2, trackType: "ho" },
  { row: 0, col: 3, trackType: "ho" },
  { row: 0, col: 4, trackType: "ho" },
  { row: 0, col: 5, trackType: "ho" },
  { row: 0, col: 6, trackType: "sw" },

  { row: 1, col: 6, trackType: "ve" },

  { row: 2, col: 1, trackType: "ho" },
  { row: 2, col: 2, trackType: "ho" },
  { row: 2, col: 3, trackType: "ho" },
  { row: 2, col: 4, trackType: "ho" },
  { row: 2, col: 5, trackType: "ho" },
  { row: 2, col: 6, trackType: "nw" },

  { row: 4, col: 0, trackType: "se" },
  { row: 4, col: 1, trackType: "ho" },
  { row: 4, col: 2, trackType: "ho" },
  { row: 4, col: 3, trackType: "ho" },
  { row: 4, col: 4, trackType: "ho" },
  { row: 4, col: 5, trackType: "ho" },

  { row: 5, col: 0, trackType: "ve" },

  { row: 6, col: 0, trackType: "ne" },
  { row: 6, col: 1, trackType: "ho" },
  { row: 6, col: 2, trackType: "ho" },
  { row: 6, col: 3, trackType: "ho" },
  { row: 6, col: 4, trackType: "ho" },
  { row: 6, col: 5, trackType: "ho" }
],
"level-5": [
  { row: 0, col: 1, trackType: "ho" },
  { row: 0, col: 2, trackType: "sw" },

  { row: 1, col: 2, trackType: "ve" },

  { row: 2, col: 2, trackType: "ve" },

  { row: 3, col: 2, trackType: "ve" },

  { row: 4, col: 2, trackType: "ne" },
  { row: 4, col: 3, trackType: "ho" },
  { row: 4, col: 4, trackType: "sw" },

  { row: 4, col: 4, trackType: "sw" },

  { row: 5, col: 4, trackType: "ve" },

  { row: 6, col: 4, trackType: "ne" },
  { row: 6, col: 5, trackType: "ho" }
],
"level-6": [
  { row: 0, col: 0, trackType: "se" },
  { row: 0, col: 1, trackType: "sw" },

  { row: 1, col: 0, trackType: "ve" },

  { row: 2, col: 0, trackType: "ne" },
  { row: 2, col: 1, trackType: "sw" },
  { row: 2, col: 3, trackType: "sw" },

  { row: 3, col: 1, trackType: "ne" },
  { row: 3, col: 2, trackType: "sw" },
  { row: 3, col: 3, trackType: "ve" },

  { row: 4, col: 2, trackType: "ve" },
  { row: 4, col: 3, trackType: "ne" },

  { row: 5, col: 2, trackType: "ve" },

  { row: 6, col: 2, trackType: "ne" },
  { row: 6, col: 3, trackType: "ho" },
  { row: 6, col: 4, trackType: "ho" },
  { row: 6, col: 5, trackType: "nw" }
],
"level-7": [
  { row: 0, col: 1, trackType: "ho" },
  { row: 0, col: 2, trackType: "ho" },
  { row: 0, col: 3, trackType: "sw" },
  { row: 0, col: 5, trackType: "se" },

  { row: 1, col: 3, trackType: "ve" },
  { row: 1, col: 5, trackType: "ve" },

  { row: 2, col: 3, trackType: "ve" },
  { row: 2, col: 5, trackType: "ve" },

  { row: 3, col: 1, trackType: "se" },
  { row: 3, col: 2, trackType: "ho" },
  { row: 3, col: 4, trackType: "ho" },
  { row: 3, col: 5, trackType: "nw" },

  { row: 4, col: 1, trackType: "ve" },
  { row: 4, col: 3, trackType: "ve" },

  { row: 5, col: 1, trackType: "ve" },
  { row: 5, col: 3, trackType: "ve" },

  { row: 6, col: 1, trackType: "nw" },
  { row: 6, col: 3, trackType: "ne" },
  { row: 6, col: 4, trackType: "ho" },
  { row: 6, col: 5, trackType: "ho" }
],
"level-8": [
  { row: 1, col: 3, trackType: "ne" },
  { row: 1, col: 4, trackType: "sw" },

  { row: 2, col: 4, trackType: "ve" },

  { row: 3, col: 1, trackType: "ho" },
  { row: 3, col: 2, trackType: "ho" },
  { row: 3, col: 3, trackType: "ho" },
  { row: 3, col: 4, trackType: "in" },
  { row: 3, col: 5, trackType: "ho" },

  { row: 4, col: 3, trackType: "se" },
  { row: 4, col: 4, trackType: "nw" },

  { row: 5, col: 3, trackType: "ve" }
],
"level-9": [
  { row: 1, col: 3, trackType: "se" },
  { row: 1, col: 4, trackType: "ho" },
  { row: 1, col: 5, trackType: "sw" },

  { row: 2, col: 2, trackType: "se" },
  { row: 2, col: 3, trackType: "nw" },
  { row: 2, col: 5, trackType: "ve" },

  { row: 3, col: 1, trackType: "se" },
  { row: 3, col: 2, trackType: "nw" },
  { row: 3, col: 5, trackType: "ve" },

  { row: 4, col: 0, trackType: "se" },
  { row: 4, col: 1, trackType: "nw" },
  { row: 4, col: 5, trackType: "ve" },

  { row: 5, col: 0, trackType: "ve" },
  { row: 5, col: 5, trackType: "ne" },
  { row: 5, col: 6, trackType: "sw" }
],
"level-10": [
  { row: 1, col: 0, trackType: "se" },
  { row: 1, col: 6, trackType: "sw" },

  { row: 2, col: 0, trackType: "ve" },
  { row: 2, col: 6, trackType: "ve" },

  { row: 3, col: 0, trackType: "ve" },
  { row: 3, col: 6, trackType: "ve" },

  { row: 4, col: 0, trackType: "ne" },
  { row: 4, col: 1, trackType: "ho" },
  { row: 4, col: 2, trackType: "ho" },
  { row: 4, col: 3, trackType: "sw+se", mainIsFirst: true },
  { row: 4, col: 4, trackType: "ho" },
  { row: 4, col: 5, trackType: "ho" },
  { row: 4, col: 6, trackType: "nw" }
],
"level-11": [
  { row: 2, col: 3, trackType: "se+ne", mainIsFirst: false, _toggle: true },
  { row: 2, col: 4, trackType: "sw" },

  { row: 3, col: 4, trackType: "ve" },

  { row: 4, col: 4, trackType: "ve" },

  { row: 5, col: 3, trackType: "ne" },
  { row: 5, col: 4, trackType: "nw" }
],
"level-12": [
  { row: 2, col: 3, trackType: "se" },
  { row: 2, col: 4, trackType: "ho" },
  { row: 2, col: 5, trackType: "ho" },
  { row: 2, col: 6, trackType: "sw+ve", mainIsFirst: false, _toggle: false },

  { row: 4, col: 0, trackType: "ne+ve", mainIsFirst: false, _toggle: false },
  { row: 4, col: 1, trackType: "ho" },
  { row: 4, col: 2, trackType: "ho" },
  { row: 4, col: 3, trackType: "nw" },

  { row: 5, col: 0, trackType: "ve" },

  { row: 1, col: 6, trackType: "ve" }
],
"level-13": [

], 
"level-14": [
  { row: 1, col: 0, trackType: "ne" },
  { row: 1, col: 1, trackType: "sw+se", mainIsFirst: true },
  { row: 1, col: 2, trackType: "nw" },

  { row: 2, col: 1, trackType: "ne" },
  { row: 2, col: 2, trackType: "ho" },
  { row: 2, col: 3, trackType: "ho" },
  { row: 2, col: 4, trackType: "ho" },
  { row: 2, col: 5, trackType: "ho" },
  { row: 2, col: 6, trackType: "nw" },

  { row: 1, col: 6, trackType: "ve" }
],
"level-15": [
  { row: 1, col: 0, trackType: "ve" },
  { row: 2, col: 0, trackType: "ve" },
  { row: 3, col: 0, trackType: "ve" },

  { row: 4, col: 0, trackType: "ne" },
  { row: 4, col: 1, trackType: "sw+se", mainIsFirst: true },
  { row: 4, col: 2, trackType: "ho" },
  { row: 4, col: 3, trackType: "ho" },
  { row: 4, col: 4, trackType: "ho" },
  { row: 4, col: 5, trackType: "ho" },

  { row: 5, col: 1, trackType: "ne" },
  { row: 5, col: 2, trackType: "sw" },

  { row: 6, col: 2, trackType: "ne" },
  { row: 6, col: 3, trackType: "ho" },
  { row: 6, col: 4, trackType: "ho" },
  { row: 6, col: 5, trackType: "ho" },
  { row: 6, col: 6, trackType: "nw" }
],
"level-16": [
  { row: 0, col: 4, trackType: "se" },
  { row: 0, col: 5, trackType: "ho" },

  { row: 1, col: 0, trackType: "ne" },
  { row: 1, col: 1, trackType: "sw" },
  { row: 1, col: 4, trackType: "ve" },

  { row: 2, col: 1, trackType: "se+ne", mainIsFirst: true },
  { row: 2, col: 2, trackType: "sw" },
  { row: 2, col: 4, trackType: "ve" },

  { row: 3, col: 0, trackType: "ne" },
  { row: 3, col: 1, trackType: "nw" },
  { row: 3, col: 2, trackType: "ve" },
  { row: 3, col: 4, trackType: "ve" },
  { row: 3, col: 5, trackType: "se" },
  { row: 3, col: 6, trackType: "sw" },

  { row: 4, col: 0, trackType: "se" },
  { row: 4, col: 1, trackType: "ho" },
  { row: 4, col: 2, trackType: "nw" },
  { row: 4, col: 4, trackType: "ne" },
  { row: 4, col: 5, trackType: "sw+nw", mainIsFirst: true },

  { row: 5, col: 0, trackType: "ve" },
  { row: 5, col: 5, trackType: "ne" },
  { row: 5, col: 6, trackType: "sw" }
],
  "level-16": [
    { row: 0, col: 1, trackType: "se" },
    { row: 0, col: 2, trackType: "sw" },
    { row: 1, col: 0, trackType: "ve" },
    { row: 1, col: 2, trackType: "ve" },
    { row: 2, col: 0, trackType: "ne" },
    { row: 2, col: 1, trackType: "ho" },
    { row: 2, col: 2, trackType: "sw+ve", mainIsFirst: true },
    { row: 3, col: 2, trackType: "ve" },
    { row: 4, col: 2, trackType: "ve" },
    { row: 5, col: 2, trackType: "ve" },
    { row: 6, col: 2, trackType: "ne" },
    { row: 6, col: 3, trackType: "ho" },
    { row: 6, col: 4, trackType: "ho" },
    { row: 6, col: 5, trackType: "ho" },
  ],

  "level-17": [
    { row: 2, col: 1, trackType: "sw" },
    { row: 2, col: 6, trackType: "ve" },
    { row: 3, col: 1, trackType: "se+ne", mainIsFirst: true },
    { row: 3, col: 2, trackType: "ho" },
    { row: 3, col: 3, trackType: "ho+se", mainIsFirst: true },
    { row: 3, col: 4, trackType: "ho" },
    { row: 3, col: 5, trackType: "ho" },
    { row: 3, col: 6, trackType: "nw" },
    { row: 4, col: 0, trackType: "start", mainIsFirst: true },  // yellow start right
    { row: 4, col: 1, trackType: "nw" },
    { row: 4, col: 3, trackType: "ve" },
    { row: 5, col: 2, trackType: "se" },
    { row: 5, col: 3, trackType: "nw+ne", mainIsFirst: true },
    { row: 5, col: 4, trackType: "sw" },
  ],

  "level-18": [
    { row: 0, col: 1, trackType: "se" },
    { row: 0, col: 2, trackType: "sw" },
    { row: 1, col: 0, trackType: "ve" },
    { row: 2, col: 0, trackType: "ne" },
    { row: 2, col: 1, trackType: "ho" },
    { row: 2, col: 2, trackType: "ho+ne", mainIsFirst: true},    // mainIsFirst true
    { row: 2, col: 3, trackType: "ho" },
    { row: 2, col: 4, trackType: "ho" },
    { row: 2, col: 5, trackType: "ho" },
    { row: 2, col: 6, trackType: "sw" },
    { row: 3, col: 6, trackType: "ve" },
    { row: 4, col: 6, trackType: "ve" },
    { row: 5, col: 6, trackType: "ve" },
  ],

  "level-19": [
    { row: 1, col: 3, trackType: "ve" },
    { row: 2, col: 1, trackType: "se" },
    { row: 2, col: 2, trackType: "ho" },
    { row: 2, col: 3, trackType: "nw+ne", mainIsFirst: true },
    { row: 2, col: 4, trackType: "ho" },
    { row: 2, col: 5, trackType: "sw" },
    { row: 3, col: 1, trackType: "se+ne", mainIsFirst: true },
    { row: 3, col: 2, trackType: "start", mainIsFirst: true },
    { row: 3, col: 4, trackType: "start", mainIsFirst: true },
    { row: 3, col: 5, trackType: "sw+nw", mainIsFirst: true },
    { row: 4, col: 1, trackType: "ne" },
    { row: 4, col: 2, trackType: "ho" },
    { row: 4, col: 3, trackType: "sw+se", mainIsFirst: true },
    { row: 4, col: 4, trackType: "ho" },
    { row: 4, col: 5, trackType: "nw" },
    { row: 5, col: 3, trackType: "ve" },
  ],

};

export default expectedPaths;
