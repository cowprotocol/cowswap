/**
 * Created by Shoom on 14.05.15.
 */

/**
 * Игра
 * @param {Scene} scene сцена игры
 * @param {Player} player ведущий игрок игры
 * @param {Array} levels уровни игры
 * */
var Game = function (scene, player, levels) {
  //номер текущего уровеня
  this.currentLevel = 0
  //текущий уровень
  this.level = null
  //уровни игры
  this.levels = levels
  //сцена
  this.scene = scene
  //ведущий игрок
  this.player = player
  //игроки
  this.players = [player]
  //запущена ли игра
  this.started = false
  //тени (другие игроки по мультиплееру)
  this.shadows = {}
  //можно ли рендерить
  this.canDraw = true
  //время последнего рендеринга (для вывода fps)
  this.time = Date.now()

  //игра
  var th = this

  /**
   * Загрузка уровня
   * @param {Level} level уровень
   * */
  this.loadLevel = function (level) {
    level.afterWin = function () {
      th.eachPlayers(function (player) {
        player.canRender = false
      })

      setTimeout(function () {}, 2000)
    }

    level.afterLose = function () {
      th.player.x = th.level.playerPos[0]
      th.player.y = th.level.playerPos[1]

      th.eachPlayers(function (player) {
        player.canRender = false
      })

      setTimeout(function () {
        th.player.canRender = true
        th.level.removeForRender(th.level.losePic)
      }, 800)
    }

    this.scene.setLevel(level)

    this.eachPlayers(function (player) {
      player.setLevel(level)
    })

    this.level = level

    this.canDraw = true
  }

  /**
   * Запуск игры
   * */
  this.start = function () {
    this.started = true
    var fps = document.getElementById('fps')

    function draw() {
      if (th.canDraw) {
        th.scene.ctx.save()
        th.scene.mapCenter(th.player)
        th.scene.clear()
        th.scene.level.drawMatrix()
        th.scene.level.render()

        th.eachPlayers(function (player) {
          player.render()
        })

        for (var v in th.shadows) {
          if (th.shadows.hasOwnProperty(v) && th.shadows[v]) th.shadows[v].render()
        }

        th.scene.ctx.restore()
      }
      requestAnimationFrame(draw)
      var time = Date.now()
      fps.value = time - th.time
      th.time = time
    }

    draw()
  }

  /**
   * Загрузка файла уровня
   * @param {String} name название уровня
   * @param {Function} cb callback загрузки уровня
   * */
  this.getLevel = function (name, cb) {
    include(
      'levels/' + name + '.js?' + Date.now(),
      'js',
      function () {
        window[name].init(cb)
      },
      function () {}
    )
  }

  /**
   * Добавление игрока на уровень
   * @param {Player} player игрок
   * */
  this.addPlayer = function (player) {
    this.players.push(player)
    player.setLevel(this.level)
  }

  /**
   * Добавление тени на уровень
   * @param {Array} shadow тень
   * */
  this.addShadow = function (shadow) {
    if (!this.shadows[shadow[0]]) {
      this.shadows[shadow[0]] = new Shadow(this.scene, this.level, {
        id: shadow[0],
        name: shadow[1],
        x: shadow[2],
        y: shadow[3],
      })
    }
  }

  /**
   * Удаление тени
   * @param {Number} id имя тени
   * */
  this.removeShadow = function (id) {
    delete this.shadows[id]
    this.shadows[id] = null
  }

  /**
   * Перебор массива игроков
   * @param {Function} func callback
   * */
  this.eachPlayers = function (func) {
    for (var i = 0; i < this.players.length; i++) {
      func.apply(this, [this.players[i]])
    }
  }

  /**
   * Пауза игры
   * */
  this.pause = function () {
    this.canDraw = false
    var ctx = this.scene.ctx
    this.scene.clear()
    ctx.fillStyle = '#545c71'
    ctx.fillRect(0, 0, this.scene.width + this.scene.offsetX, this.scene.height + this.scene.offsetY)
    ctx.font = '32px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('Pause', this.scene.offsetX + this.scene.width / 2, this.scene.offsetY + this.scene.height / 2)
    return this
  }

  /**
   * Инициализация соединения
   * @param {String} lvl уровень
   * @param {Player} player игрок
   * @param {Array} shadows тени
   * @param {Array} matrixChanges изменеия матрицы
   * */
  this.initConnection = function (lvl, player, shadows, matrixChanges, room_is_paused) {
    this.level = window[lvl].init(function () {
      th.loadLevel(this)
      for (var i = 0; i < matrixChanges.length; i++) {
        if (matrixChanges[i]) {
          for (var v = 0; v < matrixChanges[i].length; v++) {
            if (typeof matrixChanges[i][v] === 'number') {
              this.changeMatrix(player, i, v, matrixChanges[i][v], true)
            }
          }
        }
      }
      th.start()
      if (room_is_paused) {
        th.pause()
      } else {
        player.canBroadcast = true
      }
    })

    for (var i = 0; i < shadows.length; i++) {
      this.addShadow(shadows[i])
    }

    player.socket
      .on('newPlayer', function (data) {
        th.addShadow(data.player)
      })
      .on('leavePlayer', function (data) {
        th.removeShadow(data.player)
      })
      .on('coors', function (data) {
        if (th.shadows[data.shadow]) {
          th.shadows[data.shadow].addCoors(data.x, data.y)
        }
      })
      .on('matrixChange', function (data) {
        th.level.changeMatrix(player, data.row, data.col, data.value, true)
      })
      .on('roomOff', function () {
        th.canDraw = false
        th.scene.clear()
      })
      .on('level_passed', function (data) {
        th.level.onWin(data.player)
      })
      .on('change_level', function (data) {
        th.getLevel(data.level, function () {
          th.level.removeForRender(th.level.winPic)
          th.level = null
          th.loadLevel(this)
        })
      })

    return this
  }
}
