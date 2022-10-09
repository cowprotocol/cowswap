/**
 * Created by Shoom on 14.05.15.
 */
if (typeof require != 'undefined') {
    var Level = require('../js/Level.js');
}

var level1 = {
    matrix: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    cellConstructors: {
        //стена
        1: {
            name: 'wall',
            hardBlock: true,
            check: function (player, dir) {
            }
        },
        //бонус
        3: {
            name: 'bonus',
            check: function (player, check, silent) {
                if (check && !silent) {
                    this.destroy();
                    player.changeMatrix(this, 0);
                }

                if (silent || check) {
                    player.level.bonusCount--;
                    if (player.level.bonusCount == 0) {
                        player.level.openGate();
                    }
                }
            },
            constructor: function () {
                this.level.bonusCount++;
            }
        },
        //вороты выхода с уровня
        5: {
            name: 'gate',
            check: function (player, check, silent) {
                if (check) {
                    if (this.level.gateIsOpen) {
                        player.win();
                    }
                }
            },
            render: function () {
                this.level.ctx.drawImage(this.level.sprites[this.level.gateIsOpen ? 'gate_open' : 'gate_close'], this.x, this.y)
            }
        },
        //колючка
        7: {
            name: 'thorn',
            hardBlock: true,
            check: function (player, check, silent) {
                if (check) player.lose();
            }
        },
        9: 'player'
    },
    sprites: {
        kolobok: 'images/kolobok.png',
        kolobok2: 'images/kolobok2.png',
        wall: 'images/wall.png',
        passiveCells: 'images/default.png',
        gate_open: 'images/gate_open.png',
        gate_close: 'images/gate_close.png',
        thorn: 'images/thorn.png',
        bonus: 'images/bonus.png'
    },
    init: function (onload) {
        return new Level(this.matrix, this.cellConstructors, this.sprites, {
            cellSize: 32
        }, onload);
    }
};

if (typeof module !== 'undefined') {
    module.exports = level1;
}