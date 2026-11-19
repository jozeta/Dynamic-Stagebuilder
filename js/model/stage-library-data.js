// Library stage data (see stage-library.js): original layouts and wording, researched from
// published stage books, stage-design guides and classic public drills (docs/stage-library-sources.md).
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
 }
].map((s) => Object.freeze(s)));
