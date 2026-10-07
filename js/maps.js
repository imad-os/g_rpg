/* Hollowmere: the five zones of the world.
 * Tiles: T tree  # cliff/wall  ~ water  . grass  = path  s sand  m mud (slow)  x stone floor
 *        w planks  F flowers  r rock  f fence  b brambles (cut with the iron sword)
 *        g quarry gate (opens with the key)  S chapel seal (opens with the three Embers)
 *        o iron ore  c glowcap (pickups, collected once)
 * Coordinates below are in tiles. */
window.HM_MAPS = {
    village: {
        ground: 'grass', music: 0, spawn: [21.5, 10.5],
        rows: [
            'TTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
            'TTTTTTTTggTTTTTT############TTTTTTTTTTTT',
            'TT......==......#..........#.........TTT',
            'TT......==......#..........#..........TT',
            'TT..F...==......#..........#....F.....TT',
            'TT......==......#..........#..........TT',
            'TT......==......#####==#####..........TT',
            'TT......==...........==...............TT',
            'TT......=======================.......TT',
            'TT...................==...............TT',
            'TT...................==...........F...TT',
            'TT...................==...............TT',
            'TT..........============================',
            'TT..........============================',
            'TT.....F.............==...............TT',
            'TT...................==...............TT',
            'TT...................==...............TT',
            'TT...................==...............TT',
            'TT.........~~~~......==.......F.......TT',
            'TT........~~~~~~.....==...............TT',
            'TT........~~~~~~.....==...............TT',
            'TT.........~~~~......==...............TT',
            'TT....F..............==.........r.....TT',
            'TT...................==...............TT',
            'TTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTTT',
            'TTTTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTTT'
        ],
        props: [
            { k: 'lantern', x: 21, y: 2, w: 2, h: 2 },
            { k: 'forge', x: 3, y: 9, w: 4, h: 3 },
            { k: 'shop', x: 27, y: 9, w: 4, h: 3 },
            { k: 'house', x: 4, y: 15, w: 4, h: 3 },
            { k: 'house', x: 29, y: 16, w: 4, h: 3 }
        ],
        npcs: [
            { id: 'maren', x: 24.5, y: 5.2 },
            { id: 'tobin', x: 5, y: 12.6 },
            { id: 'hana', x: 29, y: 12.2 },
            { id: 'pip', x: 25.5, y: 19.5 },
            { id: 'odo', x: 10.6, y: 2.6 }
        ],
        exits: [
            { x: 39, y: 12, w: 1, h: 2, to: 'greywood', tx: 1.5, ty: 12.9 },
            { x: 21, y: 25, w: 2, h: 1, to: 'mireshore', tx: 20, ty: 1.2 },
            { x: 8, y: 0, w: 2, h: 1, to: 'quarry', tx: 20, ty: 23.8 }
        ],
        foes: []
    },

    greywood: {
        ground: 'forest', music: 1, spawn: [2.5, 12.9],
        rows: [
            'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
            'TTTTTT.....TTTTT.......TTTTTTTTTTTTTTTTTTTTT',
            'TTTT.........TT.....o....TTTTTTTTTTTTTTTTTTT',
            'TTT....r......T..........TTTTT.........TTTTT',
            'TTT.............T....r...TTTT...........TTTT',
            'TT.....T.................TTT.............TTT',
            'TT...........TT..........TTT.............TTT',
            'TT....o.......T....T.....TTT......xx......TT',
            'TTT.............TT.......TTT.....xxxx.....TT',
            'TTTT...T.................bbb.....xxxx.....TT',
            'TT.......................bbb......xx......TT',
            'TT.......=====...........bbb..............TT',
            '=========.....=====......bbb..............TT',
            '=========.........====...TTT..............TT',
            'TT..................=====TTT.....T........TT',
            'TT...T...............r...TTT.............TTT',
            'TT.........TT............TTTT...........TTTT',
            'TT........TTTT.......T...TTTTTT.......TTTTTT',
            'TTT........TT............TTTTTTTTTTTTTTTTTTT',
            'TT.....r..........o......TTTTTTTTTTTTTTTTTTT',
            'TT..T................TT..TTTTTTTTTTTTTTTTTTT',
            'TT.........T........TTT..TTTTTTTTTTTTTTTTTTT',
            'TT....o..................TTTTTTTTTTTTTTTTTTT',
            'TTT.......T......T.....TTTTTTTTTTTTTTTTTTTTT',
            'TTTT..............TTTTTTTTTTTTTTTTTTTTTTTTTT',
            'TTTTTTT......TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
            'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
            'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
        ],
        props: [],
        npcs: [ { id: 'bram', x: 5.5, y: 10.6 } ],
        exits: [ { x: 0, y: 12, w: 1, h: 2, to: 'village', tx: 38, ty: 12.9 } ],
        foes: [
            { t: 'wisp', x: 12, y: 4 }, { t: 'wisp', x: 20, y: 6 }, { t: 'wolf', x: 15, y: 9 },
            { t: 'wisp', x: 9, y: 16 }, { t: 'wolf', x: 17, y: 20 }, { t: 'wisp', x: 8, y: 22 },
            { t: 'wolf', x: 22, y: 12 }
        ],
        boss: { t: 'thornback', x: 35, y: 9, flag: 'hearth' }
    },

    mireshore: {
        ground: 'mire', music: 2, spawn: [20, 1.5],
        rows: [
            'TTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTTTTT',
            'TTTT.........TTT...==...TTT.........TTTT',
            'TT...........T.....==.....T...........TT',
            'TT....mm...........==..........mm.....TT',
            'TT...mmmm..........==.........mmmm....TT',
            'TT....mm...T.......==.......T..mm.....TT',
            'TT.................==.................TT',
            'TT.......r.........==........r........TT',
            'TT.....mmm.........==.........mmm.....TT',
            'TT....mmmmm........==........mmmmm....TT',
            'TT.....mmm.........==.........mmm.....TT',
            'TT..T..............==...............T.TT',
            'TTsssssssssssssssss==ssssssssssssssssTTT',
            'TTssssssssssssssssssssssssssssssssssssTT',
            'TTsssssssssssssssssssssssssssssssssssssT',
            '~~ssscsssssssscssssssssssssssssscsssss~~',
            '~~~~sssssssssssssss~wwww~ssssssscssss~~~',
            '~~~~~~~~~~~~~~~~~~~~wwww~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~wwww~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
        ],
        props: [ { k: 'boat', x: 21, y: 18.6, w: 0, h: 0 } ],
        npcs: [ { id: 'sela', x: 23.5, y: 15.2 } ],
        exits: [ { x: 19, y: 0, w: 2, h: 1, to: 'village', tx: 22, ty: 23.8 } ],
        foes: [
            { t: 'crawler', x: 7, y: 4 }, { t: 'crawler', x: 32, y: 4 }, { t: 'wisp', x: 10, y: 9 },
            { t: 'crawler', x: 30, y: 9 }, { t: 'wisp', x: 26, y: 13 }, { t: 'crawler', x: 8, y: 13 }
        ]
    },

    isle: {
        ground: 'mire', music: 3, spawn: [21.5, 22.2],
        rows: [
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~################~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~~~~#xxxxxxxxxxxxxx#~~~~~~~~~~~~',
            '~~~~~~~~~TTT#######SS#######TTT~~~~~~~~~',
            '~~~~~~~TTT.........==.........TTT~~~~~~~',
            '~~~~~~TT...m.......==.......m...TT~~~~~~',
            '~~~~~TT...mmm......==......mmm...TT~~~~~',
            '~~~~TT.....m.....xxxxxx.....m.....TT~~~~',
            '~~~~T...........xxxxxxxx...........T~~~~',
            '~~~~T....T......xxxxxxxx......T....T~~~~',
            '~~~~T...........xxxxxxxx...........T~~~~',
            '~~~~TT...m.......xxxxxx.......m...TT~~~~',
            '~~~~~T..mmm........==........mmm..T~~~~~',
            '~~~~~TT..m.........==.........m..TT~~~~~',
            '~~~~~~TT...........==...........TT~~~~~~',
            '~~~~~~~TTT.....r...==...r.....TTT~~~~~~~',
            '~~~~~~~~~TTss......==......ssTT~~~~~~~~~',
            '~~~~~~~~~~~~ssssssssssssssss~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~wwww~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~wwww~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~wwww~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
        ],
        props: [ { k: 'bell', x: 20, y: 14.2, w: 0, h: 0 }, { k: 'boat', x: 22, y: 25.4, w: 0, h: 0 } ],
        npcs: [ { id: 'corvin', x: 20, y: 4.2 }, { id: 'lira', x: 17.5, y: 3.6 } ],
        exits: [],
        foes: [ { t: 'crawler', x: 9, y: 11 }, { t: 'crawler', x: 30, y: 11 }, { t: 'wisp', x: 8, y: 17 }, { t: 'wisp', x: 31, y: 17 } ],
        boss: { t: 'warden', x: 20, y: 13, flag: 'tide' },
        boss2: { t: 'shade', x: 20, y: 4, flag: 'shade' }
    },

    quarry: {
        ground: 'stone', music: 4, spawn: [20, 23.5],
        rows: [
            '########################################',
            '##########.................#############',
            '########.....................###########',
            '#######.........xxxxxx.........#########',
            '######.........xxxxxxxx.........########',
            '######.........xxxxxxxx..........#######',
            '######..........xxxxxx...........#######',
            '#######.........................########',
            '########..............r........#########',
            '##########.......====........###########',
            '############.....====.....##############',
            '###########......====......#############',
            '#####.....r......====..........r....####',
            '####.............====...............####',
            '####....###......====......###......####',
            '####....###......====......###......####',
            '####.............====...............####',
            '#####...r........====........r.....#####',
            '######...........====..............#####',
            '#######..........====.............######',
            '########.........====............#######',
            '##########.......====..........#########',
            '############.....====.....##############',
            '#################.====.#################',
            '#################.====.#################',
            '###################==###################'
        ],
        props: [ { k: 'statue', x: 12, y: 12.6, w: 0, h: 0 }, { k: 'statue', x: 28, y: 12.6, w: 0, h: 0 },
                 { k: 'statue', x: 13, y: 4.6, w: 0, h: 0 }, { k: 'statue', x: 27, y: 4.6, w: 0, h: 0 } ],
        npcs: [],
        exits: [ { x: 19, y: 25, w: 2, h: 1, to: 'village', tx: 9, ty: 2.6 } ],
        foes: [ { t: 'mite', x: 9, y: 13 }, { t: 'mite', x: 31, y: 13 }, { t: 'mite', x: 10, y: 18 },
                { t: 'mite', x: 30, y: 18 }, { t: 'mite', x: 20, y: 9 } ],
        boss: { t: 'sentinel', x: 20, y: 4.5, flag: 'stone' }
    }
};
