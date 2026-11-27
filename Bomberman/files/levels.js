// Legenda: # parede fixa | + bloco destrutível | . chão | P início do jogador | E inimigo
// Fases incluídas: Fase 1, Fase 2 e Planícies Verdes.
// Cole aqui o código gerado pelo editor, se quiser adicionar mais fases.

// Atalhos usados só para deixar as camadas da fase "Planícies Verdes" mais compactas
const _ = null, G = 'grass', D = 'dirt', DG = 'dark-grass';
const WS = 'wall-stone', CR = 'crate', RC = 'reinforced-crate', RB = 'rune-block';
const EP = 'enemy-pursuer', EC = 'enemy-coward';

const LEVELS = [
    // Fase 1
    [
        "#############",
        "#P..+.+.+..E#",
        "#.#.#+#.#.#.#",
        "#.+.+..+..+.#",
        "#+#.#.#+#.#+#",
        "#..+..E+..+.#",
        "#.#.#+#.#.#.#",
        "#+..+...+..+#",
        "#.#+#.#.#+#.#",
        "#E..+.+..+..#",
        "#############"
    ],
    // Fase 2
    [
        "#############",
        "#P.++.+.++.E#",
        "#.#+#.#.#+#.#",
        "#++.+.E.+.++#",
        "#+#.#+#+#.#+#",
        "#.+.+.+.+.+.#",
        "#.#+#.#.#+#.#",
        "#+.+..+E.+.+#",
        "#.#.#+#+#.#.#",
        "#E.++.+.++..#",
        "#############"
    ],
    // Planícies Verdes
    {
        version: 2,
        theme: "plains",
        id: "builtin-plains-verdes",
        name: "Planícies Verdes",
        rows: [
            "#######################",
            "#.+..+#.+.#.+.E#++.##E#",
            "#+#P#.++#.+.##.+.#..#.#",
            "#.+.++#.+.#E#.+#.##+.+#",
            "###+#.+E#+.+.+##+..E#.#",
            "#.+.#+#+...#.+..E#+####",
            "#+#+.E#.##.#+###+#..+.#",
            "#.#.#.+.#+.+..E+..+##.#",
            "#++..+#+.E.###+#+.#+..#",
            "#.#+#.##.#+#+..##..E.##",
            "#E+.#+..+.+..#+..+#+#.#",
            "#+#.E.#+#.#+##.##.E.++#",
            "#.###+#.#+#..+E.#+#.#E#",
            "#.+...+E+..+#.#...#.+.#",
            "#######################"
        ],
        terrain: [
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, D, G, G, G, DG, DG, G, G, G, DG, D, G, G, G],
            [G, G, G, D, D, G, G, G, G, D, G, DG, G, G, DG, DG, G, G, DG, D, DG, DG, G],
            [G, G, G, D, D, G, G, G, G, G, G, DG, G, G, DG, G, G, G, G, D, D, G, G],
            [G, G, G, G, G, DG, G, G, G, D, G, DG, G, G, G, G, DG, DG, DG, G, G, G, G],
            [G, G, DG, DG, DG, DG, G, G, D, D, G, DG, G, G, D, D, D, G, DG, DG, G, G, G],
            [G, DG, G, G, G, DG, G, G, D, D, DG, G, G, D, D, G, G, G, G, G, G, G, G],
            [G, DG, G, D, D, DG, G, DG, G, G, DG, DG, DG, DG, G, G, G, G, G, G, G, G, G],
            [G, DG, G, D, D, DG, G, DG, DG, DG, G, G, G, G, G, G, G, G, G, G, DG, G, G],
            [G, DG, G, G, D, G, G, G, DG, G, G, G, G, D, G, G, G, DG, DG, DG, DG, G, G],
            [G, G, G, D, G, G, G, DG, DG, G, D, D, D, D, G, G, G, G, G, G, G, DG, G],
            [G, G, G, D, G, G, G, G, G, G, D, G, G, G, G, G, G, G, G, G, G, DG, G],
            [G, G, G, D, G, G, G, G, G, G, G, DG, G, G, G, G, G, G, G, DG, G, DG, G],
            [G, G, G, G, G, G, G, G, G, DG, DG, DG, G, G, G, G, DG, DG, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G]
        ],
        objects: [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, RB, _, _, CR, WS, _, CR, _, WS, _, CR, _, EP, WS, RC, RB, _, WS, WS, EC, _],
            [_, RC, WS, _, WS, _, CR, RB, WS, _, CR, _, WS, WS, _, CR, _, WS, _, _, WS, _, _],
            [_, _, CR, _, CR, RC, WS, _, CR, _, WS, 'E', WS, _, RC, WS, _, WS, WS, CR, _, RC, _],
            [_, WS, WS, CR, WS, _, CR, EC, WS, CR, _, RB, _, CR, WS, WS, CR, _, _, EP, WS, _, _],
            [_, _, RB, _, WS, CR, WS, RC, _, _, _, WS, _, RB, _, _, 'E', WS, RB, WS, WS, WS, _],
            [_, RB, WS, RC, _, EP, WS, _, WS, WS, _, WS, RB, WS, WS, WS, CR, WS, _, _, RB, _, _],
            [_, _, WS, _, WS, _, CR, _, WS, CR, _, CR, _, _, EP, CR, _, _, CR, WS, WS, _, _],
            [_, RC, CR, _, _, CR, WS, RC, _, EC, _, WS, WS, WS, RC, WS, CR, _, WS, RC, _, _, _],
            [_, _, WS, RB, WS, _, WS, WS, _, WS, RC, WS, RB, _, _, WS, WS, _, _, EC, _, WS, _],
            [_, 'E', RC, _, WS, CR, _, _, RC, _, CR, _, _, WS, CR, _, _, RC, WS, CR, WS, _, _],
            [_, CR, WS, _, EC, _, WS, CR, WS, _, WS, CR, WS, WS, _, WS, WS, _, 'E', _, CR, RC, _],
            [_, _, WS, WS, WS, CR, WS, _, WS, CR, WS, _, _, CR, 'E', _, WS, CR, WS, _, WS, EP, _],
            [_, _, RB, _, _, _, RC, EP, CR, _, _, CR, WS, _, WS, _, _, _, WS, _, CR, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
        ],
        blocking: Array.from({ length: 15 }, () => Array(23).fill(null))
    }
];