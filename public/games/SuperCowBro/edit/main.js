/**
 * Created by Shoom on 12.05.15.
 */
var cell_size = 32;
var width = 840;
var height = 480;
var current_block;
var curpos = {x: 16, y: 16};
var matrix = [];
var max_y = 0;

var on_srite_load = function () {
    var blocks = document.getElementById('blocks');
    var block = document.createElement('div');
    block.style.width = cell_size + 'px';
    block.style.height = cell_size + 'px';
    block.style.backgroundImage = 'url("' + this.img.src + '")';
    block.name = this.name;
    block.onclick = function () {
        current_block.el.className = '';
        current_block.el = this;
        current_block.name = this.name;
        this.className = 'active';
    };
    blocks.appendChild(block);

    if (!current_block) current_block = {
        name: this.name,
        el: block
    };
};

var sprites = {
    bonus: new Sprite('../images/bonus.png', 'bonus', on_srite_load),
    wall: new Sprite('../images/wall.png', 'wall', on_srite_load),
    gate_close: new Sprite('../images/gate_close.png', 'gate_close', on_srite_load),
    thorn: new Sprite('../images/thorn.png', 'thorn', on_srite_load),
    player: new Sprite('../images/kolobok.png', 'player', on_srite_load)
};

var clear_sprite = new Sprite('../images/clear.png', 'clear');

var indexes = {
    wall: 1,
    bonus: 3,
    gate_close: 5,
    thorn: 7,
    player: 9
};

var sl = {
    1: 'wall',
    3: 'bonus',
    5: 'gate_close',
    7: 'thorn',
    9: 'player'
};

function get_matrix() {
    for (var i = 0; i < matrix.length; i++) {
        if (!matrix[i]) {
            matrix[i] = [];
            for (var q = 0; q < max_y; q++) {
                matrix[i][q] = 0;
            }
        } else {
            for (var v = 0; v < matrix[i].length; v++) {
                if (!matrix[i][v]) {
                    matrix[i][v] = 0;
                }
            }
        }
    }

    res.value = JSON.stringify(matrix);
    res.select();
    return JSON.parse(res.value);
}

$(window).load(function () {
    var $sc_width = $('#sc_width');
    var $sc_height = $('#sc_height');
    var scene = document.getElementById('scene');
    var ctx = scene.getContext('2d');
    var can_draw = false;
    var clear_mode = false;

    window.res = document.getElementById('res');
    res.addEventListener('change', function () {
        matrix = JSON.parse(res.value);
        max_y = 0;
        for (var i = 0; i < matrix.length; i++) {
            if (matrix[i] && max_y < matrix[i].length) max_y = matrix[i].length;
        }

        width = max_y * cell_size;
        height = matrix.length * cell_size;

        $sc_width.val(width);
        $sc_height.val(height);

        scene.width = width;
        scene.height = height;
    });

    $sc_width.change(function () {
        width = $sc_width.val();
        scene.width = width;
    });

    $sc_height.change(function () {
        height = $sc_height.val();
        scene.height = height;
    });

    $sc_width.val(width);
    $sc_height.val(height);

    scene.width = width;
    scene.height = height;

    current_block.el.className = 'active';

    scene.addEventListener('mousemove', function (evt) {
        var rect = this.getBoundingClientRect();
        curpos = {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }, false);

    scene.addEventListener('mousedown', function (evt) {
        can_draw = true;
    }, false);

    scene.addEventListener('mouseup', function (evt) {
        can_draw = false;
    }, false);

    scene.addEventListener('mousewheel', function (e) {
        var el = current_block.el[(e.wheelDelta > 0 ? 'next' : 'previous') + 'Sibling'];
        if (el) {
            el.onclick();
        }

        e.preventDefault();
        return false;
    }, false);

    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 16) {
            clear_mode = true;
        }
    });

    //при отжатии клавиши
    window.addEventListener('keyup', function (e) {
        if (e.keyCode === 16) {
            clear_mode = false;
        }
    });

    var test = new Scene({
        canvas: 'test',
        view: {
            width: 840,
            height: 480
        }
    });

    //Игрок
    var player = new Player(test, {
        radius: 16,
        offsetX: 32,
        offsetY: 32,
        width: 32,
        height: 32,
        name: 'kolobok',
        controls: {
            jump: 87,
            right: 68,
            left: 65
        }
    });

    var player2 = new Player(test, {
        radius: 16,
        offsetX: 32,
        offsetY: 32,
        width: 32,
        height: 32,
        name: 'kolobok2',
        controls: {
            jump: 38,
            right: 39,
            left: 37
        }
    });

    //Игра
    var game = new Game(test, player);


    document.getElementById('load_inp').onclick = function () {
        var lvl = get_matrix();
        game.level = null;
        game.level = default_level(lvl, function () {
            game.loadLevel(this);
            if (!game.started) {
                game.start();
                game.addPlayer(player2);
            }
        });
    };

    function draw_cell() {
        var pos = [Math.floor(curpos.x / cell_size), Math.floor(curpos.y / cell_size)];
        if (!matrix[pos[1]]) matrix[pos[1]] = [];
        if (clear_mode) {
            matrix[pos[1]][pos[0]] = null;
        } else {
            matrix[pos[1]][pos[0]] = indexes[current_block.name];
            if (max_y < pos[0]) max_y = pos[0];
        }
    }

    function grid() {
        var h_count = Math.round(width / cell_size);
        var v_count = Math.round(height / cell_size);

        for (var i = 0; i < h_count; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cell_size, 0);
            ctx.lineTo(i * cell_size, height);
            ctx.stroke();
        }

        for (var s = 0; s < v_count; s++) {
            ctx.beginPath();
            ctx.moveTo(0, s * cell_size);
            ctx.lineTo(width, s * cell_size);
            ctx.stroke();
        }
    }

    function cursor() {
        ctx.drawImage(clear_mode ? clear_sprite.img : sprites[current_block.name].img, curpos.x - (cell_size / 2), curpos.y - (cell_size / 2));
    }

    function draw_matrix() {
        for (var i = 0; i < matrix.length; i++) {
            var row = matrix[i];
            if (row) {
                for (var v = 0; v < row.length; v++) {
                    var wall = row[v];
                    if (wall) {
                        ctx.drawImage(sprites[sl[wall]].img, v * cell_size, i * cell_size)
                    }
                }
            }
        }
    }

    function draw() {
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        grid();
        if (can_draw) draw_cell();
        draw_matrix();
        cursor();
        ctx.restore();
        requestAnimationFrame(draw);
    }

    draw();

});