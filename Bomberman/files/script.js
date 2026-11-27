const $ = id => document.getElementById(id);
const cv = $('game'), ctx = cv.getContext('2d'), msg = $('msg'), pwin = $('pwin');

// ?fase=... é usado pelo botão "Testar fase" do editor
const q = new URLSearchParams(location.search).get('fase');
const testMode = !!q || new URLSearchParams(location.search).has('teste');
let testMap = null;
if (new URLSearchParams(location.search).has('teste')) {
    try { testMap = JSON.parse(sessionStorage.getItem('bomber_test_map')); } catch (e) { }
    sessionStorage.removeItem('bomber_test_map');
}

// o tamanho do mapa é lido de cada fase (em load)
let COLS = 13, ROWS = 11;
let levels = [], names = [];   // mapas da partida atual (começa no escolhido e segue para os próximos)

const DIRS = {
    ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0]
};

let grid, mapTerrain = [], mapObjects = [], mapBlocking = [], player, start = { x: 1, y: 1 }, bombs = [], flames = [], enemies = [], items = [], iceProjectiles = [], held = [];
let stats = { range: 2, max: 1 }, score = 0, lives = 3, lvl = 0, state = 'menu', timer = 0, last = 0, overAt = 0;
let playerFrozen = 0, animationTime = 0, blastId = 0;
let hi = +localStorage.getItem('bomber_hi') || 0;
let screen = 'menu', sel = 0, allMaps = [];

/* ===================== TELAS (menu / seleção / jogo) ===================== */

const opts = () => [...document.querySelectorAll('#s-' + screen + ' .opt')];

function mark() {
    opts().forEach((el, i) => el.classList.toggle('sel', i === sel));
    opts()[sel]?.scrollIntoView({ block: 'nearest' });
}

function show(s) {
    screen = s; sel = 0;
    ['menu', 'select', 'game'].forEach(n => $('s-' + n).hidden = n !== s);
    mark();
}

function toMenu() { state = 'menu'; closePw(); show('menu'); }

function askCode() {
    $('pw').hidden = false; $('pwerr').textContent = '';
    pwin.value = ''; pwin.focus();
}
function closePw() { $('pw').hidden = true; pwin.blur(); }

function exitGame() {
    window.close();
    if (!window.closed)
        window.alert('O navegador não permite fechar esta aba automaticamente. Feche a janela do jogo para sair.');
}

pwin.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (pwin.value === EDITOR_CODE) {
            sessionStorage.setItem('bomber_ed', '1');
            location.href = 'editor.html';
        } else {
            pwin.value = ''; $('pwerr').textContent = 'CÓDIGO ERRADO';
        }
    } else if (e.key === 'Escape') closePw();
});

function openSelect() {
    allMaps = getMaps();
    const ul = $('maps'); ul.innerHTML = '';
    if (!allMaps.length) {
        const li = document.createElement('li');
        li.className = 'none'; li.textContent = 'NENHUM MAPA SALVO';
        ul.append(li);
    }
    allMaps.forEach((m, i) => {
        const li = document.createElement('li');
        li.className = 'opt'; li.dataset.i = i; li.textContent = m.name;
        const s = document.createElement('small');
        s.textContent = m.rows[0].length + 'x' + m.rows.length;
        li.append(s); ul.append(li);
    });
    const b = document.createElement('li');
    b.className = 'opt'; b.dataset.act = 'back'; b.textContent = 'VOLTAR';
    ul.append(b);
    show('select');
}

function play(i) {
    const order = allMaps.slice(i).concat(allMaps.slice(0, i));
    levels = order; names = order.map(m => m.name);
    newGame(); show('game');
}

function back() {
    if (testMode) { window.close(); return; }
    state = 'menu'; openSelect();
}

document.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return;
    const a = o.dataset.act;
    if (a === 'start') openSelect();
    else if (a === 'editor') askCode();
    else if (a === 'exit') exitGame();
    else if (a === 'back') toMenu();
    else if (o.dataset.i !== undefined) play(+o.dataset.i);
});

/* ===================== JOGO ===================== */

function say(html) { msg.innerHTML = html; }
function hud() {
    $('score').textContent = score; $('hi').textContent = hi;
    $('level').textContent = (names[lvl % names.length] || '').slice(0, 10);
    $('lives').textContent = lives;
}

// ajusta o canvas ao tamanho do mapa e à tela (mapas grandes/altos diminuem para caber)
function fit() {
    cv.width = COLS * T; cv.height = ROWS * T;
    const maxW = Math.min(innerWidth * 0.94, 832) - 8;
    const maxH = innerHeight * 0.68;
    const w = Math.floor(Math.min(maxW, maxH * COLS / ROWS));
    cv.style.width = w + 'px';
    cv.style.aspectRatio = COLS + ' / ' + ROWS;
    $('hud').style.width = (w + 8) + 'px';
}
addEventListener('resize', fit);

function load() {
    const level = levels[lvl % levels.length];
    const L = Array.isArray(level) ? { rows: level } : level;
    grid = L.rows.map(r => [...r]);
    ROWS = grid.length; COLS = grid[0].length;
    mapTerrain = Array.from({ length: ROWS }, (_, y) =>
        Array.from({ length: COLS }, (_, x) => ELEMENT_BY_ID[L.terrain?.[y]?.[x]]?.category === 'Terrenos' ? L.terrain[y][x] : 'grass'));
    mapObjects = Array.from({ length: ROWS }, (_, y) =>
        Array.from({ length: COLS }, (_, x) => ELEMENT_BY_ID[L.objects?.[y]?.[x]]?.category !== 'Terrenos' ? L.objects?.[y]?.[x] || null : null));
    mapBlocking = Array.from({ length: ROWS }, (_, y) =>
        Array.from({ length: COLS }, (_, x) => typeof L.blocking?.[y]?.[x] === 'boolean' ? L.blocking[y][x] : null));
    fit();
    bombs = []; flames = []; enemies = []; items = []; iceProjectiles = []; held = [];
    playerFrozen = 0;
    grid.forEach((row, y) => row.forEach((c, x) => {
        if (c === 'P') { start = { x, y }; row[x] = '.'; }
        const objectId = mapObjects[y][x];
        const objectElement = ELEMENT_BY_ID[objectId];
        if (objectElement?.category === 'Objetos especiais' && objectElement.char === 'E' && c !== 'P') {
            enemies.push(createEnemy(x, y, objectId));
            mapObjects[y][x] = null;
            row[x] = '.';
        } else if (c === 'E') {
            enemies.push(createEnemy(x, y, 'E'));
            row[x] = '.';
        }
    }));
    player = { x: start.x, y: start.y, cd: 0, inv: 1500 };
    hud();
}

function newGame() {
    stats = { range: 2, max: 1 }; score = 0; lives = 3; lvl = 0;
    animationTime = 0; load(); state = 'play'; say('');
}

function free(x, y, isPlayer) {
    if (grid[y]?.[x] !== '.') return false;
    const objectId = mapObjects[y]?.[x], element = ELEMENT_BY_ID[objectId];
    if (element && (typeof mapBlocking[y][x] === 'boolean' ? mapBlocking[y][x] : !!element.solid)) return false;
    return !bombs.some(b => b.x === x && b.y === y && !(isPlayer && b.pass));
}

function createEnemy(x, y, type) {
    const element = ELEMENT_BY_ID[type] || ELEMENT_BY_ID.E;
    return {
        x, y, type, homeX: x, homeY: y, fromX: x, fromY: y,
        dir: [0, 1], hp: element.hp || 1, hitBy: new Set(),
        moveDuration: element.speed || 420, moveTimer: 0,
        moveProgress: 1, moving: false, attackCooldown: 0, attackAnim: 0
    };
}

function enemyMoveDuration(enemy, x, y) {
    const element = ELEMENT_BY_ID[enemy.type] || ELEMENT_BY_ID.E;
    let duration = element.speed || 420;
    if (enemy.type === 'enemy-slippery') {
        const terrain = mapTerrain[y]?.[x];
        duration = ['ice', 'snow', 'cracked-ice', 'dark-ice'].includes(terrain) ? 280 : 560;
    }
    return Math.max(220, duration - lvl * 35);
}

function findPathStep(x, y, goal) {
    const queue = [{ x, y, first: null }];
    const visited = new Set([x + ',' + y]);
    for (let i = 0; i < queue.length; i++) {
        const current = queue[i];
        for (const direction of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = current.x + direction[0], ny = current.y + direction[1];
            const key = nx + ',' + ny;
            if (visited.has(key) || !free(nx, ny, false)) continue;
            const first = current.first || direction;
            if (goal(nx, ny)) return first;
            visited.add(key);
            queue.push({ x: nx, y: ny, first });
        }
    }
    return null;
}

function bombDangerCells() {
    const cells = new Set();
    flames.forEach(flame => cells.add(flame.x + ',' + flame.y));
    bombs.forEach(b => {
        cells.add(b.x + ',' + b.y);
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            for (let i = 1; i <= b.range; i++) {
                const x = b.x + dx * i, y = b.y + dy * i, cell = grid[y]?.[x];
                if (!cell || cell === '#') break;
                cells.add(x + ',' + y);
                if (cell === '+' || ELEMENT_BY_ID[mapObjects[y]?.[x]]?.char === '+') break;
            }
        }
    });
    return cells;
}

function bombThreatens(x, y, danger) {
    return danger.has(x + ',' + y) ||
        bombs.some(b => Math.abs(x - b.x) + Math.abs(y - b.y) <= b.range + 1);
}

function findEscapeStep(enemy, danger) {
    if (!bombThreatens(enemy.x, enemy.y, danger)) return null;
    const queue = [{ x: enemy.x, y: enemy.y, first: null }];
    const visited = new Set([enemy.x + ',' + enemy.y]);
    for (let i = 0; i < queue.length; i++) {
        const current = queue[i];
        for (const direction of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = current.x + direction[0], ny = current.y + direction[1];
            const key = nx + ',' + ny;
            if (visited.has(key) || !free(nx, ny, false)) continue;
            const first = current.first || direction;
            if (!bombThreatens(nx, ny, danger)) return first;
            visited.add(key);
            queue.push({ x: nx, y: ny, first });
        }
    }
    return null;
}

function randomEnemyStep(enemy) {
    const options = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(d => free(enemy.x + d[0], enemy.y + d[1], false));
    if (!options.length) return null;
    const forward = options.find(d => d[0] === enemy.dir[0] && d[1] === enemy.dir[1]);
    return forward && Math.random() > .2 ? forward : options[Math.random() * options.length | 0];
}

function chooseEnemyStep(enemy, danger) {
    const type = ELEMENT_BY_ID[enemy.type]?.ai;
    if (type === 'coward') return findEscapeStep(enemy, danger) || randomEnemyStep(enemy);
    if (type === 'pursuer' || (type === 'guardian' &&
        Math.abs(player.x - enemy.x) + Math.abs(player.y - enemy.y) <= 6)) {
        return findPathStep(enemy.x, enemy.y, (x, y) => x === player.x && y === player.y) || randomEnemyStep(enemy);
    }
    if (type === 'guardian') {
        const patrol = randomEnemyStep(enemy);
        if (patrol && Math.abs(enemy.x + patrol[0] - enemy.homeX) <= 4 &&
            Math.abs(enemy.y + patrol[1] - enemy.homeY) <= 4) return patrol;
        return null;
    }
    return randomEnemyStep(enemy);
}

function iceShotPath(enemy) {
    const dx = player.x - enemy.x, dy = player.y - enemy.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    if (!distance || distance > 4 || (dx && dy)) return null;
    const direction = [Math.sign(dx), Math.sign(dy)];
    for (let i = 1; i < distance; i++) {
        if (!free(enemy.x + direction[0] * i, enemy.y + direction[1] * i, false)) return null;
    }
    return { direction, distance };
}

function updateEnemy(enemy, dt, danger) {
    enemy.moveTimer -= dt;
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.attackAnim = Math.max(0, enemy.attackAnim - dt);

    if (enemy.moving) {
        enemy.moveProgress = Math.min(1, enemy.moveProgress + dt / enemy.moveDuration);
        if (enemy.moveProgress >= 1) {
            enemy.moving = false;
            enemy.fromX = enemy.x; enemy.fromY = enemy.y;
        }
    }
    if (!enemy.moving && enemy.moveTimer <= 0) {
        const direction = chooseEnemyStep(enemy, danger);
        if (direction) {
            enemy.fromX = enemy.x; enemy.fromY = enemy.y;
            enemy.x += direction[0]; enemy.y += direction[1];
            enemy.dir = direction;
            enemy.moveDuration = enemyMoveDuration(enemy, enemy.x, enemy.y);
            enemy.moveProgress = 0; enemy.moving = true;
            enemy.moveTimer = enemy.moveDuration;
        } else enemy.moveTimer = 120;
    }

    if (enemy.type === 'enemy-freezer' && enemy.attackCooldown <= 0) {
        const shot = iceShotPath(enemy);
        if (shot) {
            iceProjectiles.push({
                x: enemy.x, y: enemy.y, targetX: player.x, targetY: player.y,
                direction: shot.direction, distance: shot.distance,
                t: 0, duration: shot.distance * 110
            });
            enemy.attackCooldown = 2200;
            enemy.attackAnim = 260;
        }
    }
}

function placeBomb() {
    if (state !== 'play' || bombs.length >= stats.max ||
        bombs.some(b => b.x === player.x && b.y === player.y)) return;
    bombs.push({ x: player.x, y: player.y, t: 2000, range: stats.range, pass: true });
}

function explode(b) {
    bombs = bombs.filter(o => o !== b);
    const id = ++blastId;
    flames.push({ x: b.x, y: b.y, t: 500, duration: 500, blastId: id, kind: 'center' });
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const kind = dx ? 'horizontal' : 'vertical';
        for (let i = 1; i <= b.range; i++) {
            const x = b.x + dx * i, y = b.y + dy * i, c = grid[y]?.[x];
            if (!c || c === '#') break;
            const destructible = c === '+' || ELEMENT_BY_ID[mapObjects[y]?.[x]]?.char === '+';
            const nextX = x + dx, nextY = y + dy, next = grid[nextY]?.[nextX];
            const nextIsBlock = !next || next === '#' || next === '+' ||
                ELEMENT_BY_ID[mapObjects[nextY]?.[nextX]]?.char === '+';
            flames.push({
                x, y, t: 500, duration: 500, blastId: id, kind,
                cap: destructible || i === b.range || nextIsBlock,
                direction: [dx, dy]
            });
            if (destructible) {
                grid[y][x] = '.'; score += 10;
                mapObjects[y][x] = null; mapBlocking[y][x] = null;
                if (Math.random() < .25) items.push({ x, y, t: Math.random() < .5 ? 'R' : 'B' });
                break;
            }
            items = items.filter(it => !(it.x === x && it.y === y));
            const o = bombs.find(o => o.x === x && o.y === y);
            if (o) o.t = 0; // reação em cadeia
        }
    }
}

function hurt() {
    lives--;
    if (lives <= 0) {
        state = 'over'; overAt = Date.now();
        if (score > hi) { hi = score; if (!testMode) localStorage.setItem('bomber_hi', hi); }
        say('FIM DE JOGO<small>PONTOS: ' + score + '<br>ENTER OU ESPAÇO PARA CONTINUAR</small>');
    } else {
        player.x = start.x; player.y = start.y; player.inv = 2000; player.cd = 0; playerFrozen = 0;
    }
    hud();
}

function update(dt) {
    animationTime += dt;
    if (state === 'clear') {
        timer -= dt;
        if (timer <= 0) { lvl++; load(); state = 'play'; say(''); }
        return;
    }
    if (state !== 'play') return;

    // jogador
    player.cd -= dt; player.inv -= dt; playerFrozen = Math.max(0, playerFrozen - dt);
    const k = held[held.length - 1];
    if (k && player.cd <= 0 && playerFrozen <= 0) {
        const [dx, dy] = DIRS[k];
        if (free(player.x + dx, player.y + dy, true)) { player.x += dx; player.y += dy; player.cd = 130; }
    }
    bombs.forEach(b => { if (b.pass && (b.x !== player.x || b.y !== player.y)) b.pass = false; });

    // itens
    items = items.filter(i => {
        if (i.x !== player.x || i.y !== player.y) return true;
        if (i.t === 'R') stats.range = Math.min(6, stats.range + 1);
        else stats.max = Math.min(5, stats.max + 1);
        score += 50; return false;
    });

    // bombas e chamas
    for (const b of [...bombs]) { b.t -= dt; if (b.t <= 0 && bombs.includes(b)) explode(b); }
    flames.forEach(f => f.t -= dt);
    flames = flames.filter(f => f.t > 0);

    iceProjectiles = iceProjectiles.filter(projectile => {
        projectile.t += dt;
        if (projectile.t < projectile.duration) return true;
        if (player.x === projectile.targetX && player.y === projectile.targetY)
            playerFrozen = Math.max(playerFrozen, 1200);
        return false;
    });

    // inimigos: um passo lógico por vez, com posição visual interpolada entre as células
    const danger = bombDangerCells();
    enemies.forEach(enemy => updateEnemy(enemy, dt, danger));
    enemies = enemies.filter(e => {
        const hits = new Set(flames.filter(f => f.x === e.x && f.y === e.y).map(f => f.blastId));
        hits.forEach(id => {
            if (e.hitBy.has(id)) return;
            e.hitBy.add(id);
            e.hp--;
        });
        if (e.hp > 0) return true;
        score += ELEMENT_BY_ID[e.type]?.points || 100;
        return false;
    });

    // dano no jogador
    if (player.inv <= 0 && (flames.some(f => f.x === player.x && f.y === player.y) ||
        enemies.some(e => e.x === player.x && e.y === player.y))) hurt();

    // fase completa
    if (state === 'play' && !enemies.length) {
        score += 500; state = 'clear'; timer = 2000;
        say('FASE COMPLETA!<small>+500 PONTOS</small>');
    }
    hud();
}

function drawBomb(bomb) {
    const urgency = Math.max(0, 1 - bomb.t / 2000);
    const pulse = 1 + (0.04 + urgency * 0.08) * Math.sin(animationTime / (110 - urgency * 55));
    const px = bomb.x * T, py = bomb.y * T;
    ctx.save();
    ctx.translate(px + T / 2, py + T / 2);
    ctx.scale(pulse, pulse);
    sprite(ctx, SPR.bomb, PAL, -T / 2, -T / 2);
    ctx.restore();

    const blink = Math.sin(animationTime / (90 - urgency * 65)) > 0;
    ctx.fillStyle = blink ? '#fff7b2' : '#ffd93b';
    ctx.fillRect(px + 7, py + 1, urgency > .75 ? 3 : 2, 2);
    if (urgency > .75 && blink) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 8, py, 1, 1);
    }
}

function drawFlame(flame) {
    const progress = 1 - flame.t / flame.duration;
    const growth = progress < .2 ? .72 + progress * 1.4 : progress > .68 ? 1 - (progress - .68) * .65 : 1;
    const opacity = progress < .62 ? 1 : Math.max(0, (1 - progress) / .38);
    const px = flame.x * T, py = flame.y * T;
    const flicker = (Math.floor(animationTime / 55) + flame.x * 3 + flame.y * 5) % 2;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(px + T / 2, py + T / 2);
    ctx.scale(growth, growth);
    ctx.translate(-T / 2, -T / 2);

    ctx.fillStyle = progress > .72 ? '#d9423a' : '#f08a24';
    if (flame.kind === 'center') {
        ctx.fillRect(4, 0, 8, 16); ctx.fillRect(0, 4, 16, 8);
        ctx.fillStyle = '#ffd93b';
        ctx.fillRect(6, 2, 4, 12); ctx.fillRect(2, 6, 12, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(6, 6, 4, 4);
    } else if (flame.kind === 'horizontal') {
        ctx.fillRect(0, 4, 16, 8);
        ctx.fillStyle = '#ffd93b'; ctx.fillRect(0, 6, 16, 4);
        ctx.fillStyle = flicker ? '#fff' : '#fff1a8'; ctx.fillRect(3, 7, 10, 2);
    } else {
        ctx.fillRect(4, 0, 8, 16);
        ctx.fillStyle = '#ffd93b'; ctx.fillRect(6, 0, 4, 16);
        ctx.fillStyle = flicker ? '#fff' : '#fff1a8'; ctx.fillRect(7, 3, 2, 10);
    }
    if (flame.cap && flame.direction) {
        const [dx, dy] = flame.direction;
        ctx.fillStyle = '#ffb52e';
        if (dx > 0) ctx.fillRect(12, 3, 4, 10);
        else if (dx < 0) ctx.fillRect(0, 3, 4, 10);
        else if (dy > 0) ctx.fillRect(3, 12, 10, 4);
        else ctx.fillRect(3, 0, 10, 4);
    }
    ctx.restore();
}

function drawIceProjectile(projectile) {
    const progress = Math.min(1, projectile.t / projectile.duration);
    const x = projectile.x + projectile.direction[0] * projectile.distance * progress;
    const y = projectile.y + projectile.direction[1] * projectile.distance * progress;
    ctx.fillStyle = '#65cfe5';
    ctx.fillRect(x * T + 5, y * T + 5, 6, 6);
    ctx.fillStyle = '#e5ffff';
    ctx.fillRect(x * T + 7, y * T + 3, 2, 10);
    ctx.fillRect(x * T + 3, y * T + 7, 10, 2);
}

function drawFreezeEffect() {
    if (playerFrozen <= 0) return;
    const px = player.x * T, py = player.y * T;
    ctx.fillStyle = 'rgba(126, 223, 255, 0.45)';
    ctx.fillRect(px + 1, py + 1, T - 2, T - 2);
    ctx.fillStyle = '#e5ffff';
    ctx.fillRect(px + 2, py + 2, 3, 2);
    ctx.fillRect(px + 11, py + 11, 3, 2);
}

function draw() {
    if (!grid) return;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        drawTerrain(ctx, mapTerrain[y][x], x, y);
        const c = grid[y][x], objectId = mapObjects[y][x];
        if (objectId) drawObject(ctx, objectId, x, y);
        else if (c === '#') drawObject(ctx, 'wall-stone', x, y);
        else if (c === '+') drawObject(ctx, 'crate', x, y);
    }
    items.forEach(i => {
        ctx.fillStyle = '#cfd8e6'; ctx.fillRect(i.x * T + 1, i.y * T + 1, 14, 14);
        sprite(ctx, i.t === 'R' ? SPR.fire : SPR.bomb, PAL, i.x * T, i.y * T);
    });
    bombs.forEach(drawBomb);
    flames.forEach(drawFlame);
    iceProjectiles.forEach(drawIceProjectile);
    enemies.forEach(enemy => {
        const x = enemy.moving ? enemy.fromX + (enemy.x - enemy.fromX) * enemy.moveProgress : enemy.x;
        const y = enemy.moving ? enemy.fromY + (enemy.y - enemy.fromY) * enemy.moveProgress : enemy.y;
        const phase = animationTime / (enemy.moving ? 70 : 300) + enemy.x + enemy.y;
        drawEnemySprite(ctx, enemy.type || 'E', x * T, y * T, phase, enemy.dir[0]);
        if (enemy.attackAnim > 0) {
            ctx.fillStyle = '#baf5ff';
            ctx.fillRect(x * T + 4, y * T + 1, 8, 2);
        }
    });
    if (state !== 'over' && (player.inv <= 0 || (player.inv / 100 | 0) % 2))
        sprite(ctx, SPR.player, PAL, player.x * T, player.y * T);
    drawFreezeEffect();
}

function loop(ts) {
    const dt = Math.min(50, ts - last || 16); last = ts;
    update(dt); draw();
    requestAnimationFrame(loop);
}

/* ===================== TECLADO / JOYSTICK ===================== */

const keyOf = e => e.key.length === 1 ? e.key.toLowerCase() : e.key;

// confirma "pronto" (modo teste) ou "fim de jogo"
const ok = () => {
    if (state === 'ready') newGame();
    else if (state === 'over' && Date.now() - overAt > 1000) testMode ? newGame() : back();
};

addEventListener('keydown', e => {
    if (e.target === pwin) return; // digitando o código do editor
    const k = keyOf(e);

    // menus: setas escolhem, Enter/Espaço confirmam
    if (screen === 'menu' || screen === 'select') {
        const n = opts().length;
        if (k === 'ArrowUp' || k === 'w') { e.preventDefault(); sel = (sel + n - 1) % n; mark(); }
        else if (k === 'ArrowDown' || k === 's') { e.preventDefault(); sel = (sel + 1) % n; mark(); }
        else if ((k === 'Enter' || k === ' ') && !e.repeat) { e.preventDefault(); opts()[sel]?.click(); }
        else if (k === 'Escape') { screen === 'select' ? toMenu() : closePw(); }
        return;
    }

    // jogo
    if (DIRS[k]) { e.preventDefault(); if (!held.includes(k)) held.push(k); }
    else if (k === ' ') { e.preventDefault(); if (!e.repeat) state === 'play' ? placeBomb() : ok(); }
    else if (k === 'Enter') { if (!e.repeat) ok(); }
    else if (k === 'Escape') back();
});
addEventListener('keyup', e => { const k = keyOf(e); held = held.filter(h => h !== k); });

/* ===================== INÍCIO ===================== */

if (testMode) {
    // modo teste: aceita fases antigas na URL ou o mapa em camadas do editor
    if (testMap?.rows) levels = [testMap];
    else if (q) {
        try { const parsed = JSON.parse(q); levels = [parsed.rows ? parsed : { rows: parsed }]; }
        catch (e) { levels = [q.split('|')]; }
    } else levels = [];
    names = ['TESTE'];
    if (!levels.length) { say('MAPA DE TESTE NÃO ENCONTRADO'); show('game'); }
    else {
        load(); show('game'); state = 'ready';
        say('MODO TESTE<small>ENTER OU ESPAÇO PARA JOGAR</small>');
    }
} else {
    show('menu');
}
requestAnimationFrame(loop);
