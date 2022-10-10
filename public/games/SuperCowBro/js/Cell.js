/**
 * Created by Shoom on 10.05.15.
 */

/**
 * Активный блок
 * @param {Number} row номер строки в матрице
 * @param {Number} col номер столбца в матрице
 * @param {Number} width ширина блока
 * @param {Number} height высота блока
 * @param {Level} level уровень
 * @param {Object} params параметры блока
 * */
var Cell = function (row, col, width, height, level, params) {
    //номер строки в матрице
    this.row = row;
    //номер столбца в матрице
    this.col = col;
    //ширина блока
    this.width = width;
    //высота блока
    this.height = height;
    //x
    this.x = this.col * this.width;
    //y
    this.y = this.row * this.height;
    //уровень
    this.level = level;
    //спрайт блока
    this.sprite = params.sprite;
    //твердый ли блок (если твердый через него нельзя походить)
    this.hardBlock = params.hardBlock || false;
    //callback проверки на пересечение с игроком
    this._check = params.check;

    //уничтожение блока
    this.destroy = function () {
        this.level.originalMatrix[this.row][this.col] = 0;
        this.level.passiveCells.push([this.x, this.y]);
        this.level.activeCells.remove(this);
    };

    /**
     * проверка пересечения с игроком
     * @param {Player} player игрок
     * @return {String|Boolean} результат проверки на касание, если касание, то сторона покоторой коснулось иначе false
     * */
    this.colCheck = function (player) {
        var vX = (player.x + (player.width / 2)) - (this.x + (this.width / 2)),
            vY = (player.y + (player.height / 2)) - (this.y + (this.height / 2)),
            hWidths = (player.width / 2) + (this.width / 2),
            hHeights = (player.height / 2) + (this.height / 2),
            colDir = null;

        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    if (this.hardBlock) player.y += oY;
                } else {
                    colDir = "b";
                    if (this.hardBlock) player.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    if (this.hardBlock) player.x += oX;
                } else {
                    colDir = "r";
                    if (this.hardBlock) player.x -= oX;
                }
            }
        }
        return colDir;
    };

    this.getData = function () {
        return {
            row: this.row,
            col: this.col,
            val: this.val()
        };
    };

    this.val = function (value) {
        if (typeof value !== 'undefined') {
            this.level.originalMatrix[this.row][this.col] = value;
            return this;
        } else {
            return this.level.originalMatrix[this.row][this.col];
        }
    };

    //назначаем функцию рендеринга
    if (params.render) {
        this.render = params.render;
    } else {
        this.render = function () {
            if (this.level.cellIsVisible(this)) {
                this.level.ctx.drawImage(this.sprite, this.x, this.y);
            }
        };
    }

    //У твердых блоков корректируем положение игрока и затем обрабатываем индивидуальный callback
    if (this.hardBlock) {
        /**
         * проверка пересечения с игроком
         * @param {Player} player игрок
         * @param {Boolean} silent синхронизировать ли с сервером
         * */
        this.check = function (player, silent) {
            var dir = this.colCheck(player);
            if (dir === "l" || dir === "r") {
                player.velX = 0;
                player.jumping = false;
            } else if (dir === "b") {
                player.grounded = true;
                player.jumping = false;
                player.velY = 0;
            } else if (dir === "t") {
                player.velY = 0;
            }

            return this._check.apply(this, [player, dir, silent]);
        };
    } else {
        /**
         * проверка пересечения с игроком
         * @param {Player} player игрок
         * @param {Boolean} silent синхронизировать ли с сервером
         * */
        this.check = function (player, silent) {
            return this._check.apply(this, [player, this.colCheck(player), silent]);
        };
    }

    //индивидуальный конструктор ячейки
    if (params.constructor) params.constructor.apply(this);
};

if (typeof module !== 'undefined') {
    module.exports = Cell;
}
