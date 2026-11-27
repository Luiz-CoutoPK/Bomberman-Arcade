// Constantes e desenho compartilhados entre o jogo e o editor
// O tamanho do mapa (COLS e ROWS) agora vem de cada fase, não é mais fixo aqui.
const T = 16; // tamanho do tile (px)

const PAL = {
    W: '#f4f4f4', K: '#1a1a1a', B: '#3b6fd4',
    R: '#d9423a', O: '#f08a24', Y: '#ffd93b'
};

const THEMES = {
    plains: 'Planícies Verdes', frozen: 'Reino Congelado', volcano: 'Vulcão',
    factory: 'Fábrica Mecânica', temple: 'Templo Antigo'
};

const ELEMENTS = [
    { id: 'grass', name: 'Grama verde', category: 'Terrenos', theme: 'plains', color: '#578545', accent: '#83b951', texture: 'grass' },
    { id: 'dirt', name: 'Terra', category: 'Terrenos', theme: 'plains', color: '#8b5939', accent: '#c18451', texture: 'dirt' },
    { id: 'flower-grass', name: 'Grama com flores', category: 'Terrenos', theme: 'plains', color: '#4d793e', accent: '#f3d95a', texture: 'flowers' },
    { id: 'dark-grass', name: 'Grama escura', category: 'Terrenos', theme: 'plains', color: '#31563d', accent: '#628050', texture: 'grass' },
    { id: 'ice', name: 'Gelo azul-claro', category: 'Terrenos', theme: 'frozen', color: '#9bd8e8', accent: '#e5ffff', texture: 'ice' },
    { id: 'snow', name: 'Neve', category: 'Terrenos', theme: 'frozen', color: '#dcebf0', accent: '#ffffff', texture: 'snow' },
    { id: 'cracked-ice', name: 'Gelo rachado', category: 'Terrenos', theme: 'frozen', color: '#72b8cd', accent: '#d6f7ff', texture: 'cracks' },
    { id: 'dark-ice', name: 'Gelo escuro', category: 'Terrenos', theme: 'frozen', color: '#426f91', accent: '#80adbe', texture: 'ice' },
    { id: 'volcanic-stone', name: 'Pedra vulcânica', category: 'Terrenos', theme: 'volcano', color: '#59463f', accent: '#a65a3b', texture: 'stone' },
    { id: 'lava', name: 'Lava', category: 'Terrenos', theme: 'volcano', color: '#8f2d1f', accent: '#ffb52e', texture: 'lava' },
    { id: 'dark-stone', name: 'Pedra escura', category: 'Terrenos', theme: 'volcano', color: '#35363b', accent: '#69676a', texture: 'stone' },
    { id: 'scorched-earth', name: 'Terra queimada', category: 'Terrenos', theme: 'volcano', color: '#493b34', accent: '#805139', texture: 'dirt' },
    { id: 'metal-floor', name: 'Piso metálico', category: 'Terrenos', theme: 'factory', color: '#697b82', accent: '#b5c5c6', texture: 'metal' },
    { id: 'yellow-metal', name: 'Metal amarelo', category: 'Terrenos', theme: 'factory', color: '#69716a', accent: '#f3cb3d', texture: 'hazard' },
    { id: 'industrial-floor', name: 'Piso industrial', category: 'Terrenos', theme: 'factory', color: '#4d5960', accent: '#9eabb0', texture: 'metal' },
    { id: 'conveyor', name: 'Esteira', category: 'Terrenos', theme: 'factory', color: '#39454b', accent: '#e5b735', texture: 'conveyor' },
    { id: 'ancient-stone', name: 'Pedra antiga', category: 'Terrenos', theme: 'temple', color: '#8c795c', accent: '#c7ae7a', texture: 'stone' },
    { id: 'marble', name: 'Mármore', category: 'Terrenos', theme: 'temple', color: '#c6c0ad', accent: '#eee8d5', texture: 'marble' },
    { id: 'rune-floor', name: 'Pedra com símbolos', category: 'Terrenos', theme: 'temple', color: '#665c76', accent: '#c9ae58', texture: 'runes' },
    { id: 'magic-floor', name: 'Piso mágico', category: 'Terrenos', theme: 'temple', color: '#403e70', accent: '#6fe2d2', texture: 'magic' },
    { id: 'wall-stone', name: 'Parede de pedra', category: 'Paredes', theme: 'plains', color: '#737b84', accent: '#b4bbc1', texture: 'brick', solid: true, char: '#' },
    { id: 'wall-wood', name: 'Parede de madeira', category: 'Paredes', theme: 'plains', color: '#80502e', accent: '#c38a4d', texture: 'wood', solid: true, char: '#' },
    { id: 'wall-ice', name: 'Parede de gelo', category: 'Paredes', theme: 'frozen', color: '#68aabe', accent: '#d5faff', texture: 'iceblock', solid: true, char: '#' },
    { id: 'wall-volcanic', name: 'Parede vulcânica', category: 'Paredes', theme: 'volcano', color: '#593b35', accent: '#e06937', texture: 'volcanic', solid: true, char: '#' },
    { id: 'wall-metal', name: 'Parede metálica', category: 'Paredes', theme: 'factory', color: '#53636a', accent: '#d2bd4b', texture: 'metalblock', solid: true, char: '#' },
    { id: 'wall-ancient', name: 'Parede antiga', category: 'Paredes', theme: 'temple', color: '#817458', accent: '#cfb875', texture: 'runes', solid: true, char: '#' },
    { id: 'wall-magic', name: 'Parede mágica', category: 'Paredes', theme: 'temple', color: '#4c457c', accent: '#83e5dc', texture: 'magic', solid: true, char: '#' },
    { id: 'crate', name: 'Caixa de madeira', category: 'Blocos destrutíveis', theme: 'plains', color: '#a86c37', accent: '#e0ad68', texture: 'crate', solid: true, char: '+' },
    { id: 'reinforced-crate', name: 'Caixa reforçada', category: 'Blocos destrutíveis', theme: 'factory', color: '#76512f', accent: '#e2b34e', texture: 'reinforced', solid: true, char: '+' },
    { id: 'ice-block', name: 'Bloco de gelo', category: 'Blocos destrutíveis', theme: 'frozen', color: '#6daec4', accent: '#e0ffff', texture: 'iceblock', solid: true, char: '+' },
    { id: 'volcanic-rock', name: 'Rocha vulcânica', category: 'Blocos destrutíveis', theme: 'volcano', color: '#463d3c', accent: '#df6336', texture: 'volcanic', solid: true, char: '+' },
    { id: 'crystal-block', name: 'Cristal', category: 'Blocos destrutíveis', theme: 'frozen', color: '#508fae', accent: '#d6ffff', texture: 'crystal', solid: true, char: '+' },
    { id: 'metal-block', name: 'Bloco metálico', category: 'Blocos destrutíveis', theme: 'factory', color: '#53636b', accent: '#d6c44c', texture: 'metalblock', solid: true, char: '+' },
    { id: 'rune-block', name: 'Bloco antigo com símbolos', category: 'Blocos destrutíveis', theme: 'temple', color: '#78674e', accent: '#d4c17b', texture: 'runes', solid: true, char: '+' },
    { id: 'magic-block', name: 'Bloco mágico', category: 'Blocos destrutíveis', theme: 'temple', color: '#4d4479', accent: '#77e5d7', texture: 'magic', solid: true, char: '+' },
    { id: 'tree', name: 'Árvore', category: 'Decorações', theme: 'plains', color: '#2f6d3e', accent: '#7fae48', texture: 'tree', solid: true },
    { id: 'bush', name: 'Arbusto', category: 'Decorações', theme: 'plains', color: '#34764a', accent: '#92bd58', texture: 'bush' },
    { id: 'small-rock', name: 'Pedra pequena', category: 'Decorações', theme: 'plains', color: '#68727a', accent: '#b6bec2', texture: 'rock' },
    { id: 'flower', name: 'Flores', category: 'Decorações', theme: 'plains', color: '#4e7940', accent: '#f3dc59', texture: 'flower' },
    { id: 'crystal', name: 'Cristais', category: 'Decorações', theme: 'frozen', color: '#3985a7', accent: '#d9ffff', texture: 'crystal' },
    { id: 'statue', name: 'Estátua', category: 'Decorações', theme: 'temple', color: '#897a5e', accent: '#d3c390', texture: 'statue', solid: true },
    { id: 'torch', name: 'Tocha', category: 'Decorações', theme: 'temple', color: '#70452d', accent: '#ffb733', texture: 'torch' },
    { id: 'gear', name: 'Engrenagem', category: 'Decorações', theme: 'factory', color: '#78878b', accent: '#f1c83f', texture: 'gear' },
    { id: 'barrel', name: 'Barril', category: 'Decorações', theme: 'factory', color: '#80502e', accent: '#d6a64f', texture: 'barrel', solid: true },
    { id: 'bones-ruins', name: 'Ossos e ruínas', category: 'Decorações', theme: 'volcano', color: '#b8aa87', accent: '#6e6051', texture: 'ruins' },
    { id: 'P', name: 'Jogador', category: 'Objetos especiais', theme: '', texture: 'player', char: 'P' },
    { id: 'E', name: 'Inimigo', category: 'Objetos especiais', theme: '', texture: 'enemy', char: 'E' },
    {
        id: 'enemy-coward', name: 'Covarde', category: 'Objetos especiais', theme: 'plains',
        texture: 'enemy-coward', color: '#edc949', char: 'E', ai: 'coward', speed: 350, hp: 1, points: 150,
        description: 'Monstro amarelo assustado. Anda 20% mais rápido que o normal e foge das explosões.'
    },
    {
        id: 'enemy-pursuer', name: 'Perseguidor', category: 'Objetos especiais', theme: 'plains',
        texture: 'enemy-pursuer', color: '#439548', char: 'E', ai: 'pursuer', speed: 420, hp: 1, points: 100,
        description: 'Monstro verde agressivo que persegue o jogador e contorna obstáculos.'
    },
    {
        id: 'enemy-slippery', name: 'Escorregadio', category: 'Objetos especiais', theme: 'frozen',
        texture: 'enemy-slippery', color: '#65cfe5', char: 'E', speed: 420, hp: 1, points: 100,
        description: 'Criatura de gelo rápida em terrenos congelados e lenta nos demais.'
    },
    {
        id: 'enemy-freezer', name: 'Congelador', category: 'Objetos especiais', theme: 'frozen',
        texture: 'enemy-freezer', color: '#568ad4', char: 'E', ai: 'pursuer', speed: 420, hp: 1, points: 150,
        description: 'Persegue o jogador e dispara gelo para congelá-lo temporariamente.'
    },
    {
        id: 'enemy-glacial-guardian', name: 'Guardião Glacial', category: 'Objetos especiais', theme: 'frozen',
        texture: 'enemy-glacial-guardian', color: '#4267ad', char: 'E', ai: 'guardian', speed: 700, hp: 2, points: 300,
        description: 'Guardião robusto que patrulha sua região, persegue de perto e resiste a duas explosões.'
    }
];

const ELEMENT_BY_ID = Object.fromEntries(ELEMENTS.map(element => [element.id, element]));
const CATEGORIES = ['Terrenos', 'Paredes', 'Blocos destrutíveis', 'Decorações', 'Objetos especiais'];

// Cada sprite tem 8x8 "pixels"; cada pixel vira 2x2 no canvas (16x16)
const SPR = {
    player: [
        "..WWWW..",
        ".WWWWWW.",
        ".WKWWKW.",
        ".WWWWWW.",
        "..BBBB..",
        ".BBBBBB.",
        ".B.BB.B.",
        "..KK.KK."
    ],
    enemy: [
        "..RRRR..",
        ".RRRRRR.",
        "RWKRRWKR",
        "RRRRRRRR",
        "RRRRRRRR",
        "RRRRRRRR",
        ".RR..RR.",
        "RR....RR"
    ],
    'enemy-coward': [
        "..YYYY..",
        ".YYYYYY.",
        "YYWWWWYY",
        "YKWYYWKY",
        "YYYYYYYY",
        "YYYKKYYY",
        ".YY..YY.",
        "..Y..Y.."
    ],
    'enemy-pursuer': [
        "..GGGG..",
        ".GGGGGG.",
        "GGWWWWGG",
        "GKGWWKGG",
        "GGGGGGGG",
        "GGGRRGGG",
        ".GG..GG.",
        "..G..G.."
    ],
    'enemy-slippery': [
        "..CCCC..",
        ".CCCCCC.",
        "CCWWWWCC",
        "CKWCCWKC",
        "CCWWWWCC",
        "CCCCCCCC",
        ".CC..CC.",
        "..C..C.."
    ],
    'enemy-freezer': [
        "..C..C..",
        ".CCCCCC.",
        "BCWWWWCB",
        "BKWCCWKB",
        "BBBBBBBB",
        "BBCWWCBB",
        ".BB..BB.",
        "..B..B.."
    ],
    'enemy-glacial-guardian': [
        "BBCCCCBB",
        "BBBBBBBB",
        "BCWWWWCB",
        "BKWCCWKB",
        "BBBBBBBB",
        "BBCWWCBB",
        "BBBBBBBB",
        ".BB..BB."
    ],
    bomb: [
        "....Y...",
        "...Y.O..",
        "..KKKK..",
        ".KKKKKK.",
        "KKWKKKKK",
        "KKWKKKKK",
        ".KKKKKK.",
        "..KKKK.."
    ],
    fire: [
        "...O....",
        "..OO.O..",
        "..OOOO..",
        ".OOYOOO.",
        ".OOYYOO.",
        ".OYYYYO.",
        ".OYYYYO.",
        "..OOOO.."
    ]
};

const OBJECT_SPRITES = {
    tree: ['...GG...', '..GLLG..', '.GLLLGG.', 'GGLLGGGG', '.GGGGG..', '...BB...', '..BBBB..', '..B..B..'],
    bush: ['........', '...GG...', '.GLLGG..', 'GGLLLGGG', 'GLLGGLLG', '.GGGGGG.', '..G..G..', '........'],
    'small-rock': ['........', '...SS...', '..SLLS..', '.SSLLSS.', 'SSSSSSSS', '.SDSDSS.', '..SSSS..', '........'],
    flower: ['........', '..Y..R..', '.YYR.RR.', '..G.G...', '..G.G...', '.GGGGG..', '..G.G...', '........'],
    crystal: ['....C...', '...CWC..', '..CCWC..', '.CCWWCC.', '.CCWWCC.', '..CCWC..', '...CC...', '....C...'],
    statue: ['...TT...', '..TWWT..', '..TTTT..', '...TT...', '.TTTTTT.', '.T.TT.T.', '.TTTTTT.', 'TTT..TTT'],
    torch: ['...OO...', '...YY...', '..YRY...', '...BB...', '...BB...', '..BBBB..', '...BB...', '...BB...'],
    gear: ['...MMM..', '..MYYM..', '.MYYYYM.', 'MYYMMYYM', 'MYYMMYYM', '.MYYYYM.', '..MYYM..', '...MMM..'],
    barrel: ['..BBBB..', '.BTTTTB.', 'BTBTBTBB', 'BTTTTTTB', 'BTTTTTTB', 'BTBTBTBB', '.BTTTTB.', '..BBBB..'],
    'bones-ruins': ['........', '.TT...T.', 'TTT..TTT', '.TT..TT.', '..TTTT..', '.T....T.', 'TT....TT', '........']
};

const OBJECT_PALETTE = {
    G: '#367342', L: '#82ae4d', B: '#76502e', T: '#c4ae7c',
    S: '#727b82', D: '#3c4449', W: '#e8ffff', C: '#63cde2',
    P: '#7054a0', Y: '#f5d444', O: '#f18127', R: '#df4c3b', M: '#aebdc0'
};
const ENEMY_PALETTE = {
    R: '#d9423a', G: '#439548', Y: '#edc949', C: '#65cfe5',
    B: '#568ad4', W: '#f4f4f4', K: '#1a1a1a'
};

function sprite(ctx, rows, pal, px, py) {
    rows.forEach((r, j) => [...r].forEach((c, i) => {
        if (pal[c]) {
            ctx.fillStyle = pal[c];
            ctx.fillRect(px + i * 2, py + j * 2, 2, 2);
        }
    }));
}

function pixelSprite(ctx, rows, pal, px, py) {
    rows.forEach((row, y) => [...row].forEach((key, x) => {
        if (pal[key]) {
            ctx.fillStyle = pal[key];
            ctx.fillRect(px + x * 2, py + y * 2, 2, 2);
        }
    }));
}

function drawEnemySprite(ctx, id, px, py, phase, facingX) {
    const element = ELEMENT_BY_ID[id] || ELEMENT_BY_ID.E;
    const rows = SPR[element.texture] || SPR.enemy;
    const bob = phase ? Math.sin(phase) * 0.7 : 0;
    if (facingX < 0) {
        ctx.save();
        ctx.translate(px + T, py + bob);
        ctx.scale(-1, 1);
        pixelSprite(ctx, rows, ENEMY_PALETTE, 0, 0);
        ctx.restore();
    } else pixelSprite(ctx, rows, ENEMY_PALETTE, px, py + bob);
}

function drawTerrain(ctx, id, x, y) {
    const px = x * T, py = y * T;
    const tile = ELEMENT_BY_ID[id] || ELEMENT_BY_ID.grass;
    const { color, accent, texture } = tile;
    ctx.fillStyle = color; ctx.fillRect(px, py, T, T);
    ctx.fillStyle = accent;

    if (texture === 'grass' || texture === 'dirt' || texture === 'stone' || texture === 'snow') {
        ctx.fillRect(px + 2, py + 3, 2, 2); ctx.fillRect(px + 10, py + 11, 2, 2);
        ctx.fillRect(px + 13, py + 5, 1, 2);
        if (texture === 'grass') { ctx.fillRect(px + 6, py + 1, 1, 3); ctx.fillRect(px + 5, py + 2, 3, 1); }
    } else if (texture === 'flowers') {
        ctx.fillRect(px + 3, py + 4, 2, 2); ctx.fillRect(px + 2, py + 5, 4, 1);
        ctx.fillRect(px + 11, py + 11, 2, 2); ctx.fillRect(px + 10, py + 12, 4, 1);
    } else if (texture === 'ice' || texture === 'marble') {
        ctx.fillRect(px + 2, py + 2, 5, 1); ctx.fillRect(px + 9, py + 6, 5, 1);
        ctx.fillRect(px + 5, py + 3, 1, 3); ctx.fillRect(px + 11, py + 7, 1, 3);
    } else if (texture === 'cracks') {
        ctx.fillRect(px + 4, py + 1, 1, 5); ctx.fillRect(px + 5, py + 5, 4, 1);
        ctx.fillRect(px + 8, py + 6, 1, 5); ctx.fillRect(px + 8, py + 10, 4, 1);
    } else if (texture === 'lava') {
        ctx.fillRect(px + 2, py + 3, 5, 2); ctx.fillRect(px + 9, py + 10, 5, 2);
        ctx.fillStyle = '#ffdf50'; ctx.fillRect(px + 3, py + 4, 3, 1); ctx.fillRect(px + 10, py + 11, 3, 1);
    } else if (texture === 'metal' || texture === 'hazard') {
        ctx.fillRect(px + 2, py + 2, 2, 2); ctx.fillRect(px + 12, py + 2, 2, 2);
        ctx.fillRect(px + 2, py + 12, 2, 2); ctx.fillRect(px + 12, py + 12, 2, 2);
        if (texture === 'hazard') {
            ctx.fillStyle = color;
            for (let i = 0; i < 4; i++) ctx.fillRect(px + 5 + i * 3, py + 6, 2, 5);
        } else ctx.fillRect(px + 5, py + 7, 6, 2);
    } else if (texture === 'conveyor') {
        ctx.fillRect(px, py + 3, T, 1); ctx.fillRect(px, py + 12, T, 1);
        for (let i = 0; i < 3; i++) {
            const ox = px + 2 + i * 5;
            ctx.fillRect(ox, py + 6, 2, 4); ctx.fillRect(ox + 2, py + 7, 2, 2);
        }
    } else if (texture === 'runes' || texture === 'magic') {
        ctx.fillRect(px + 3, py + 3, 2, 2); ctx.fillRect(px + 11, py + 3, 2, 2);
        ctx.fillRect(px + 3, py + 11, 2, 2); ctx.fillRect(px + 11, py + 11, 2, 2);
        ctx.fillRect(px + 7, py + 5, 2, 6); ctx.fillRect(px + 5, py + 7, 6, 2);
    }
}

function drawObject(ctx, id, x, y) {
    const px = x * T, py = y * T;
    const element = ELEMENT_BY_ID[id];
    if (!element) return;
    const texture = element.texture;
    if (element.category === 'Objetos especiais' && element.char === 'E') {
        drawEnemySprite(ctx, id, px, py);
        return;
    }
    const spriteRows = OBJECT_SPRITES[texture];
    if (spriteRows) {
        pixelSprite(ctx, spriteRows, OBJECT_PALETTE, px, py);
        return;
    }

    ctx.fillStyle = element.color; ctx.fillRect(px, py, T, T);
    ctx.fillStyle = element.accent;
    ctx.fillRect(px + 1, py + 1, T - 2, 2);
    ctx.fillStyle = '#292a2c';
    if (texture === 'wood' || texture === 'crate' || texture === 'reinforced') {
        ctx.fillRect(px + 2, py + 6, 12, 2); ctx.fillRect(px + 6, py + 2, 2, 4);
        ctx.fillRect(px + 9, py + 8, 2, 6);
        if (texture === 'reinforced') {
            ctx.fillStyle = '#e2b34e'; ctx.fillRect(px + 1, py + 3, 2, 11); ctx.fillRect(px + 13, py + 3, 2, 11);
        }
    } else if (texture === 'brick' || texture === 'volcanic' || texture === 'runes' || texture === 'magic') {
        ctx.fillRect(px, py + 7, T, 2); ctx.fillRect(px + 7, py + 2, 2, 5); ctx.fillRect(px + 3, py + 9, 2, 5);
        if (texture === 'runes' || texture === 'magic') { ctx.fillStyle = element.accent; ctx.fillRect(px + 6, py + 5, 4, 1); ctx.fillRect(px + 7, py + 4, 2, 7); }
        if (texture === 'volcanic') { ctx.fillStyle = '#ff9a32'; ctx.fillRect(px + 3, py + 10, 3, 1); ctx.fillRect(px + 11, py + 3, 2, 1); }
    } else if (texture === 'iceblock' || texture === 'crystal') {
        ctx.fillStyle = '#efffff'; ctx.fillRect(px + 3, py + 3, 2, 7); ctx.fillRect(px + 5, py + 3, 4, 2);
        ctx.fillStyle = '#376c88'; ctx.fillRect(px + 10, py + 8, 3, 5);
    } else if (texture === 'metalblock') {
        ctx.fillRect(px + 3, py + 4, 10, 1); ctx.fillRect(px + 3, py + 11, 10, 1);
        ctx.fillStyle = element.accent;
        ctx.fillRect(px + 2, py + 2, 2, 2); ctx.fillRect(px + 12, py + 12, 2, 2);
    }
}

function drawTile(ctx, ch, x, y) {
    drawTerrain(ctx, 'grass', x, y);
    if (ch === '#') drawObject(ctx, 'wall-stone', x, y);
    else if (ch === '+') drawObject(ctx, 'crate', x, y);
}

// ---------- mapas salvos no arquivo maps.js do projeto ----------
const EDITOR_CODE = '1234';   // código pedido no menu para abrir o editor (troque aqui)

function saveMaps(maps) {
    SAVED_MAPS.splice(0, SAVED_MAPS.length);
    maps.forEach(map => SAVED_MAPS.push(map));

    const source = '// Mapas do Bomberman. Este arquivo pode ser sincronizado pelo OneDrive.\n' +
        'const SAVED_MAPS = ' + JSON.stringify(SAVED_MAPS, null, 2) + ';\n';
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'maps.js';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getMaps() {
    const source = Array.isArray(SAVED_MAPS) && SAVED_MAPS.length ? SAVED_MAPS : defaultMaps();
    return source.map(map => {
        if (map && map.rows && !Array.isArray(map.rows) && Array.isArray(map.rows.rows)) {
            return {
                ...map,
                ...map.rows,
                id: map.id || map.rows.id,
                name: map.rows.name || map.name
            };
        }
        return map;
    });
}

function addMissingDefaultMaps(maps) {
    defaultMaps().forEach(map => {
        if (!maps.some(saved => saved && saved.id === map.id)) maps.push(map);
    });
    return maps;
}

function defaultMaps() {
    return LEVELS.map((level, i) => {
        const map = Array.isArray(level) ? { rows: level } : level;
        return {
            ...map,
            id: map.id || 'builtin-level-' + (i + 1),
            name: map.name || 'Fase ' + (i + 1)
        };
    });
}
