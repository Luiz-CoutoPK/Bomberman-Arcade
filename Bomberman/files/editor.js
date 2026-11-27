// Só entra aqui quem digitou o código no menu do jogo
if (!sessionStorage.getItem('bomber_ed')) location.replace('index.html');

const cv = document.getElementById('ed'), ctx = cv.getContext('2d');
const ta = document.getElementById('out');
const colsIn = document.getElementById('cols'), rowsIn = document.getElementById('rows');
const nameIn = document.getElementById('name'), listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const catalogEl = document.getElementById('catalog'), categoriesEl = document.getElementById('categories');
const themeIn = document.getElementById('theme'), decoSolidIn = document.getElementById('deco-solid');

const MIN = 5, MAX = 41;
let COLS = 13, ROWS = 11; // tamanho atual do mapa (mude aqui o padrão, se quiser)

let tool = 'wall-stone', category = 'Paredes';
let g = blank(COLS, ROWS);
let terrain = blankLayer(COLS, ROWS, 'grass');
let objects = blankLayer(COLS, ROWS, null);
let blocking = blankLayer(COLS, ROWS, null);
let curId = null; // id do mapa salvo que está sendo editado (null = mapa novo)

function blank(w, h) {
    return Array.from({ length: h }, (_, y) =>
        Array.from({ length: w }, (_, x) =>
            (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? '#' : '.'));
}

function blankLayer(w, h, value) {
    return Array.from({ length: h }, () => Array(w).fill(value));
}

const rows = () => g.map(r => r.join(''));

function mapData() {
    return { version: 2, theme: themeIn.value, rows: rows(), terrain, objects, blocking };
}

function out() {
    ta.value = JSON.stringify(mapData(), null, 2);
}

function say(t) { statusEl.textContent = t; }

// ajusta o canvas ao tamanho do mapa
function fit() {
    cv.width = COLS * T; cv.height = ROWS * T;
    const scale = Math.max(8, Math.min(48, Math.floor(880 / COLS), Math.floor(700 / ROWS)));
    cv.style.width = COLS * scale + 'px';
    colsIn.value = COLS; rowsIn.value = ROWS;
}

function draw() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const c = g[y][x];
            drawTerrain(ctx, terrain[y][x], x, y);
            if (objects[y][x]) drawObject(ctx, objects[y][x], x, y);
            else if (c === '#') drawObject(ctx, 'wall-stone', x, y);
            else if (c === '+') drawObject(ctx, 'crate', x, y);
            if (c === 'P') sprite(ctx, SPR.player, PAL, x * T, y * T);
            if (c === 'E' && !objects[y][x]) drawObject(ctx, 'E', x, y);
            // linhas de grade para ajudar a posicionar
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x * T, y * T, T, 1);
            ctx.fillRect(x * T, y * T, 1, T);
        }
    }
}

// muda o tamanho mantendo o que já foi desenhado (o que couber)
function resize(w, h) {
    w = Math.max(MIN, Math.min(MAX, Math.round(w) || COLS));
    h = Math.max(MIN, Math.min(MAX, Math.round(h) || ROWS));
    const ng = blank(w, h);
    const nt = blankLayer(w, h, 'grass'), no = blankLayer(w, h, null), nb = blankLayer(w, h, null);
    for (let y = 1; y < Math.min(h, ROWS) - 1; y++)
        for (let x = 1; x < Math.min(w, COLS) - 1; x++) {
            ng[y][x] = g[y][x];
            nt[y][x] = terrain[y][x]; no[y][x] = objects[y][x]; nb[y][x] = blocking[y][x];
        }
    COLS = w; ROWS = h; g = ng; terrain = nt; objects = no; blocking = nb;
    fit(); draw(); out();
}

function paint(e) {
    const r = cv.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * COLS);
    const y = Math.floor((e.clientY - r.top) / r.height * ROWS);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    if (e.buttons & 2) {
        g[y][x] = '.'; objects[y][x] = null; blocking[y][x] = null;
    } else {
        const element = ELEMENT_BY_ID[tool];
        if (!element) return;
        if (element.category === 'Terrenos') terrain[y][x] = element.id;
        else if (element.category === 'Objetos especiais') {
            if (element.char === 'P') g.forEach(row => row.forEach((cell, i) => { if (cell === 'P') row[i] = '.'; }));
            blocking[y][x] = null;
            if (element.char === 'E' && element.id !== 'E') {
                if (g[y][x] === 'P') return;
                objects[y][x] = element.id; g[y][x] = '.';
            } else {
                objects[y][x] = null; g[y][x] = element.char;
            }
        } else if (element.category === 'Decorações') {
            objects[y][x] = element.id;
            blocking[y][x] = decoSolidIn.checked;
            g[y][x] = decoSolidIn.checked ? '#' : '.';
        } else {
            objects[y][x] = element.id; blocking[y][x] = null; g[y][x] = element.char;
        }
    }
    draw(); out();
}

cv.onmousedown = paint;
cv.onmousemove = e => { if (e.buttons & 3) paint(e); };
cv.oncontextmenu = e => e.preventDefault();

function renderCatalog() {
    categoriesEl.innerHTML = '';
    CATEGORIES.forEach(name => {
        const button = document.createElement('button');
        button.textContent = name;
        button.classList.toggle('on', name === category);
        button.onclick = () => { category = name; renderCatalog(); };
        categoriesEl.append(button);
    });
    const theme = themeIn.value;
    const elements = ELEMENTS.filter(element => element.category === category)
        .sort((a, b) => Number(b.theme === theme) - Number(a.theme === theme));
    catalogEl.innerHTML = '';
    elements.forEach(element => {
        const button = document.createElement('button');
        button.classList.toggle('on', element.id === tool);
        button.title = element.description ? element.name + ': ' + element.description : element.name;
        const swatch = document.createElement('span');
        swatch.className = 'swatch'; swatch.style.backgroundColor = element.color || '#333';
        if (element.accent) swatch.style.backgroundImage = `linear-gradient(135deg, transparent 42%, ${element.accent} 43% 58%, transparent 59%)`;
        button.append(swatch, document.createTextNode(element.name));
        button.onclick = () => { tool = element.id; decoSolidIn.checked = !!element.solid; renderCatalog(); };
        catalogEl.append(button);
    });
    decoSolidIn.parentElement.hidden = category !== 'Decorações';
}

themeIn.onchange = renderCatalog;
decoSolidIn.onchange = () => { if (ELEMENT_BY_ID[tool]?.category === 'Decorações') renderCatalog(); };

document.getElementById('size').onclick = () => resize(+colsIn.value, +rowsIn.value);
[colsIn, rowsIn].forEach(i => i.onkeydown = e => { if (e.key === 'Enter') resize(+colsIn.value, +rowsIn.value); });

document.getElementById('clear').onclick = () => {
    g = blank(COLS, ROWS); terrain = blankLayer(COLS, ROWS, 'grass');
    objects = blankLayer(COLS, ROWS, null); blocking = blankLayer(COLS, ROWS, null);
    draw(); out();
};

document.getElementById('copy').onclick = () => {
    ta.select();
    document.execCommand('copy');
};

document.getElementById('load').onclick = () => {
    try {
        const data = JSON.parse(ta.value);
        if (data && Array.isArray(data.rows)) { useMapData(data); return; }
    } catch (e) { }
    // aceita fases antigas de qualquer tamanho, desde que todas as linhas tenham o mesmo comprimento
    const m = ta.value.match(/[#+.PE]+/g);
    if (m && m.length >= MIN && m.length <= MAX && m[0].length >= MIN && m[0].length <= MAX &&
        m.every(r => r.length === m[0].length)) {
        useMapData({ rows: m });
    } else alert('Cole um mapa em camadas ou as linhas antigas (# + . P E), todas do mesmo tamanho, entre 5 e 41.');
};

function useMapData(data) {
    if (!Array.isArray(data.rows) || data.rows.length < MIN || data.rows.length > MAX ||
        !data.rows.every(row => typeof row === 'string' && row.length === data.rows[0].length) ||
        data.rows[0].length < MIN || data.rows[0].length > MAX) {
        alert('O mapa precisa ter de 5 a 41 linhas e colunas, todas do mesmo tamanho.'); return;
    }
    g = data.rows.map(row => [...row]); ROWS = g.length; COLS = g[0].length;
    terrain = blankLayer(COLS, ROWS, 'grass'); objects = blankLayer(COLS, ROWS, null); blocking = blankLayer(COLS, ROWS, null);
    [terrain, objects, blocking].forEach((layer, index) => {
        const source = [data.terrain, data.objects, data.blocking][index];
        if (Array.isArray(source)) for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
            const value = source[y]?.[x];
            if (index === 0 && ELEMENT_BY_ID[value]?.category === 'Terrenos') layer[y][x] = value;
            else if (index === 1 && ELEMENT_BY_ID[value] && ELEMENT_BY_ID[value].category !== 'Terrenos') layer[y][x] = value;
            else if (index === 2 && typeof value === 'boolean') layer[y][x] = value;
        }
    });
    themeIn.value = THEMES[data.theme] ? data.theme : 'plains';
    renderCatalog(); fit(); draw(); out();
}

/* ===================== MAPAS SALVOS ===================== */

// o mapa precisa ter o jogador e pelo menos um inimigo (senão a fase termina na hora)
function valid() {
    const r = rows();
    if (!r.some(x => x.includes('P'))) { alert('Coloque o Jogador no mapa.'); return false; }
    if (!r.some(x => x.includes('E')) &&
        !objects.some(row => row.some(id => ELEMENT_BY_ID[id]?.char === 'E'))) {
        alert('Coloque pelo menos um Inimigo.'); return false;
    }
    return true;
}

function renderList() {
    const maps = getMaps();
    listEl.innerHTML = '';
    if (!maps.length) { listEl.innerHTML = '<li>Nenhum mapa salvo</li>'; return; }
    maps.forEach(m => {
        const li = document.createElement('li');
        if (m.id === curId) li.className = 'cur';
        const s = document.createElement('span');
        s.textContent = m.name; s.title = m.name;
        const e = document.createElement('button');
        e.textContent = 'Editar'; e.onclick = () => openMap(m.id);
        const d = document.createElement('button');
        d.textContent = 'Excluir'; d.onclick = () => delMap(m.id);
        li.append(s, e, d); listEl.append(li);
    });
}

function saveMap() {
    if (!valid()) return;
    const maps = getMaps();
    const name = nameIn.value.trim() || 'Mapa ' + (maps.length + 1);
    const m = maps.find(x => x.id === curId);
    if (m) Object.assign(m, { name, ...mapData() });
    else { curId = 'm' + Date.now(); maps.push({ id: curId, name, ...mapData() }); }
    nameIn.value = name;
    saveMaps(maps); renderList();
    say('Mapa "' + name + '" salvo. Substitua maps.js na pasta do OneDrive pelo arquivo baixado para sincronizar.');
}

function openMap(id) {
    const m = getMaps().find(x => x.id === id);
    if (!m) return;
    useMapData(m);
    curId = id; nameIn.value = m.name;
    out(); renderList();
    say('Editando "' + m.name + '". Lembre de salvar.');
}

function delMap(id) {
    const maps = getMaps(), m = maps.find(x => x.id === id);
    if (!m || !confirm('Excluir o mapa "' + m.name + '"?')) return;
    saveMaps(maps.filter(x => x.id !== id));
    if (curId === id) curId = null;
    renderList(); say('Mapa excluído. Substitua maps.js na pasta do OneDrive pelo arquivo baixado para sincronizar.');
}

document.getElementById('save').onclick = saveMap;

document.getElementById('new').onclick = () => {
    curId = null; nameIn.value = '';
    g = blank(COLS, ROWS); terrain = blankLayer(COLS, ROWS, 'grass');
    objects = blankLayer(COLS, ROWS, null); blocking = blankLayer(COLS, ROWS, null);
    draw(); out(); renderList();
    say('Novo mapa em branco.');
};

document.getElementById('defaults').onclick = () => {
    if (!confirm('Adicionar de volta as fases padrão (do levels.js)?')) return;
    saveMaps(addMissingDefaultMaps(getMaps()));
    renderList(); say('Mapas padrão adicionados. Substitua maps.js na pasta do OneDrive pelo arquivo baixado para sincronizar.');
};

document.getElementById('test').onclick = () => {
    if (!valid()) return;
    sessionStorage.setItem('bomber_test_map', JSON.stringify(mapData()));
    window.open('index.html?teste=1', '_blank');
};

renderCatalog(); fit(); draw(); out(); renderList();
