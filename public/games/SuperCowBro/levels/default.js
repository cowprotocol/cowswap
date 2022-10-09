/**
 * Created by Shoom on 15.05.15.
 */

var default_level = function (matrix, onload) {
    var cellConstructors = {
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
            check: function (player, check) {
                if (check) {
                    this.destroy();
                    player.level.bonusCount--;
                    if (player.level.bonusCount === 0) {
                        player.level.openGate();
                    }
                }
            },
            constructor: function () {
                this.level.bonusCount++;
            }
        },
        //ворота выхода с уровня
        5: {
            name: 'gate',
            check: function (player, check) {
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
            check: function (player, check) {
                if (check) player.lose();
            }
        },
        9: 'player'
    };

    return new Level(matrix, cellConstructors, {
        kolobok: '../images/kolobok.png',
        kolobok2: '../images/kolobok2.png',
        wall: '../images/wall.png',
        passiveCells: '../images/default.png',
        gate_open: '../images/gate_open.png',
        gate_close: '../images/gate_close.png',
        thorn: '../images/thorn.png',
        bonus: '../images/bonus.png'
    }, {
        cellSize: 32
    }, onload);
};