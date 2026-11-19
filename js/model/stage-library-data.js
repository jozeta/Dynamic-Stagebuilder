// Library stage data (see stage-library.js): original layouts and wording, researched from
// published stage books, stage-design guides and classic public drills (docs/stage-library-sources.md);
// the "nationals" stages are original concepts after the layouts of the 2012 US IPSC Nationals.
// Positions in metres: x across the bay (+x the shooter's left), z down range from the up-range
// edge; rotation in degrees (0 faces up range, positive turns the front toward +x); start.facing 0
// looks down range.
export const LIBRARY_STAGES = Object.freeze([
 {
  "id": "el-presidente",
  "name": "El Presidente",
  "discipline": "both",
  "summary": "Turn, draw, two hits on each of three targets, reload, two on each again.",
  "bay": {
   "width": 14,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the start box facing up range, wrists above the shoulders",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, turn, engage T1–T3 with two rounds each, perform a reload, then engage T1–T3 again with two rounds each.",
   "stopTime": "Last shot",
   "notes": "12 rounds, Comstock. Targets 9.1 m (10 yards) from the box, centres 1.45 m apart. Traditional par: 10 s clean. A Standard Exercise rather than a match course (fixed procedure, mandatory reload)."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     1.45,
     11.1
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     11.1
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.45,
     11.1
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.4
     ],
     [
      0.6,
      1.4
     ],
     [
      0.6,
      2.6
     ],
     [
      -0.6,
      2.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 180
  },
  "category": "drill",
  "rounds": 12
 },
 {
  "id": "vice-presidente",
  "name": "Vice Presidente",
  "discipline": "both",
  "summary": "El Presidente from the facing-down-range start at 7 yards.",
  "bay": {
   "width": 14,
   "depth": 12
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the start box facing down range, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, draw, engage T1–T3 with two rounds each, reload, then engage T1–T3 again with two rounds each.",
   "stopTime": "Last shot",
   "notes": "12 rounds. Targets 6.4 m (7 yards) from the box. A faster, closer variant often used as a warm-up standard."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     1.45,
     8.4
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     8.4
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.45,
     8.4
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.4
     ],
     [
      0.6,
      1.4
     ],
     [
      0.6,
      2.6
     ],
     [
      -0.6,
      2.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 12
 },
 {
  "id": "bill-drill",
  "name": "Bill Drill",
  "discipline": "both",
  "summary": "Draw and put six fast hits on one target at 7 yards.",
  "bay": {
   "width": 10,
   "depth": 12
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the start box facing down range, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, draw and engage T1 with six rounds.",
   "stopTime": "Last shot",
   "notes": "6 rounds at 6.4 m (7 yards). Commonly scored A-zone only: about 3.5 s passing, 2.5 s good, 2.0 s excellent. Variant: 6, reload, 6."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     0,
     8.4
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.4
     ],
     [
      0.6,
      1.4
     ],
     [
      0.6,
      2.6
     ],
     [
      -0.6,
      2.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 6
 },
 {
  "id": "mozambique",
  "name": "Mozambique Drill",
  "discipline": "both",
  "summary": "Two to the body and one to the head on each of three targets at 5 m.",
  "bay": {
   "width": 12,
   "depth": 12
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the start box facing down range, hands at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, draw and engage each of T1–T3 with two rounds to the body and then one round to the head.",
   "stopTime": "Last shot",
   "notes": "9 rounds at 5 m. Uses tall targets with a head. Score body hits by zone; a head shot outside the head counts as a miss (club scoring choice)."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     1.5,
     7
    ],
    "rotation": -20,
    "params": {
     "style": "head"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     7
    ],
    "rotation": 0,
    "params": {
     "style": "head"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.5,
     7
    ],
    "rotation": 20,
    "params": {
     "style": "head"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.4
     ],
     [
      0.6,
      1.4
     ],
     [
      0.6,
      2.6
     ],
     [
      -0.6,
      2.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 9
 },
 {
  "id": "hostage-presidente",
  "name": "Hostage Presidente",
  "discipline": "both",
  "summary": "El Presidente with no-shoots overlapping every target.",
  "bay": {
   "width": 14,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the start box facing up range, wrists above the shoulders",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, turn, engage T1–T3 with two rounds each, reload, then engage T1–T3 again with two rounds each.",
   "stopTime": "Last shot",
   "notes": "12 rounds at 9.1 m. Each target has a no-shoot covering one side or the lower half, so accuracy under speed is the test."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     1.6,
     11.1
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     11.1
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.6,
     11.1
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-left"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.4
     ],
     [
      0.6,
      1.4
     ],
     [
      0.6,
      2.6
     ],
     [
      -0.6,
      2.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 180
  },
  "category": "drill",
  "rounds": 12
 },
 {
  "id": "barricade-standard",
  "name": "Barricade Standard",
  "discipline": "both",
  "summary": "Bianchi-style barricade strings at 10, 15 and 25 yards, shooting from both sides.",
  "bay": {
   "width": 12,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in box A behind the barricade, facing down range, hands at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "Three strings, one per box (A 10 yd, B 15 yd, C 25 yd). Each string: on the start signal, draw, engage T1 and T2 with three rounds each from one side of the barricade, then three rounds each from the other side.",
   "stopTime": "Last shot",
   "notes": "36 rounds in three strings; the shooter may not touch the ground in front of the barricade line. A precision standard inspired by the NRA Action Pistol barricade event (which also has a 35-yard string; it doesn't fit a 30 m bay). Generous par times of 6–8 s per string."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     0.9,
     28.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.9,
     28.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "wall-solid",
    "position": [
     0,
     20.11
    ],
    "rotation": 0,
    "params": {
     "length": 0.5,
     "height": 1.8
    }
   },
   {
    "type": "wall-solid",
    "position": [
     0,
     15.53
    ],
    "rotation": 0,
    "params": {
     "length": 0.5,
     "height": 1.8
    }
   },
   {
    "type": "wall-solid",
    "position": [
     0,
     6.39
    ],
    "rotation": 0,
    "params": {
     "length": 0.5,
     "height": 1.8
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.9,
      18.86
     ],
     [
      0.9,
      18.86
     ],
     [
      0.9,
      19.86
     ],
     [
      -0.9,
      19.86
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -0.9,
      14.28
     ],
     [
      0.9,
      14.28
     ],
     [
      0.9,
      15.28
     ],
     [
      -0.9,
      15.28
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -0.9,
      5.14
     ],
     [
      0.9,
      5.14
     ],
     [
      0.9,
      6.14
     ],
     [
      -0.9,
      6.14
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    19.36
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 36
 },
 {
  "id": "strong-weak-standard",
  "name": "Strong and Weak",
  "discipline": "both",
  "summary": "Two strings on three targets: strong hand only, then weak hand only.",
  "bay": {
   "width": 14,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the box facing down range, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "String 1: on the start signal, draw and engage T1–T3 with two rounds each, strong hand only. String 2: start as before; on the signal, draw and engage T1–T3 with two rounds each, weak hand only (the handgun may be transferred after the draw).",
   "stopTime": "Last shot",
   "notes": "12 rounds, two strings of 6. Targets about 9 m away; T2 has a no-shoot on its right. Shot as a Standard Exercise (fixed procedure, separate strings)."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     1.6,
     12
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     12.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.6,
     12
    ],
    "rotation": 10,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.75,
      1.5
     ],
     [
      0.75,
      1.5
     ],
     [
      0.75,
      3
     ],
     [
      -0.75,
      3
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 12
 },
 {
  "id": "distance-standard",
  "name": "Long Look",
  "discipline": "IPSC",
  "summary": "Four partial targets at 20+ m and a popper from one box: pure accuracy.",
  "bay": {
   "width": 16,
   "depth": 28
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "9 rounds, 9 hits from one place (the IPSC maximum). T1 has a no-shoot on its left, T3 hard cover on its lower quarter; the popper must fall to score."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     2.4,
     23
    ],
    "rotation": -5,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.8,
     25
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.8,
     25
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/4"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.4,
     23
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     0,
     18
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1,
      1.5
     ],
     [
      1,
      1.5
     ],
     [
      1,
      3
     ],
     [
      -1,
      3
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "category": "drill",
  "rounds": 9
 },
 {
  "id": "table-start",
  "name": "Kitchen Table",
  "discipline": "IPSC",
  "summary": "Seated start with the handgun on a table; shoot one side, move past a wall, shoot the other.",
  "bay": {
   "width": 16,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Seated on the chair, hands on knees",
   "gunCondition": "Magazine inserted, chamber empty, handgun lying on the table within the marks, muzzle pointing down range",
   "procedure": "On the start signal, pick up the handgun and engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "11 rounds: 4 IPSC targets, 2 IPSC poppers, 1 IPSC metal plate. The wall stops the table side seeing the right-hand array; move behind its up-range end to reach the right-hand area."
  },
  "objects": [
   {
    "type": "table",
    "position": [
     0.6,
     2.6
    ],
    "rotation": 0,
    "params": {
     "length": 1.2
    }
   },
   {
    "type": "chair",
    "position": [
     0.6,
     1.85
    ],
    "rotation": 180,
    "params": {}
   },
   {
    "type": "wall-wood",
    "position": [
     -1.6,
     2.833
    ],
    "rotation": 90,
    "params": {
     "length": 3.667,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -1.6,
     6.5
    ],
    "rotation": 90,
    "params": {
     "length": 3.667,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -1.6,
     10.167
    ],
    "rotation": 90,
    "params": {
     "length": 3.667,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     10
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.4,
     11
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     1.6,
     13.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     3.6,
     13
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4,
     10
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     11.5
    ],
    "rotation": 15,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "plate-round",
    "position": [
     -4.8,
     12.6
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1.2,
      1
     ],
     [
      2,
      1
     ],
     [
      2,
      4
     ],
     [
      -1.2,
      4
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -5,
      1
     ],
     [
      -2.1,
      1
     ],
     [
      -2.1,
      4
     ],
     [
      -5,
      4
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0.6,
    1.85
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 11
 },
 {
  "id": "fork-in-the-road",
  "name": "Fork in the Road",
  "discipline": "both",
  "summary": "A T-shaped wall splits the field; lean around each end to see its array.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "10 rounds: 4 IPSC targets, 2 IPSC mini poppers. Freestyle: either side first."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.1
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.1
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     10
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     12.5
    ],
    "rotation": -30,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     2,
     14
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     10
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.5,
     12.5
    ],
    "rotation": 30,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -2,
     14
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -4,
      1.5
     ],
     [
      4,
      1.5
     ],
     [
      4,
      4.6
     ],
     [
      -4,
      4.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 10
 },
 {
  "id": "turn-and-burn",
  "name": "Turn and Burn",
  "discipline": "IPSC",
  "summary": "Up-range start in the left box, then cross behind the wall to the right box.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the left box facing up range, hands relaxed at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, turn and engage the targets from within the shooting boxes.",
   "stopTime": "Last shot",
   "notes": "12 rounds: 5 IPSC targets, 2 IPSC mini poppers. The vision barrier runs from the up-range end of the boxes; move behind it."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     9.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     11.5
    ],
    "rotation": -15,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     3.5,
     14
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     9.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     11
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     13.5
    ],
    "rotation": 20,
    "params": {
     "hardCover": "diagonal"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -2,
     14.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      0.5,
      1.5
     ],
     [
      4.5,
      1.5
     ],
     [
      4.5,
      4.5
     ],
     [
      0.5,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -4.5,
      1.5
     ],
     [
      -0.5,
      1.5
     ],
     [
      -0.5,
      4.5
     ],
     [
      -4.5,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    2.5,
    3
   ],
   "facing": 180
  },
  "category": "short",
  "rounds": 12
 },
 {
  "id": "port-authority",
  "name": "Port Authority",
  "discipline": "IPSC",
  "summary": "A closed box with two standing ports; each port sees part of the field.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets through the ports.",
   "stopTime": "Last shot",
   "notes": "11 rounds: 4 IPSC targets, 2 IPSC mini poppers, 1 IPSC metal plate. A wall splits the box into two halves, one per port; leave by the rear to change halves. Targets can only be seen through the ports."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     1,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1.05
    }
   },
   {
    "type": "wall-port",
    "position": [
     -1,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1.05
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.05,
     3
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.05,
     3
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     3
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     11
    ],
    "rotation": 30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     13
    ],
    "rotation": 35,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     11
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     13
    ],
    "rotation": -35,
    "params": {
     "hardCover": "right-1/2"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -1.5,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     1.5,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-square",
    "position": [
     0,
     16.5
    ],
    "rotation": 0,
    "params": {
     "size": 0.15,
     "baseHeight": 1.1
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      0.5,
      1.5
     ],
     [
      1.5,
      1.5
     ],
     [
      1.5,
      3.2
     ],
     [
      0.5,
      3.2
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -1.5,
      1.5
     ],
     [
      -0.5,
      1.5
     ],
     [
      -0.5,
      3.2
     ],
     [
      -1.5,
      3.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    1,
    2.5
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 11
 },
 {
  "id": "parking-lot",
  "name": "Parking Lot",
  "discipline": "IPSC",
  "summary": "Start at the car door; shoot over the car's ends around a T-wall.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the driver's door of the car, both hands on the roof",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "11 rounds: 4 IPSC targets (two of them an overlapping pair), 1 IPSC popper, 2 IPSC metal plates. The car is a prop inside the shooting area; leaning on it is allowed."
  },
  "objects": [
   {
    "type": "car",
    "position": [
     0,
     3.2
    ],
    "rotation": 0,
    "params": {
     "model": "sedan",
     "color": "grey"
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     9.1
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     13.1
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     11
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     13
    ],
    "rotation": -30,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "popper",
    "position": [
     3.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     11
    ],
    "rotation": 20,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "plate-round",
    "position": [
     -2.5,
     15.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     -4.5,
     15.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -4.5,
      1
     ],
     [
      4.5,
      1
     ],
     [
      4.5,
      6.5
     ],
     [
      -4.5,
      6.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0.8,
    4.6
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 11
 },
 {
  "id": "low-port",
  "name": "Down Low",
  "discipline": "IPSC",
  "summary": "Shoot the left array over a low wall, then kneel for a low port on the right.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "12 rounds: 3 IPSC targets, 2 IPSC mini targets, 2 IPSC mini poppers. The right-hand targets are visible only through the low port (bottom 25 cm)."
  },
  "objects": [
   {
    "type": "wall-mesh-port",
    "position": [
     -2,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2,
     "portWidth": 0.6,
     "portHeight": 0.45,
     "portBottom": 0.25
    }
   },
   {
    "type": "wall-wood",
    "position": [
     2,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     6.6
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     10.6
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2,
     9.5
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     11
    ],
    "rotation": -30,
    "params": {
     "presentation": "ns-flank"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     14
    ],
    "rotation": -15,
    "params": {
     "hardCover": "lower-1/2"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     5.5,
     14.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-mini",
    "position": [
     -2,
     10.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-mini",
    "position": [
     -3.5,
     13
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     -1.5,
     14
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -4,
      1.5
     ],
     [
      4,
      1.5
     ],
     [
      4,
      4.2
     ],
     [
      -4,
      4.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    2,
    3
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 12
 },
 {
  "id": "steel-sandwich",
  "name": "Steel Sandwich",
  "discipline": "IPSC",
  "summary": "A row of plates on one side, poppers and a partial on the other.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in either box, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting boxes.",
   "stopTime": "Last shot",
   "notes": "10 rounds: 2 IPSC targets, 2 IPSC poppers, 4 IPSC metal plates. Plates are 7.5 m from the box (IPSC minimum for metal is 7 m)."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.5
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.5
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.5
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "plate-round",
    "position": [
     1.6,
     12.5
    ],
    "rotation": 0,
    "params": {
     "baseHeight": 1.0
    }
   },
   {
    "type": "plate-round",
    "position": [
     2.6,
     12.5
    ],
    "rotation": 0,
    "params": {
     "baseHeight": 1.0
    }
   },
   {
    "type": "plate-round",
    "position": [
     3.6,
     12.5
    ],
    "rotation": 0,
    "params": {
     "baseHeight": 1.0
    }
   },
   {
    "type": "plate-round",
    "position": [
     4.6,
     12.5
    ],
    "rotation": 0,
    "params": {
     "baseHeight": 1.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.8,
     9.5
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     9.5
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     -2,
     13
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -4,
     13.3
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      0.5,
      1.5
     ],
     [
      4,
      1.5
     ],
     [
      4,
      4.5
     ],
     [
      0.5,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -4,
      1.5
     ],
     [
      -0.5,
      1.5
     ],
     [
      -0.5,
      4.5
     ],
     [
      -4,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    2,
    3
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 10
 },
 {
  "id": "small-things",
  "name": "Small Things",
  "discipline": "IPSC",
  "summary": "Four mini targets with cover and no-shoots plus a mini popper, from one box.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area. Kneeling behind the sandbags is optional.",
   "stopTime": "Last shot",
   "notes": "9 rounds, 45 points: 4 IPSC mini targets, 1 IPSC mini popper. 9 hits from one place, the IPSC limit."
  },
  "objects": [
   {
    "type": "sandbags",
    "position": [
     0,
     3.85
    ],
    "rotation": 0,
    "params": {
     "length": 1.5,
     "rows": 2
    }
   },
   {
    "type": "paper-mini",
    "position": [
     2,
     10
    ],
    "rotation": -15,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-mini",
    "position": [
     0.6,
     12
    ],
    "rotation": 0,
    "params": {
     "hardCover": "left-1/2"
    }
   },
   {
    "type": "paper-mini",
    "position": [
     -1,
     10.8
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-mini",
    "position": [
     -2.5,
     13
    ],
    "rotation": 15,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     0,
     15
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -2,
      1.5
     ],
     [
      2,
      1.5
     ],
     [
      2,
      3.5
     ],
     [
      -2,
      3.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.5
   ],
   "facing": 0
  },
  "category": "short",
  "rounds": 9
 },
 {
  "id": "three-lanes",
  "name": "Three Lanes",
  "discipline": "IPSC",
  "summary": "Three lanes behind vision barriers; the centre lane only through a port.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the centre box, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas.",
   "stopTime": "Last shot",
   "notes": "20 rounds: 8 IPSC targets (one stacked pair), 1 IPSC popper, 1 IPSC mini popper, 2 IPSC metal plates. Move between lanes behind the barriers."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-port",
    "position": [
     0,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1.0
    }
   },
   {
    "type": "wall-solid",
    "position": [
     2.25,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 0.5,
     "height": 2.0
    }
   },
   {
    "type": "wall-solid",
    "position": [
     -2.25,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 0.5,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1,
     11
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1,
     12
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     15.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     10
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     12
    ],
    "rotation": 10,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "popper",
    "position": [
     -4.5,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     -7.5,
     15.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     10
    ],
    "rotation": 5,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     12.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     4.5,
     15.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     7,
     16
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      1.5
     ],
     [
      -3,
      1.5
     ],
     [
      -3,
      4.5
     ],
     [
      -8,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -2,
      1.5
     ],
     [
      2,
      1.5
     ],
     [
      2,
      4.5
     ],
     [
      -2,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3,
      1.5
     ],
     [
      8,
      1.5
     ],
     [
      8,
      4.5
     ],
     [
      3,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 20
 },
 {
  "id": "swing-shift",
  "name": "Swing Shift",
  "discipline": "IPSC",
  "summary": "A popper on the right activates a swinger on the left: plan the order.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in either box, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting boxes. Popper P1 activates swinger T7, which is visible at rest.",
   "stopTime": "Last shot",
   "notes": "18 rounds: 7 IPSC targets (one with a no-shoot between two targets), 1 IPSC popper, 1 IPSC mini popper, 1 swinger. T7 is visible at rest, so it can be shot before activation."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     9
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     11
    ],
    "rotation": 15,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     13.5
    ],
    "rotation": 20,
    "params": {
     "presentation": "two-ns-between"
    }
   },
   {
    "type": "popper",
    "position": [
     -2,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     9
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     11.5
    ],
    "rotation": -15,
    "params": {
     "hardCover": "lower-1/4"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     14.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "swinger",
    "position": [
     6,
     13
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     1.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -5,
      1.5
     ],
     [
      -0.5,
      1.5
     ],
     [
      -0.5,
      4.5
     ],
     [
      -5,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      0.5,
      1.5
     ],
     [
      5,
      1.5
     ],
     [
      5,
      4.5
     ],
     [
      0.5,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -2.5,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 18
 },
 {
  "id": "cross-over",
  "name": "Cross Over",
  "discipline": "IPSC",
  "summary": "Shoot the right lane, then go through a doorway into the left lane and advance.",
  "bay": {
   "width": 16,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the right-hand shooting area, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. Go back through the doorway at the up-range end of the barrier, then forward to the left-hand area.",
   "stopTime": "Last shot",
   "notes": "16 rounds: 6 IPSC targets, 1 IPSC popper, 1 IPSC mini popper, 2 IPSC metal plates. The doorway is 0.8 m wide."
  },
  "objects": [
   {
    "type": "wall-solid",
    "position": [
     0,
     0.65
    ],
    "rotation": 90,
    "params": {
     "length": 1.3,
     "height": 2.2
    }
   },
   {
    "type": "wall-door",
    "position": [
     0,
     2.05
    ],
    "rotation": 90,
    "params": {
     "length": 1.5,
     "height": 2.2,
     "doorWidth": 0.8
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     4.62
    ],
    "rotation": 90,
    "params": {
     "length": 3.64,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     8.26
    ],
    "rotation": 90,
    "params": {
     "length": 3.64,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.9
    ],
    "rotation": 90,
    "params": {
     "length": 3.64,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.54
    ],
    "rotation": 90,
    "params": {
     "length": 3.64,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     19.18
    ],
    "rotation": 90,
    "params": {
     "length": 3.64,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     11
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     12.5
    ],
    "rotation": 15,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     15.5
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "popper",
    "position": [
     -6,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     -1.5,
     18.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     15
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     16.5
    ],
    "rotation": -15,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     19.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     6,
     20.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     1.5,
     22
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6,
      3.5
     ],
     [
      -0.6,
      3.5
     ],
     [
      -0.6,
      7
     ],
     [
      -6,
      7
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      0.6,
      8
     ],
     [
      6,
      8
     ],
     [
      6,
      11.5
     ],
     [
      0.6,
      11.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -3,
    5
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 16
 },
 {
  "id": "high-ground",
  "name": "High Ground",
  "discipline": "IPSC",
  "summary": "Shoot the right array from the ground, then climb onto a platform for the left.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. Targets T5–T7 and their steel can only be engaged from the platform.",
   "stopTime": "Last shot",
   "notes": "16 rounds: 6 IPSC targets (one overlapping pair), 2 IPSC poppers, 1 IPSC mini popper, 1 IPSC metal plate. Platform 0.6 m high with a ramp."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "ramp",
    "position": [
     3,
     1.75
    ],
    "rotation": 90,
    "params": {
     "length": 1.4,
     "width": 1,
     "height": 0.6
    }
   },
   {
    "type": "platform",
    "position": [
     3,
     3.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "width": 1.2,
     "height": 0.6
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     9
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     10.5
    ],
    "rotation": 10,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "popper",
    "position": [
     -3.5,
     14.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -6,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2,
     10
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     12
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     9.5
    ],
    "rotation": -30,
    "params": {
     "hardCover": "lower-1/2",
     "mountHeight": 0.4
    }
   },
   {
    "type": "mini-popper",
    "position": [
     3,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     5.5,
     15.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6,
      1.5
     ],
     [
      -2,
      1.5
     ],
     [
      -2,
      4.5
     ],
     [
      -6,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      1.1,
      2.95
     ],
     [
      4.9,
      2.95
     ],
     [
      4.9,
      4.05
     ],
     [
      1.1,
      4.05
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -4,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 16
 },
 {
  "id": "fall-back",
  "name": "Fall Back",
  "discipline": "IPSC",
  "summary": "Start down range in the centre lane, then retreat and come round into the side lanes.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the forward box, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. Move up range around the end of a barrier to reach each side lane.",
   "stopTime": "Last shot",
   "notes": "17 rounds: 7 IPSC targets, 1 IPSC mini popper, 2 IPSC poppers. A retreat stage: the first targets are shot from the start box, giving the RO time to get behind the competitor."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     3,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1,
     16
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1,
     16.5
    ],
    "rotation": -10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     19
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/4"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     0,
     22
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     13
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     8,
     16
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     6.5,
     19
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     13
    ],
    "rotation": 5,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8,
     16
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -6.5,
     19
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1,
      9
     ],
     [
      1,
      9
     ],
     [
      1,
      11
     ],
     [
      -1,
      11
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3.6,
      2
     ],
     [
      7,
      2
     ],
     [
      7,
      5.5
     ],
     [
      3.6,
      5.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -7,
      2
     ],
     [
      -3.6,
      2
     ],
     [
      -3.6,
      5.5
     ],
     [
      -7,
      5.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    10
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 17
 },
 {
  "id": "long-wall",
  "name": "Long Wall",
  "discipline": "IPSC",
  "summary": "Two targets in front of a long wall, moving targets hidden behind each end.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area. Popper P1 activates drop turner T5; popper P2 activates clamshell T6, which is not visible at rest.",
   "stopTime": "Last shot",
   "notes": "14 rounds: 4 IPSC targets, 1 drop turner, 1 clamshell, 2 IPSC poppers. The clamshell disappears after activation in this design: shoot P2 and be ready."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     -2.0,
     9
    ],
    "rotation": 0,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.0,
     9
    ],
    "rotation": 0,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1,
     7.9
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     1,
     7.9
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     13
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     3,
     15.5
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     6.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     13
    ],
    "rotation": -5,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "clamshell",
    "position": [
     -3,
     15.5
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -6.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      1.5
     ],
     [
      8,
      1.5
     ],
     [
      8,
      4.9
     ],
     [
      -8,
      4.9
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 14
 },
 {
  "id": "port-and-run",
  "name": "Port and Run",
  "discipline": "IPSC",
  "summary": "Start in a port box on the right, then run to two open positions.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the port box, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas.",
   "stopTime": "Last shot",
   "notes": "21 rounds: 8 IPSC targets (one overlapping pair), 1 IPSC popper, 1 IPSC mini popper, 3 IPSC metal plates."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     -2.4,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.4,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.4,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.4,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-port",
    "position": [
     -4.3,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 3.4,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.05,
     3
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3.2,
     12
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.5,
     13
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "popper",
    "position": [
     -4,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     -5.6,
     16
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     11
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.2,
     14
    ],
    "rotation": 0,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -0.6,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     10
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     7,
     12.5
    ],
    "rotation": -10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     15
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "plate-round",
    "position": [
     6.5,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     8,
     16
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -5.9,
      1.5
     ],
     [
      -2.7,
      1.5
     ],
     [
      -2.7,
      4.2
     ],
     [
      -5.9,
      4.2
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -1.8,
      1.5
     ],
     [
      2,
      1.5
     ],
     [
      2,
      4.5
     ],
     [
      -1.8,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3,
      1.5
     ],
     [
      7,
      1.5
     ],
     [
      7,
      4.5
     ],
     [
      3,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -4.3,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 21
 },
 {
  "id": "hostage-crisis",
  "name": "Hostage Crisis",
  "discipline": "IPSC",
  "summary": "Every target is partly covered by no-shoots or hard cover: an accuracy medium.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "17 rounds: 7 IPSC targets, 1 IPSC mini target, 1 IPSC mini popper, plus one free-standing no-shoot. Penalties for no-shoot hits make points matter more than time here."
  },
  "objects": [
   {
    "type": "wall-wood",
    "position": [
     0,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     8.6
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     12.6
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     10
    ],
    "rotation": -20,
    "params": {
     "presentation": "ns-flank"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     12
    ],
    "rotation": -30,
    "params": {
     "presentation": "ns-behind"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.2,
     14
    ],
    "rotation": -10,
    "params": {
     "presentation": "two-ns-between"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4,
     8
    ],
    "rotation": -40,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     10
    ],
    "rotation": 20,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     12
    ],
    "rotation": 30,
    "params": {
     "presentation": "stacked-ns"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     14
    ],
    "rotation": 15,
    "params": {
     "presentation": "ns-left",
     "hardCover": "lower-1/4"
    }
   },
   {
    "type": "paper-mini",
    "position": [
     -6,
     15
    ],
    "rotation": 25,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -4,
     17
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6,
      1.5
     ],
     [
      6,
      1.5
     ],
     [
      6,
      5
     ],
     [
      -6,
      5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "medium",
  "rounds": 17
 },
 {
  "id": "grand-field",
  "name": "Grand Field",
  "discipline": "IPSC",
  "summary": "Three lanes, a doorway in the centre lane, nine hits per position.",
  "bay": {
   "width": 24,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the centre lane, up range of the doorway, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas.",
   "stopTime": "Last shot",
   "notes": "27 rounds: 12 IPSC targets (overlapping, stacked and no-shoot-between pairs), 1 IPSC popper, 1 IPSC mini popper, 1 IPSC metal plate. Freestyle: the centre array is best shot from beyond the doorway."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     4,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-door",
    "position": [
     0,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 1.5,
     "height": 2.2,
     "doorWidth": 0.8
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.0,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 2.5,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.0,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 2.5,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.625,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 0.75,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.625,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 0.75,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     10
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9,
     11.5
    ],
    "rotation": 5,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7,
     15
    ],
    "rotation": -5,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     -10,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     10
    ],
    "rotation": 15,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9,
     12
    ],
    "rotation": -5,
    "params": {
     "presentation": "ns-flank"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     7,
     15.5
    ],
    "rotation": 5,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "plate-round",
    "position": [
     10,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     15
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2,
     15
    ],
    "rotation": -20,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     18
    ],
    "rotation": 0,
    "params": {
     "presentation": "two-ns-between"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -1.5,
     21
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -11,
      1.5
     ],
     [
      -4.6,
      1.5
     ],
     [
      -4.6,
      5
     ],
     [
      -11,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      4.6,
      1.5
     ],
     [
      11,
      1.5
     ],
     [
      11,
      5
     ],
     [
      4.6,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -3.4,
      1.5
     ],
     [
      3.4,
      1.5
     ],
     [
      3.4,
      10.5
     ],
     [
      -3.4,
      10.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 27
 },
 {
  "id": "up-and-over",
  "name": "Up and Over",
  "discipline": "IPSC",
  "summary": "Right lane, then up a ramp to a centre platform, then the left lane.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the right-hand area, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. The centre targets can only be seen from the platform.",
   "stopTime": "Last shot",
   "notes": "27 rounds: 11 IPSC targets (an overlapping and a stacked pair), 1 IPSC popper, 2 IPSC mini poppers, 2 IPSC metal plates. The low T6 rewards the height of the platform."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "ramp",
    "position": [
     -1.3,
     3
    ],
    "rotation": 0,
    "params": {
     "length": 1.8,
     "width": 1,
     "height": 0.6
    }
   },
   {
    "type": "platform",
    "position": [
     1.2,
     3
    ],
    "rotation": 0,
    "params": {
     "length": 3.2,
     "width": 1.2,
     "height": 0.6
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     9.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8,
     11
    ],
    "rotation": 15,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     14
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     -8.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.5,
     11
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.5,
     11
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     13.5
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/2",
     "mountHeight": 0.3
    }
   },
   {
    "type": "mini-popper",
    "position": [
     -1,
     17.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     1,
     17.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     2.2,
     19.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     9.5
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8,
     11
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     14
    ],
    "rotation": 0,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "plate-round",
    "position": [
     8.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -9,
      1.5
     ],
     [
      -3.8,
      1.5
     ],
     [
      -3.8,
      5
     ],
     [
      -9,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -0.3,
      2.45
     ],
     [
      2.7,
      2.45
     ],
     [
      2.7,
      3.55
     ],
     [
      -0.3,
      3.55
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3.8,
      1.5
     ],
     [
      9,
      1.5
     ],
     [
      9,
      5
     ],
     [
      3.8,
      5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -6,
    3
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 27
 },
 {
  "id": "movers-and-shakers",
  "name": "Movers and Shakers",
  "discipline": "IPSC",
  "summary": "Long course built around three activated moving targets.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. Popper P1 activates swinger T4 (visible at rest). Popper P2 activates the mover T8 (not visible at rest). Popper P3 activates drop turner T12 (not visible at rest).",
   "stopTime": "Last shot",
   "notes": "26 rounds: 8 IPSC targets, 1 swinger, 1 mover, 1 drop turner, 3 IPSC poppers, 1 IPSC metal plate. Activator order is the puzzle."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     2.8
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     6.4
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     10.0
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     13.6
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.2,
     17.2
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     2.8
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     6.4
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     10.0
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     13.6
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.2,
     17.2
    ],
    "rotation": 90,
    "params": {
     "length": 3.6,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     9
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7.5,
     11
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     -5,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "swinger",
    "position": [
     -8,
     14.5
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     -6.5,
     17.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.5,
     10
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.5,
     10
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     13
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "popper",
    "position": [
     0,
     16.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mover",
    "position": [
     0,
     19.5
    ],
    "rotation": 0,
    "params": {
     "length": 4
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     9
    ],
    "rotation": 10,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     7.5,
     11.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     8.5,
     16.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     5,
     15
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     18.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -9,
      1.5
     ],
     [
      -3.8,
      1.5
     ],
     [
      -3.8,
      5
     ],
     [
      -9,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -2.6,
      1.5
     ],
     [
      2.6,
      1.5
     ],
     [
      2.6,
      6
     ],
     [
      -2.6,
      6
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3.8,
      1.5
     ],
     [
      9,
      1.5
     ],
     [
      9,
      5
     ],
     [
      3.8,
      5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 26
 },
 {
  "id": "the-village",
  "name": "The Village",
  "discipline": "IPSC",
  "summary": "Start inside house A, shoot out of its window, cross the street, finish in house B.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing inside house A, one hand touching the rear wall",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas. Leave house A by its door, go round the up-range end of the street wall, and enter house B by its door.",
   "stopTime": "Last shot",
   "notes": "26 rounds: 10 IPSC targets (including a stacked pair), 2 IPSC mini targets, 2 IPSC poppers. The windows are 60 × 50 cm ports (house B's side window 50 × 50 cm); house walls are impenetrable."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     -5,
     6
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.2,
     "portWidth": 0.6,
     "portHeight": 0.5,
     "portBottom": 1.1
    }
   },
   {
    "type": "wall-solid",
    "position": [
     -3,
     2.25
    ],
    "rotation": 90,
    "params": {
     "length": 0.5,
     "height": 2.2
    }
   },
   {
    "type": "wall-door",
    "position": [
     -3,
     3.25
    ],
    "rotation": 90,
    "params": {
     "length": 1.5,
     "height": 2.2,
     "doorWidth": 0.8
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -3,
     5
    ],
    "rotation": 90,
    "params": {
     "length": 2,
     "height": 2.2
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -7,
     4
    ],
    "rotation": 90,
    "params": {
     "length": 4,
     "height": 2.2
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -5,
     2
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.2
    }
   },
   {
    "type": "wall-port",
    "position": [
     5,
     13
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.2,
     "portWidth": 0.6,
     "portHeight": 0.5,
     "portBottom": 1.1
    }
   },
   {
    "type": "wall-solid",
    "position": [
     3,
     9.25
    ],
    "rotation": 90,
    "params": {
     "length": 0.5,
     "height": 2.2
    }
   },
   {
    "type": "wall-door",
    "position": [
     3,
     10.25
    ],
    "rotation": 90,
    "params": {
     "length": 1.5,
     "height": 2.2,
     "doorWidth": 0.8
    }
   },
   {
    "type": "wall-wood",
    "position": [
     3,
     12
    ],
    "rotation": 90,
    "params": {
     "length": 2,
     "height": 2.2
    }
   },
   {
    "type": "wall-port",
    "position": [
     7,
     11
    ],
    "rotation": 90,
    "params": {
     "length": 4,
     "height": 2.2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1.1
    }
   },
   {
    "type": "wall-wood",
    "position": [
     5,
     9
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     1.5,
     13
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     23.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4,
     13
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     14
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     17
    ],
    "rotation": 0,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "popper",
    "position": [
     -4,
     20
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     5
    ],
    "rotation": -75,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     2.5
    ],
    "rotation": -100,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4,
     18
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     7.5,
     16.5
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     19.5
    ],
    "rotation": -5,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     22
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "popper",
    "position": [
     3.5,
     23.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-mini",
    "position": [
     9.4,
     10
    ],
    "rotation": -105,
    "params": {}
   },
   {
    "type": "paper-mini",
    "position": [
     9.4,
     12.2
    ],
    "rotation": -75,
    "params": {
     "presentation": "ns-lower"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6.8,
      2.2
     ],
     [
      -3.2,
      2.2
     ],
     [
      -3.2,
      5.8
     ],
     [
      -6.8,
      5.8
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      0.6,
      1
     ],
     [
      2.6,
      1
     ],
     [
      2.6,
      8
     ],
     [
      0.6,
      8
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3.2,
      9.2
     ],
     [
      6.0,
      9.2
     ],
     [
      6.0,
      12.8
     ],
     [
      3.2,
      12.8
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -5,
    3
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 26
 },
 {
  "id": "wide-open",
  "name": "Wide Open",
  "discipline": "IPSC",
  "summary": "One wide shooting area; four arrays hidden behind T-shaped barriers, any order.",
  "bay": {
   "width": 30,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing anywhere in the shooting area, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area.",
   "stopTime": "Last shot",
   "notes": "26 rounds: 11 IPSC targets (one overlapping pair), 2 IPSC poppers, 2 IPSC metal plates, plus a no-shoot. Freestyle: each array is seen only from the part of the area in front of it, so the order and positions are the competitor's choice."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     -6.5,
     5.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.5,
     7.525
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.5,
     11.375
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.5,
     15.225
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.5,
     19.075
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     5.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.525
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.375
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.225
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     19.075
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     5.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     7.525
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     11.375
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     15.225
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     19.075
    ],
    "rotation": 90,
    "params": {
     "length": 3.85,
     "height": 2.0
    }
   },
   {
    "type": "barrel",
    "position": [
     3.5,
     3
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -3.5,
     3
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "tyre-stack",
    "position": [
     10,
     3
    ],
    "rotation": 0,
    "params": {
     "count": 2
    }
   },
   {
    "type": "tyre-stack",
    "position": [
     -10,
     3
    ],
    "rotation": 0,
    "params": {
     "count": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -10,
     11
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -12,
     14
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "popper",
    "position": [
     -9,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -11.5,
     18.5
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     10
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     13.5
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     16
    ],
    "rotation": -5,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "plate-round",
    "position": [
     -4,
     19
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     10
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     13.5
    ],
    "rotation": -10,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2,
     15
    ],
    "rotation": 5,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "plate-round",
    "position": [
     2,
     19
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     10,
     11
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     12,
     14
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     9,
     17
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -13,
      1.5
     ],
     [
      13,
      1.5
     ],
     [
      13,
      5
     ],
     [
      -13,
      5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 26
 },
 {
  "id": "long-haul",
  "name": "Long Haul",
  "discipline": "IPSC",
  "summary": "Advance down a corridor; each gap between baffles opens a new array.",
  "bay": {
   "width": 20,
   "depth": 40
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the up-range end of the corridor, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the four corridor boxes while moving down range.",
   "stopTime": "Last shot",
   "notes": "28 rounds: 12 IPSC targets (an overlapping and a stacked pair), 2 IPSC mini poppers, 2 IPSC metal plates. Baffles across the field split the arrays; a tall wall on the corridor's right keeps the safe angles."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     -2.825,
     10
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0.725,
     10
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4.275,
     10
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     7.825,
     10
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.825,
     19
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0.725,
     19
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4.275,
     19
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     7.825,
     19
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.825,
     28
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0.725,
     28
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4.275,
     28
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     7.825,
     28
    ],
    "rotation": 0,
    "params": {
     "length": 3.55,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     19.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     23.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     27.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     31.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -8.6,
     35.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     8
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     7
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     8.5
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "mini-popper",
    "position": [
     8.5,
     9
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     17
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     16
    ],
    "rotation": 0,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "plate-round",
    "position": [
     7,
     18
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.5,
     26
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4,
     25
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     7,
     26.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mini-popper",
    "position": [
     9,
     27
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1,
     35
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     34
    ],
    "rotation": 0,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "plate-round",
    "position": [
     8,
     36
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      1
     ],
     [
      -4.6,
      1
     ],
     [
      -4.6,
      5
     ],
     [
      -8,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      12
     ],
     [
      -4.6,
      12
     ],
     [
      -4.6,
      14
     ],
     [
      -8,
      14
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      21
     ],
     [
      -4.6,
      21
     ],
     [
      -4.6,
      23
     ],
     [
      -8,
      23
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -8,
      30
     ],
     [
      -4.6,
      30
     ],
     [
      -4.6,
      32
     ],
     [
      -8,
      32
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -6.3,
    2
   ],
   "facing": 0
  },
  "category": "long",
  "rounds": 28
 },
 {
  "id": "star-power",
  "name": "Star Power",
  "discipline": "USPSA",
  "summary": "A Texas star on one side, paper and a popper on the other.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas.",
   "stopTime": "Last shot",
   "notes": "14 rounds, Comstock: 4 USPSA targets, 1 popper, 1 Texas star (5 plates). The Texas star is not allowed in IPSC matches."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "texas-star",
    "position": [
     -3,
     15
    ],
    "rotation": 0,
    "params": {
     "plates": 5,
     "paint": "white"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     9
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.5,
     9
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     11
    ],
    "rotation": -15,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     14
    ],
    "rotation": 0,
    "params": {
     "hardCover": "lower-1/3"
    }
   },
   {
    "type": "popper",
    "position": [
     5.5,
     16
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6,
      1.5
     ],
     [
      -1,
      1.5
     ],
     [
      -1,
      4.5
     ],
     [
      -6,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      1,
      1.5
     ],
     [
      6,
      1.5
     ],
     [
      6,
      4.5
     ],
     [
      1,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -3,
    3
   ],
   "facing": 0
  },
  "category": "club",
  "rounds": 14
 },
 {
  "id": "rack-attack",
  "name": "Rack Attack",
  "discipline": "USPSA",
  "summary": "Clear a six-plate rack, then move left for paper and a popper.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from within the shooting areas.",
   "stopTime": "Last shot",
   "notes": "15 rounds minimum: 4 USPSA targets, 1 popper, 1 plate rack (6 plates). Plate racks are a club/USPSA prop, not IPSC."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     3,
     3.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     7.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     11.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3,
     15.0
    ],
    "rotation": 90,
    "params": {
     "length": 4.0,
     "height": 2.0
    }
   },
   {
    "type": "plate-rack",
    "position": [
     0,
     11.5
    ],
    "rotation": 0,
    "params": {
     "plates": 6,
     "paint": "white"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     8
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.8,
     9
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     7,
     11
    ],
    "rotation": -15,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     14
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     7.5,
     16
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -2,
      1.5
     ],
     [
      2,
      1.5
     ],
     [
      2,
      4.5
     ],
     [
      -2,
      4.5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      3.6,
      1.5
     ],
     [
      7,
      1.5
     ],
     [
      7,
      4.5
     ],
     [
      3.6,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3
   ],
   "facing": 0
  },
  "category": "club",
  "rounds": 15
 },
 {
  "id": "duel",
  "name": "High Noon Duel",
  "discipline": "USPSA",
  "summary": "Two shooters, one dueling tree: first to send all paddles over wins.",
  "bay": {
   "width": 14,
   "depth": 16
  },
  "briefing": {
   "scoring": "Head to head (win/lose), best of three",
   "startSignal": "Audible",
   "startPosition": "Each shooter standing in their box, facing down range, hands at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, each shooter engages the paddles on their own side of the tree, sending them to the other side. The first shooter to have all six paddles on the opponent's side wins.",
   "stopTime": "Last shot",
   "notes": "A club side match, not a USPSA or IPSC course. Minimum 6 rounds. Dueling trees are not allowed in IPSC."
  },
  "objects": [
   {
    "type": "dueling-tree",
    "position": [
     0,
     10
    ],
    "rotation": 0,
    "params": {
     "paint": "white"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      0.8,
      1.5
     ],
     [
      2.2,
      1.5
     ],
     [
      2.2,
      2.7
     ],
     [
      0.8,
      2.7
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      -2.2,
      1.5
     ],
     [
      -0.8,
      1.5
     ],
     [
      -0.8,
      2.7
     ],
     [
      -2.2,
      2.7
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    1.5,
    2.1
   ],
   "facing": 0
  },
  "category": "club",
  "rounds": 6
 },
 {
  "id": "moving-day",
  "name": "Moving Day",
  "discipline": "USPSA",
  "summary": "Poppers trigger a mover, a drop turner and a clamshell behind a T-wall.",
  "bay": {
   "width": 20,
   "depth": 30
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing upright in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage the targets from the shooting area. Popper P1 activates the mover T2. Popper P2 activates drop turner T4 and clamshell T5.",
   "stopTime": "Last shot",
   "notes": "14 rounds, Comstock: 3 USPSA targets, 1 mover, 1 drop turner, 1 clamshell, 2 poppers. Activated targets do not have to be engaged before they stop (USPSA disappearing-target rules apply)."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     0,
     2.66
    ],
    "rotation": 90,
    "params": {
     "length": 3.32,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     5.98
    ],
    "rotation": 90,
    "params": {
     "length": 3.32,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     9.3
    ],
    "rotation": 90,
    "params": {
     "length": 3.32,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     12.62
    ],
    "rotation": 90,
    "params": {
     "length": 3.32,
     "height": 2.0
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     15.94
    ],
    "rotation": 90,
    "params": {
     "length": 3.32,
     "height": 2.0
    }
   },
   {
    "type": "popper",
    "position": [
     -3.5,
     15
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "mover",
    "position": [
     -4,
     10.5
    ],
    "rotation": 0,
    "params": {
     "length": 4
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7,
     12.5
    ],
    "rotation": 20,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     13
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4,
     15.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     3,
     11
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "clamshell",
    "position": [
     6,
     12.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.8,
     9
    ],
    "rotation": -15,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -6,
      1.5
     ],
     [
      -0.6,
      1.5
     ],
     [
      -0.6,
      5
     ],
     [
      -6,
      5
     ]
    ],
    "closed": true
   },
   {
    "type": "shooting-area",
    "points": [
     [
      0.6,
      1.5
     ],
     [
      6,
      1.5
     ],
     [
      6,
      5
     ],
     [
      0.6,
      5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -3,
    3
   ],
   "facing": 0
  },
  "category": "club",
  "rounds": 14
 },
 {
  "id": "step-pad-trio",
  "name": "Step Pad Trio",
  "discipline": "IPSC",
  "summary": "Step onto three pads to bring up three moving targets: a clamshell, a drop turner and a swinger behind a panel.",
  "bay": {
   "width": 14,
   "depth": 14
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing outside the shooting area, uprange of it, arms hanging naturally",
   "gunCondition": "Unloaded and holstered (empty chamber, no magazine inserted)",
   "procedure": "On the start signal, step into the shooting area, load, and engage T1–T3 from within it. Each target moves when its step pad inside the box is pressed (one pad per target); all three hide again once they stop.",
   "stopTime": "Last shot",
   "notes": "Short course, 6 rounds, Comstock. Step pads are not modelled yet: read the three activators as foot pads in the box. T3 swings in and out behind a solid panel. Moving targets that disappear at rest are not a failure to engage if never shot."
  },
  "objects": [
   {
    "type": "clamshell",
    "position": [
     3.2,
     10
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     0,
     11
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "swinger",
    "position": [
     -3,
     10.5
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "wall-solid",
    "position": [
     -3,
     9.4
    ],
    "rotation": 0,
    "params": {
     "length": 1,
     "height": 1.8
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1.2,
      2.8
     ],
     [
      1.2,
      2.8
     ],
     [
      1.2,
      5.2
     ],
     [
      -1.2,
      5.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 6,
  "inspiredBy": "Inspired by stage 1 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "lockbox-swinger",
  "name": "Lockbox Swinger",
  "discipline": "IPSC",
  "summary": "The pistol waits in a case on a table; lifting the lid sets a swinger going between two static targets.",
  "bay": {
   "width": 16,
   "depth": 22
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area facing the table, fingers interlaced on top of the head",
   "gunCondition": "Loaded pistol in the closed case on the table, muzzle pointing down range",
   "procedure": "On the start signal, open the case, take the pistol and engage T1–T3 from within the shooting area. Lifting the lid starts the swinger.",
   "stopTime": "Last shot",
   "notes": "Short course, 6 rounds, Comstock. The case and its lid activator are not separate props yet: the table stands in for them. The two static targets are far and wide, the swinger is closer and central."
  },
  "objects": [
   {
    "type": "table",
    "position": [
     0,
     3.2
    ],
    "rotation": 0,
    "params": {
     "length": 1.2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     19
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.5,
     19
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "swinger",
    "position": [
     0.5,
     11
    ],
    "rotation": -5,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.8,
      1.2
     ],
     [
      0.8,
      1.2
     ],
     [
      0.8,
      2.7
     ],
     [
      -0.8,
      2.7
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 6,
  "inspiredBy": "Inspired by stage 2 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "four-shutters",
  "name": "Four Shutters",
  "discipline": "IPSC",
  "summary": "A wall of four low ports, each opened by a lever, with six targets split by stacked blue barrels.",
  "bay": {
   "width": 16,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage T1–T6 from within the shooting area. Each port is closed by a shutter that opens when its lever is pulled.",
   "stopTime": "Last shot",
   "notes": "Short course, 12 rounds, Comstock. Port shutters and levers are not modelled yet; the ports are shown open. Barrels between the arrays force the shooter to pick the right port for each pair."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     3,
     4
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 1.6,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 0.9
    }
   },
   {
    "type": "wall-port",
    "position": [
     1,
     4
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 1.6,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 0.9
    }
   },
   {
    "type": "wall-port",
    "position": [
     -1,
     4
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 1.6,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 0.9
    }
   },
   {
    "type": "wall-port",
    "position": [
     -3,
     4
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 1.6,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 0.9
    }
   },
   {
    "type": "barrel",
    "position": [
     2,
     8.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     0,
     8.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -2,
     8.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.5,
     10.5
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.4,
     11.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.7,
     11.8
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.7,
     11.8
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.4,
     11.5
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     10.5
    ],
    "rotation": 30,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -3.8,
      1.5
     ],
     [
      3.8,
      1.5
     ],
     [
      3.8,
      3.5
     ],
     [
      -3.8,
      3.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 12,
  "inspiredBy": "Inspired by stage 3 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "funnel-window",
  "name": "Funnel Window",
  "discipline": "IPSC",
  "summary": "Three ports in a long wall; the centre port is flanked by wing walls that funnel the view down range.",
  "bay": {
   "width": 20,
   "depth": 20
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Unloaded and holstered (empty chamber, no magazine inserted)",
   "procedure": "On the start signal, load and engage T1–T8 and the steel from within the shooting area, through the ports or around the wall ends.",
   "stopTime": "Last shot",
   "notes": "Medium course, 20 rounds, Comstock. Four plain targets on the left through the left port, two no-shoot-covered and two hard-cover targets through the centre funnel, steel on the right through the right port. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     2.8,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 2.6,
     "height": 1.8,
     "portWidth": 0.6,
     "portHeight": 0.6,
     "portBottom": 0.9
    }
   },
   {
    "type": "wall-port",
    "position": [
     0,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 2.8,
     "height": 1.8,
     "portWidth": 0.7,
     "portHeight": 0.45,
     "portBottom": 1
    }
   },
   {
    "type": "wall-port",
    "position": [
     -2.8,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 2.6,
     "height": 1.8,
     "portWidth": 0.7,
     "portHeight": 0.45,
     "portBottom": 1
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0.75,
     5.6
    ],
    "rotation": 90,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -0.75,
     5.6
    ],
    "rotation": 90,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     10
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.6,
     10.4
    ],
    "rotation": -35,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.7,
     10.8
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3.8,
     11.2
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.5,
     13
    ],
    "rotation": -5,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.5,
     13.3
    ],
    "rotation": 5,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.6,
     10
    ],
    "rotation": -5,
    "params": {
     "hardCover": "lower-1/2"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.6,
     10
    ],
    "rotation": 5,
    "params": {
     "hardCover": "lower-1/2"
    }
   },
   {
    "type": "popper",
    "position": [
     -5.5,
     15
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -6.3,
     15.2
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     -6.5,
     11.5
    ],
    "rotation": 35,
    "params": {}
   },
   {
    "type": "plate-round",
    "position": [
     -7,
     12.5
    ],
    "rotation": 35,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -4,
      1.5
     ],
     [
      4,
      1.5
     ],
     [
      4,
      3.8
     ],
     [
      -4,
      3.8
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.3
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 20,
  "inspiredBy": "Inspired by stage 4 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "three-windows-wide",
  "name": "Three Windows Wide",
  "discipline": "IPSC",
  "summary": "Two square ports and a low slot in one wall, with paper round the ends and three poppers down range.",
  "bay": {
   "width": 20,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage T1–T4 and the three poppers from within the shooting area. Targets may be shot through the ports or around the ends of the wall.",
   "stopTime": "Last shot",
   "notes": "Short course, 11 rounds, Comstock. The low centre slot sees only the far popper; the outer targets need a lean round the wall ends. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     2,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.8,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 1
    }
   },
   {
    "type": "wall-port",
    "position": [
     -2,
     4.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.8,
     "portWidth": 0.5,
     "portHeight": 0.45,
     "portBottom": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     7
    ],
    "rotation": -55,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     7
    ],
    "rotation": 55,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.8,
     10
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.8,
     10
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     0,
     14.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     5,
     13
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -5,
     13
    ],
    "rotation": 25,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -3.8,
      1.5
     ],
     [
      3.8,
      1.5
     ],
     [
      3.8,
      3.8
     ],
     [
      -3.8,
      3.8
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 11,
  "inspiredBy": "Inspired by stage 5 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "barrel-gate",
  "name": "Barrel Gate",
  "discipline": "IPSC",
  "summary": "A tapering field course: walls on both flanks, a long low wall at the far end and a disappearing activated target.",
  "bay": {
   "width": 20,
   "depth": 28
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing with the toes on the start marks at the left rear corner, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area. Shooting the left popper pair releases the drop turner, which hides again once it stops.",
   "stopTime": "Last shot",
   "notes": "Long course, 28 rounds, Comstock. Order is free: left flank pairs behind the two walls, the three heads over the far wall, the barrel pair on the right, then the port on the right flank. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     6.4,
     3.2
    ],
    "rotation": 90,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.4,
     7.6
    ],
    "rotation": 90,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     2.2
    ],
    "rotation": -120,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     6.6
    ],
    "rotation": -95,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "wall-wood",
    "position": [
     0,
     15.5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.3
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.4,
     16.4
    ],
    "rotation": -10,
    "params": {
     "mountHeight": 0.95
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     16.4
    ],
    "rotation": 0,
    "params": {
     "mountHeight": 0.95
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.4,
     16.4
    ],
    "rotation": 10,
    "params": {
     "mountHeight": 0.95
    }
   },
   {
    "type": "barrel",
    "position": [
     2.6,
     14.6
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     7.6,
     15.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     8.3,
     15.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "drop-turner",
    "position": [
     6.8,
     17
    ],
    "rotation": -35,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     5,
     18
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4.3,
     18.2
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -8,
     10.6
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.4,
     12
    ],
    "rotation": 55,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "wall-port",
    "position": [
     -6.3,
     4
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.5,
     "portBottom": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9,
     3.2
    ],
    "rotation": 100,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9,
     5
    ],
    "rotation": 75,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -9.3,
     7
    ],
    "rotation": 90,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -9.3,
     7.8
    ],
    "rotation": 85,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      5.5,
      1.5
     ],
     [
      -5.5,
      1.5
     ],
     [
      -5.5,
      7.5
     ],
     [
      -2.5,
      12
     ],
     [
      2.5,
      12
     ],
     [
      5.5,
      7.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    5,
    2
   ],
   "facing": 0
  },
  "size": "long",
  "category": "nationals",
  "rounds": 28,
  "inspiredBy": "Inspired by stage 6 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "corridor-advance",
  "name": "Corridor Advance",
  "discipline": "IPSC",
  "summary": "A long, narrow shooting lane run down range, with targets peeking from behind barrels and walls on both sides.",
  "bay": {
   "width": 20,
   "depth": 26
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the up-range end of the lane, toes on the start marks, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, move down the lane and engage T1–T8 from within it.",
   "stopTime": "Last shot",
   "notes": "Medium course, 16 rounds, Comstock. Each target is visible from only a short stretch of the lane, so the stage rewards planning where to stop. Has a twin, Corridor Retreat, with the same idea run the other way."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     2,
     22
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     22.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     22
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     3.4,
     12.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4,
     13.6
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -2.6,
     11.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -3.3,
     11.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4,
     13.6
    ],
    "rotation": 40,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.6,
     14.8
    ],
    "rotation": 40,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "barrel",
    "position": [
     -7,
     18.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -7.7,
     18.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.3,
     19.6
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     4.2,
     7
    ],
    "rotation": 0,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     4.2,
     9.2
    ],
    "rotation": 0,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.6,
     8.1
    ],
    "rotation": -70,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     -4,
     9
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.5
     ],
     [
      0.6,
      1.5
     ],
     [
      0.6,
      16
     ],
     [
      -0.6,
      16
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 16,
  "inspiredBy": "Inspired by stage 7 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "corridor-retreat",
  "name": "Corridor Retreat",
  "discipline": "IPSC",
  "summary": "The same narrow lane idea run up range: start at the far end and back out, picking off targets as they appear.",
  "bay": {
   "width": 20,
   "depth": 26
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the down-range end of the lane facing down range, toes on the start marks, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage T1–T8 from within the lane while moving back up range.",
   "stopTime": "Last shot",
   "notes": "Medium course, 16 rounds, Comstock. Mirror of Corridor Advance. Retreating keeps the muzzle down range; mind the 180° line when turning. Watch the far targets first while they are closest."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     22
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     22.5
    ],
    "rotation": 0,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2,
     22
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -3.4,
     12.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4,
     13.6
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     2.6,
     11.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     3.3,
     11.8
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4,
     13.6
    ],
    "rotation": -40,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     4.6,
     14.8
    ],
    "rotation": -40,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "barrel",
    "position": [
     7,
     18.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     7.7,
     18.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8.3,
     19.6
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     -4.2,
     7
    ],
    "rotation": 0,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4.2,
     9.2
    ],
    "rotation": 0,
    "params": {
     "length": 2.4,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.6,
     8.1
    ],
    "rotation": 70,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     4,
     9
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.6,
      1.5
     ],
     [
      0.6,
      1.5
     ],
     [
      0.6,
      16
     ],
     [
      -0.6,
      16
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    15.5
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 16,
  "inspiredBy": "Inspired by stage 8 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "steel-picket",
  "name": "Steel Picket",
  "discipline": "IPSC",
  "summary": "Paper and poppers alternate in one line across the bay, with two more poppers hidden behind wing walls.",
  "bay": {
   "width": 20,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage T1–T3 and all five poppers from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Short course, 11 rounds, Comstock. The outer poppers can only be seen by leaning out to the ends of the box. A classic standing speed stage; a 'best one hit per paper' variant is common at matches."
  },
  "objects": [
   {
    "type": "paper-ipsc",
    "position": [
     3,
     10.5
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     10.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     10.5
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     1.5,
     11.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -1.5,
     11.5
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4.5,
     11.8
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -4.5,
     11.8
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     6,
     9
    ],
    "rotation": -60,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6,
     9
    ],
    "rotation": 60,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "popper",
    "position": [
     7.5,
     10.5
    ],
    "rotation": -30,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -3,
      1.5
     ],
     [
      3,
      1.5
     ],
     [
      3,
      3
     ],
     [
      -3,
      3
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 11,
  "inspiredBy": "Inspired by stage 9 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "popper-curtain",
  "name": "Popper Curtain",
  "discipline": "IPSC",
  "summary": "Three big poppers stand in front of a barrel screen; each one sets a hidden paper target moving.",
  "bay": {
   "width": 16,
   "depth": 16
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, fingers interlaced on top of the head",
   "gunCondition": "Unloaded and holstered (empty chamber, no magazine inserted)",
   "procedure": "On the start signal, load and engage the poppers and the three moving targets from within the shooting area. Each popper releases one moving target.",
   "stopTime": "Last shot",
   "notes": "Short course, 9 rounds, Comstock. The barrel screen behind the poppers hides the centre drop turner until it falls. Steel must fall. Activated targets that hide again at rest are not a failure to engage if missed."
  },
  "objects": [
   {
    "type": "popper",
    "position": [
     0.9,
     8.5
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     0,
     8.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -0.9,
     8.5
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     1.3,
     10.2
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -1.3,
     10.2
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     0,
     10.8
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "clamshell",
    "position": [
     5,
     10.5
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "swinger",
    "position": [
     -5,
     10.5
    ],
    "rotation": 30,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.8,
      1.4
     ],
     [
      0.8,
      1.4
     ],
     [
      0.8,
      2.8
     ],
     [
      -0.8,
      2.8
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 9,
  "inspiredBy": "Inspired by stage 10 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "zigzag-run",
  "name": "Zigzag Run",
  "discipline": "IPSC",
  "summary": "A stepped shooting area behind a run of offset walls, steel in front of no-shoots and a low wall of mixed paper.",
  "bay": {
   "width": 20,
   "depth": 26
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing with the toes on the start marks at the right rear corner, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Long course, 30 rounds, Comstock. Steel placed in front of no-shoots punishes a low miss. The left-hand low wall hides the lower half of three targets mixed with no-shoots. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     6.1,
     4.5
    ],
    "rotation": 90,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.7,
     7.2
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     9.2
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.4
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -4.8,
     6.7
    ],
    "rotation": 0,
    "params": {
     "length": 1.8,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -6.6,
     6.7
    ],
    "rotation": 0,
    "params": {
     "length": 1.8,
     "height": 2
    }
   },
   {
    "type": "wall-wood",
    "position": [
     7.5,
     13
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 0.9
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8,
     14
    ],
    "rotation": -45,
    "params": {
     "presentation": "two-ns-between"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.6,
     14.2
    ],
    "rotation": -40,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9,
     7
    ],
    "rotation": -70,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.2,
     8.2
    ],
    "rotation": -60,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -0.8,
     11.6
    ],
    "rotation": 0,
    "params": {
     "mountHeight": 0.9
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.8,
     11.6
    ],
    "rotation": -15,
    "params": {
     "mountHeight": 0.9
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8,
     10.5
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.7,
     11.3
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.3,
     12.1
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.5,
     4.6
    ],
    "rotation": 75,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.5,
     5.6
    ],
    "rotation": 60,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     7,
     17
    ],
    "rotation": -35,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     8,
     17
    ],
    "rotation": -35,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     9,
     17
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     7,
     17.7
    ],
    "rotation": -30,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8,
     17.7
    ],
    "rotation": -35,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9,
     17.7
    ],
    "rotation": -40,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "popper",
    "position": [
     3,
     16.5
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     17.2
    ],
    "rotation": -20,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "popper",
    "position": [
     -5,
     14
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -5.8,
     14.4
    ],
    "rotation": 25,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      5.5,
      2
     ],
     [
      -6.3,
      2
     ],
     [
      -6.3,
      6
     ],
     [
      -4,
      6
     ],
     [
      -4,
      8.5
     ],
     [
      2,
      8.5
     ],
     [
      2,
      6.5
     ],
     [
      5.5,
      6.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    -5.8,
    2.4
   ],
   "facing": 0
  },
  "size": "long",
  "category": "nationals",
  "rounds": 30,
  "inspiredBy": "Inspired by stage 11 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "twin-flip-gallery",
  "name": "Twin Flip Gallery",
  "discipline": "IPSC",
  "summary": "Four poppers in the middle release two clamshells at the sides, with walls and barrels framing the near targets.",
  "bay": {
   "width": 20,
   "depth": 22
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area. The two outer poppers each open one clamshell.",
   "stopTime": "Last shot",
   "notes": "Medium course, 16 rounds, Comstock. Two free-standing walls with a barrel behind each split the view into three lanes. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     2.2,
     5.2
    ],
    "rotation": 0,
    "params": {
     "length": 2.2,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.2,
     5.2
    ],
    "rotation": 0,
    "params": {
     "length": 2.2,
     "height": 2
    }
   },
   {
    "type": "barrel",
    "position": [
     2,
     6.2
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -2,
     6.2
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "popper",
    "position": [
     1.6,
     15.5
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     0.5,
     15.7
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -0.5,
     15.7
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -1.6,
     15.5
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "clamshell",
    "position": [
     6,
     15
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "clamshell",
    "position": [
     -6,
     15
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     8.5,
     8
    ],
    "rotation": -55,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     8.5,
     11
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.5,
     8
    ],
    "rotation": 55,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.5,
     11
    ],
    "rotation": 45,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -5.5,
      1.5
     ],
     [
      5.5,
      1.5
     ],
     [
      5.5,
      3.6
     ],
     [
      -5.5,
      3.6
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.4
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 16,
  "inspiredBy": "Inspired by stage 12 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "table-load",
  "name": "Table Load",
  "discipline": "IPSC",
  "summary": "Pistol and all magazines start on a table; load, then work through walls to paper and steel on both flanks.",
  "bay": {
   "width": 20,
   "depth": 22
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area behind the table, arms hanging naturally",
   "gunCondition": "Unloaded pistol, slide forward and hammer down or striker released, and all magazines on the table",
   "procedure": "On the start signal, pick up the pistol, load from a magazine on the table and engage all targets from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Medium course, 16 rounds, Comstock. Magazines may not be loaded onto the belt before the signal. The wide left wall hides the far left targets until the shooter moves right; the stacked pair sits beside the right port wall. Steel must fall."
  },
  "objects": [
   {
    "type": "table",
    "position": [
     -1.8,
     3.2
    ],
    "rotation": 0,
    "params": {
     "length": 1.2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     1.5,
     7
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2
    }
   },
   {
    "type": "wall-port",
    "position": [
     -3,
     6.5
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2,
     "portWidth": 0.5,
     "portHeight": 0.6,
     "portBottom": 0.9
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.2,
     9
    ],
    "rotation": 40,
    "params": {
     "presentation": "stacked"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     18.5
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4,
     18.7
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2,
     18.5
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -3,
     18.7
    ],
    "rotation": 10,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     9,
     7.5
    ],
    "rotation": -60,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     9.2,
     9.5
    ],
    "rotation": -55,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     9.3,
     10.5
    ],
    "rotation": -50,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.5,
     7
    ],
    "rotation": 65,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -4,
      1.4
     ],
     [
      4,
      1.4
     ],
     [
      4,
      3.9
     ],
     [
      -4,
      3.9
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 16,
  "inspiredBy": "Inspired by stage 13 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "tyre-line-mover",
  "name": "Tyre Line Mover",
  "discipline": "IPSC",
  "summary": "A full-width box behind three tyre stacks, paper on both flanks and a popper-released mover crossing at the back.",
  "bay": {
   "width": 20,
   "depth": 28
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the left end of the shooting area, heels on the start marks, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area. The leftmost popper starts the mover, which hides again behind the far wall at the end of its run.",
   "stopTime": "Last shot",
   "notes": "Long course, 32 rounds, Comstock. Twin pairs sit between the tyre stacks; the low wall behind them hides the far middle. Steel must fall. A real-match version used a carrier with several targets on one track."
  },
  "objects": [
   {
    "type": "tyre-stack",
    "position": [
     4,
     3.6
    ],
    "rotation": 0,
    "params": {
     "count": 5
    }
   },
   {
    "type": "tyre-stack",
    "position": [
     0,
     3.6
    ],
    "rotation": 0,
    "params": {
     "count": 5
    }
   },
   {
    "type": "tyre-stack",
    "position": [
     -4,
     3.6
    ],
    "rotation": 0,
    "params": {
     "count": 5
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.6,
     6.6
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.4,
     6.6
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.4,
     6.6
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.6,
     6.6
    ],
    "rotation": 30,
    "params": {}
   },
   {
    "type": "wall-wood",
    "position": [
     0,
     8.4
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     6.5
    ],
    "rotation": -65,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     9
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     12
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.3,
     6.5
    ],
    "rotation": 65,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     9
    ],
    "rotation": 45,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.3,
     12
    ],
    "rotation": 45,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4.2,
     12.5
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     3.5,
     12.7
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -3.5,
     12.7
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -4.2,
     12.5
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     14.5
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "mover",
    "position": [
     1,
     20
    ],
    "rotation": 0,
    "params": {
     "length": 6
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.5,
     19.6
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     6.5,
     19.6
    ],
    "rotation": 0,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     22
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.5,
     22
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.5,
     23
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -7.5,
      1
     ],
     [
      7.5,
      1
     ],
     [
      7.5,
      3
     ],
     [
      -7.5,
      3
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    6.8,
    1.6
   ],
   "facing": 0
  },
  "size": "long",
  "category": "nationals",
  "rounds": 32,
  "inspiredBy": "Inspired by stage 14 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "wishbone",
  "name": "Wishbone",
  "discipline": "IPSC",
  "summary": "A forked shooting area: start at either wing tip, sweep the flank pairs and push up the centre spur for the far steel.",
  "bay": {
   "width": 20,
   "depth": 26
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing with the toes on either pair of start marks at the wing tips, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage T1–T7 and the three poppers from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Medium course, 17 rounds, Comstock. Angled walls in front of each wing hide the flank pairs from the centre; the spur is the only place that sees the far targets. Two start positions: the shooter chooses."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     5.6,
     7
    ],
    "rotation": -35,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.8,
     6.9
    ],
    "rotation": 0,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -5.6,
     7
    ],
    "rotation": 35,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.8,
     6.9
    ],
    "rotation": 0,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.5,
     10.3
    ],
    "rotation": 5,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.5,
     10.3
    ],
    "rotation": -5,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8.6,
     10
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.5,
     10.6
    ],
    "rotation": -35,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.6,
     10
    ],
    "rotation": 30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.5,
     10.6
    ],
    "rotation": 35,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     11.4
    ],
    "rotation": -85,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     11.4
    ],
    "rotation": 85,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     20
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     5,
     19
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -5,
     19
    ],
    "rotation": 30,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     2.5,
     21
    ],
    "rotation": -15,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      8,
      5.5
     ],
     [
      4.5,
      3
     ],
     [
      -4.5,
      3
     ],
     [
      -8,
      5.5
     ],
     [
      -7.2,
      6.5
     ],
     [
      -4.5,
      4.6
     ],
     [
      -1.2,
      4.6
     ],
     [
      -1.2,
      11.5
     ],
     [
      1.2,
      11.5
     ],
     [
      1.2,
      4.6
     ],
     [
      4.5,
      4.6
     ],
     [
      7.2,
      6.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    7.3,
    5.6
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 17,
  "inspiredBy": "Inspired by stage 15 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "pillar-hug",
  "name": "Pillar Hug",
  "discipline": "IPSC",
  "summary": "Start with both hands on a narrow pillar barricade; two moving targets and a centre target guarded by no-shoots.",
  "bay": {
   "width": 16,
   "depth": 20
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, hands touching the sides of the barricade",
   "gunCondition": "Unloaded and holstered (empty chamber, no magazine inserted)",
   "procedure": "On the start signal, load and engage all targets from within the shooting area. The left popper releases the drop turner; the right popper releases the swinger.",
   "stopTime": "Last shot",
   "notes": "Short course, 8 rounds, Comstock. The barricade is narrow, so the shooter must lean out either side. The drop turner hides again at rest. Each popper stands in front of a no-shoot. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-solid",
    "position": [
     0,
     3.4
    ],
    "rotation": 0,
    "params": {
     "length": 0.6,
     "height": 2.2
    }
   },
   {
    "type": "popper",
    "position": [
     1.1,
     15
    ],
    "rotation": -5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -1.1,
     15
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.1,
     15.7
    ],
    "rotation": -5,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.1,
     15.7
    ],
    "rotation": 5,
    "params": {
     "presentation": "noshoot"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     16.3
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "drop-turner",
    "position": [
     4,
     10.5
    ],
    "rotation": -25,
    "params": {}
   },
   {
    "type": "swinger",
    "position": [
     -4,
     11
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -5.3,
     11.4
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -5.3,
     12.1
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.7,
      1.5
     ],
     [
      0.7,
      1.5
     ],
     [
      0.7,
      2.9
     ],
     [
      -0.7,
      2.9
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 8,
  "inspiredBy": "Inspired by stage 16 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "bay-window",
  "name": "Bay Window",
  "discipline": "IPSC",
  "summary": "One wall with a single port and swept-back wings: steel through the port, paper round the wings.",
  "bay": {
   "width": 20,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area, through the port or around the wall ends.",
   "stopTime": "Last shot",
   "notes": "Short course, 10 rounds, Comstock. The wings angle back toward the shooter, so the flank targets need a deep lean. The four poppers sit on an arc behind the port. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     0,
     4.4
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1.8,
     "portWidth": 0.6,
     "portHeight": 0.6,
     "portBottom": 0.9
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     3.9
    ],
    "rotation": -50,
    "params": {
     "length": 1.3,
     "height": 1.8
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     3.9
    ],
    "rotation": 50,
    "params": {
     "length": 1.3,
     "height": 1.8
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.2,
     6.5
    ],
    "rotation": -50,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.2,
     6.5
    ],
    "rotation": 50,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     14
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     2.5,
     12
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -2.5,
     12
    ],
    "rotation": 15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4,
     10
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -4,
     10
    ],
    "rotation": 30,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -2.3,
      1.5
     ],
     [
      2.3,
      1.5
     ],
     [
      2.3,
      3.2
     ],
     [
      -2.3,
      3.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 10,
  "inspiredBy": "Inspired by stage 17 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "split-wall",
  "name": "Split Wall",
  "discipline": "IPSC",
  "summary": "A wall split by a short divider: steel over no-shoots on one side, covered paper on the other.",
  "bay": {
   "width": 20,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area, over the wall or through its two ports.",
   "stopTime": "Last shot",
   "notes": "Short course, 12 rounds, Comstock. Four poppers stand above the wall line in front of no-shoots; the divider stops the shooter seeing both halves from one spot. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-port",
    "position": [
     1.6,
     4.8
    ],
    "rotation": 0,
    "params": {
     "length": 3.2,
     "height": 1.3,
     "portWidth": 0.6,
     "portHeight": 0.35,
     "portBottom": 0.3
    }
   },
   {
    "type": "wall-port",
    "position": [
     -1.6,
     4.8
    ],
    "rotation": 0,
    "params": {
     "length": 3.2,
     "height": 1.3,
     "portWidth": 0.7,
     "portHeight": 0.4,
     "portBottom": 0.7
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     5.6
    ],
    "rotation": 90,
    "params": {
     "length": 1.4,
     "height": 2
    }
   },
   {
    "type": "popper",
    "position": [
     0.8,
     8.5
    ],
    "rotation": -10,
    "params": {
     "baseHeight": 0.6
    }
   },
   {
    "type": "popper",
    "position": [
     1.6,
     8.5
    ],
    "rotation": -15,
    "params": {
     "baseHeight": 0.6
    }
   },
   {
    "type": "popper",
    "position": [
     2.4,
     8.5
    ],
    "rotation": -25,
    "params": {
     "baseHeight": 0.6
    }
   },
   {
    "type": "popper",
    "position": [
     3.2,
     8.5
    ],
    "rotation": -30,
    "params": {
     "baseHeight": 0.6
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.8,
     9.2
    ],
    "rotation": -5,
    "params": {
     "presentation": "noshoot",
     "mountHeight": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.6,
     9.2
    ],
    "rotation": -15,
    "params": {
     "presentation": "noshoot",
     "mountHeight": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.4,
     9.2
    ],
    "rotation": -20,
    "params": {
     "presentation": "noshoot",
     "mountHeight": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     3.2,
     9.2
    ],
    "rotation": -25,
    "params": {
     "presentation": "noshoot",
     "mountHeight": 1
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -1.2,
     8.5
    ],
    "rotation": 10,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.3,
     8.5
    ],
    "rotation": 20,
    "params": {
     "presentation": "ns-lower"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     13
    ],
    "rotation": 25,
    "params": {
     "presentation": "two-ns-between"
    }
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -3.2,
      1.5
     ],
     [
      3.2,
      1.5
     ],
     [
      3.2,
      4.2
     ],
     [
      -3.2,
      4.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 12,
  "inspiredBy": "Inspired by stage 18 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "porch-start",
  "name": "Porch Start",
  "discipline": "IPSC",
  "summary": "Start with both palms flat on marks on a low porch wall, then shoot out of both sides of the porch.",
  "bay": {
   "width": 20,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing inside the porch, palms flat on the marks on top of the front wall",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area. The fault lines on each side of the porch must not be crossed.",
   "stopTime": "Last shot",
   "notes": "Short course, 11 rounds, Comstock. The front wall is waist high; the back wall and the centre divider split the left and right target groups. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-wood",
    "position": [
     0,
     4.2
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0.3,
     7
    ],
    "rotation": 0,
    "params": {
     "length": 3.2,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     0,
     5.6
    ],
    "rotation": 90,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     9.5
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.6,
     10
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     7.7,
     10.5
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     7,
     14
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4,
     13
    ],
    "rotation": 20,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "popper",
    "position": [
     -6,
     13.5
    ],
    "rotation": 30,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -7,
     13.5
    ],
    "rotation": 35,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1.9,
      2
     ],
     [
      1.9,
      2
     ],
     [
      1.9,
      4
     ],
     [
      -1.9,
      4
     ]
    ],
    "closed": true
   },
   {
    "type": "fault-line",
    "points": [
     [
      1.9,
      4
     ],
     [
      2.4,
      7
     ]
    ],
    "closed": false
   },
   {
    "type": "fault-line",
    "points": [
     [
      -1.9,
      4
     ],
     [
      -2.4,
      7
     ]
    ],
    "closed": false
   }
  ],
  "start": {
   "position": [
    0,
    3.6
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 11,
  "inspiredBy": "Inspired by stage 19 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "dogleg",
  "name": "Dogleg",
  "discipline": "IPSC",
  "summary": "Start in the near-left corner, work up a corridor and out along a wide far band with walls on every side.",
  "bay": {
   "width": 20,
   "depth": 26
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the left rear corner, toes on the start marks, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Medium course, 20 rounds, Comstock. The corridor gives short windows to the near targets; the far band opens up the steel and the paper behind the port wall. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     4,
     4.6
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.4,
     4
    ],
    "rotation": 70,
    "params": {
     "length": 1.2,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     8.8,
     6
    ],
    "rotation": -55,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     5,
     6.6
    ],
    "rotation": -80,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     -4.6,
     6
    ],
    "rotation": 0,
    "params": {
     "length": 3,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6,
     7.2
    ],
    "rotation": 75,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7.5,
     4
    ],
    "rotation": 100,
    "params": {}
   },
   {
    "type": "wall-mesh",
    "position": [
     4.5,
     15.6
    ],
    "rotation": 80,
    "params": {
     "length": 2,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     0.5,
     16.5
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     2.5,
     17
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     3.2,
     17.3
    ],
    "rotation": -15,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     8,
     16
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     8.7,
     16.4
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "wall-port",
    "position": [
     -4,
     16
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2,
     "portWidth": 0.6,
     "portHeight": 0.5,
     "portBottom": 1
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -1.7,
     15.5
    ],
    "rotation": 80,
    "params": {
     "length": 1.4,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3,
     17.2
    ],
    "rotation": 25,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5,
     17.2
    ],
    "rotation": 35,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -8.5,
     15.5
    ],
    "rotation": 55,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      6,
      1.5
     ],
     [
      -1,
      1.5
     ],
     [
      -1,
      9
     ],
     [
      -6,
      12
     ],
     [
      6,
      12
     ],
     [
      6,
      10
     ],
     [
      1.5,
      10
     ],
     [
      1.5,
      3
     ],
     [
      6,
      3
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    5.4,
    2
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 20,
  "inspiredBy": "Inspired by stage 20 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "octagon-house",
  "name": "Octagon House",
  "discipline": "IPSC",
  "summary": "An eight-sided shooting area with two open-backed walls inside, paper pairs on both flanks and steel-released targets far out.",
  "bay": {
   "width": 20,
   "depth": 24
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the rear of the shooting area, heels touching the back fault line, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area. The far left popper releases the swinger behind the barrels.",
   "stopTime": "Last shot",
   "notes": "Long course, 26 rounds, Comstock. The inside walls block each flank from the centre, so the shooter works each side from its own wall end. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     5.2
    ],
    "rotation": 90,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     2.5,
     9.3
    ],
    "rotation": 90,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     5.2
    ],
    "rotation": 90,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -2.5,
     9.3
    ],
    "rotation": 90,
    "params": {
     "length": 2.6,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     3.5,
     11.8
    ],
    "rotation": 0,
    "params": {
     "length": 1.8,
     "height": 2
    }
   },
   {
    "type": "wall-mesh",
    "position": [
     -3.5,
     11.8
    ],
    "rotation": 0,
    "params": {
     "length": 1.8,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     4.5
    ],
    "rotation": -110,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     9.3,
     9
    ],
    "rotation": -75,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.3,
     4.5
    ],
    "rotation": 110,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -9.3,
     9.5
    ],
    "rotation": 70,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "barrel",
    "position": [
     -9,
     7
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     8,
     16
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     8,
     16.6
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "swinger",
    "position": [
     6.8,
     16.8
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     3,
     16
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     16.8
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -0.9,
     16
    ],
    "rotation": 5,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     1.5,
     17.8
    ],
    "rotation": -10,
    "params": {}
   },
   {
    "type": "barrel",
    "position": [
     -6.2,
     15.5
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7.2,
     16.2
    ],
    "rotation": 40,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     -7.6,
     15
    ],
    "rotation": 45,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      3.5,
      2
     ],
     [
      -3.5,
      2
     ],
     [
      -6,
      4.5
     ],
     [
      -6,
      9.5
     ],
     [
      -3.5,
      12
     ],
     [
      3.5,
      12
     ],
     [
      6,
      9.5
     ],
     [
      6,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2.3
   ],
   "facing": 0
  },
  "size": "long",
  "category": "nationals",
  "rounds": 26,
  "inspiredBy": "Inspired by stage 21 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "chicane",
  "name": "Chicane",
  "discipline": "IPSC",
  "summary": "A narrow corridor broken by three staggered walls; each gap opens a different group on the flanks.",
  "bay": {
   "width": 18,
   "depth": 22
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing at the rear of the corridor, heels on the start marks, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Medium course, 20 rounds, Comstock. The staggered walls make the shooter weave left and right on the way down range. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-wood",
    "position": [
     2,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2
    }
   },
   {
    "type": "wall-wood",
    "position": [
     -1.6,
     8
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2
    }
   },
   {
    "type": "wall-wood",
    "position": [
     2,
     10.8
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 2
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     3.8
    ],
    "rotation": -80,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6.5,
     7.6
    ],
    "rotation": -85,
    "params": {
     "presentation": "two-overlap"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     1.2,
     14
    ],
    "rotation": -30,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3,
     14
    ],
    "rotation": -45,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     6,
     13.5
    ],
    "rotation": -55,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     5.2,
     13.8
    ],
    "rotation": -50,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     13
    ],
    "rotation": 60,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -6.5,
     9.5
    ],
    "rotation": 65,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -7,
     5
    ],
    "rotation": 80,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -1.8,
      1.5
     ],
     [
      1.8,
      1.5
     ],
     [
      1.8,
      10.2
     ],
     [
      -1.8,
      10.2
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    1.9
   ],
   "facing": 0
  },
  "size": "medium",
  "category": "nationals",
  "rounds": 20,
  "inspiredBy": "Inspired by stage 22 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "wobble-deck",
  "name": "Wobble Deck",
  "discipline": "IPSC",
  "summary": "The shooting area is a raised deck; a hanging rope may be held for balance while five paper and a popper are engaged.",
  "bay": {
   "width": 18,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing on the deck, arms hanging naturally",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets while standing on the deck. The rope may be held for balance; stepping off the deck is a procedural.",
   "stopTime": "Last shot",
   "notes": "Short course, 11 rounds, Comstock. The original idea uses an unstable (wobble) deck and a rope; here a fixed platform stands in until those props exist. A step box behind the deck helps the shooter up."
  },
  "objects": [
   {
    "type": "platform",
    "position": [
     0,
     3.8
    ],
    "rotation": 0,
    "params": {
     "length": 1.6,
     "width": 1.4,
     "height": 0.3
    }
   },
   {
    "type": "crate",
    "position": [
     0,
     2.6
    ],
    "rotation": 0,
    "params": {
     "size": 0.4
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     6,
     11
    ],
    "rotation": -40,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     3.2,
     12.5
    ],
    "rotation": -20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     0,
     13.5
    ],
    "rotation": 0,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -3.2,
     12
    ],
    "rotation": 20,
    "params": {}
   },
   {
    "type": "paper-ipsc",
    "position": [
     -5.8,
     11.5
    ],
    "rotation": 35,
    "params": {}
   },
   {
    "type": "popper",
    "position": [
     4.5,
     13.8
    ],
    "rotation": -25,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -0.8,
      3.1
     ],
     [
      0.8,
      3.1
     ],
     [
      0.8,
      4.5
     ],
     [
      -0.8,
      4.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    3.4
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 11,
  "inspiredBy": "Inspired by stage 23 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 },
 {
  "id": "barrel-pyramid",
  "name": "Barrel Pyramid",
  "discipline": "IPSC",
  "summary": "A low wall with a pyramid of barrels behind it; four no-shoot-guarded targets and one popper.",
  "bay": {
   "width": 18,
   "depth": 18
  },
  "briefing": {
   "scoring": "Comstock",
   "startSignal": "Audible",
   "startPosition": "Standing in the shooting area, arms hanging naturally at the sides",
   "gunCondition": "Loaded and holstered, ready condition",
   "procedure": "On the start signal, engage all targets from within the shooting area.",
   "stopTime": "Last shot",
   "notes": "Short course, 9 rounds, Comstock. The barrels in the middle force a lean left or right; every paper target has a no-shoot partly in front. Steel must fall."
  },
  "objects": [
   {
    "type": "wall-wood",
    "position": [
     0,
     5
    ],
    "rotation": 0,
    "params": {
     "length": 4,
     "height": 1
    }
   },
   {
    "type": "barrel",
    "position": [
     -0.65,
     6.2
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     0,
     6.2
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     0.65,
     6.2
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     -0.33,
     6.9
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "barrel",
    "position": [
     0.33,
     6.9
    ],
    "rotation": 0,
    "params": {
     "color": "blue"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     5.5,
     10
    ],
    "rotation": -35,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     2.6,
     8.8
    ],
    "rotation": -20,
    "params": {
     "presentation": "ns-right"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -2.5,
     13
    ],
    "rotation": 15,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "paper-ipsc",
    "position": [
     -4.5,
     13
    ],
    "rotation": 25,
    "params": {
     "presentation": "ns-left"
    }
   },
   {
    "type": "popper",
    "position": [
     0,
     14
    ],
    "rotation": 0,
    "params": {}
   }
  ],
  "lines": [
   {
    "type": "shooting-area",
    "points": [
     [
      -2,
      0.8
     ],
     [
      2,
      0.8
     ],
     [
      2,
      3.5
     ],
     [
      -2,
      3.5
     ]
    ],
    "closed": true
   }
  ],
  "start": {
   "position": [
    0,
    2
   ],
   "facing": 0
  },
  "size": "short",
  "category": "nationals",
  "rounds": 9,
  "inspiredBy": "Inspired by stage 24 of the US IPSC stage diagrams PDF (2012 US IPSC Nationals, universalshootingacademy.com); original layout and wording."
 }
].map((s) => Object.freeze(s)));
