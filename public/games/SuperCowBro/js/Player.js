/**
 * Created by Shoom on 07.05.15.
 */

/**
 * Класс игрока
 * @param scene {Scene} сцена на который существует игрок
 * @param params {Object} дополнительные параметры
 * */
var Player = function (scene, params) {
  this.id = 0
  //@abstract
  this.socket = null
  //можно ли отсылать серверу свои координаты
  this.canBroadcast = false
  //предыдущая позиция
  this.oldpos = { x: 0, y: 0 }
  //Смещение по X
  this.offsetX = params.offsetX || 0
  //Смещение по Y
  this.offsetY = params.offsetY || 0
  //Ширина
  this.width = params.width || 32
  //Высота
  this.height = params.height || 32
  //Скорость
  this.speed = 5.6
  //Трение
  this.friction = 0.9
  //Гравитация
  this.gravity = 0.4
  //Скорость по X
  this.velX = 0
  //Скорость по Y
  this.velY = 0
  //Клавиши управления
  this.keys = []
  //В прыжке
  this.jumping = false
  // Horizontal direction, 1 - right, -1 - left
  this.direction = 1
  //Приземлен
  this.grounded = false
  //Сцена
  this.scene = scene
  //2D контекст
  this.ctx = this.scene.ctx
  //Имя игрока
  this.name = params.name
  //Клавиши управления
  this.controls = params.controls
  //Можно ли рендерить игрока
  this.canRender = true
  //комната
  this.room = null
  this.recieveTime = Date.now()
  this.recieveDelta = 20

  /**
   * Отрисовка игрока на сцене
   * */
  this._render = function () {
    const sprite = this.direction === 1 ? this.level.sprites.kolobok : this.level.sprites.kolobokLeft

    this.ctx.drawImage(sprite, this.x, this.y)
    this.ctx.font = '13px Arial'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.lineWidth = 3
    this.ctx.strokeStyle = '#000000'
    var x = this.x + this.width / 2
    var y = this.y - 5
    this.ctx.strokeText(this.name, x, y)
    this.ctx.fillText(this.name, x, y)
  }

  /**
   * Включение управления клавишами
   * */
  this.keyControls = function () {
    var th = this
    this.scene.on('keydown', function (keyCode) {
      th.keys[keyCode] = true
    })

    this.scene.on('keyup', function (keyCode) {
      th.keys[keyCode] = false
    })
  }

  /**
   * Движение игрока
   * */
  this.move = function () {
    //Прыжок
    if (this.keys[this.controls.jump]) {
      if (!this.jumping && this.grounded) {
        this.jumping = true
        this.grounded = false
        this.velY = -this.speed * 2
      }
    }
    //Вправо
    if (this.keys[this.controls.right]) {
      if (this.velX < this.speed) {
        this.direction = 1
        this.velX++
      }
    }
    //Влево
    if (this.keys[this.controls.left]) {
      if (this.velX > -this.speed) {
        this.direction = -1
        this.velX--
      }
    }

    //Учитываем трение
    this.velX *= this.friction

    //Учитываем гравитацию
    this.velY += this.gravity

    this.grounded = false
    this.checkCollision()

    //Изменяем координаты
    this.x += this.velX
    this.y += this.velY

    //Если выходим за сцену по горизонтали
    if (this.x >= this.level.width - this.width) {
      this.x = this.level.width - this.width
    } else if (this.x <= 0) {
      this.x = 0
    }

    //Если выходим за сцену по вертикали
    if (this.y >= this.level.height - this.height) {
      this.y = this.level.height - this.height
      this.jumping = false
      this.grounded = true
    }

    this.x = modRound(this.x, 3)
    this.y = modRound(this.y, 3)

    var ydiff = this.oldpos.y - this.y
    if (this.oldpos.x !== this.x || ydiff > 0.5 || ydiff < -0.5) {
      this.oldpos.x = this.x
      this.oldpos.y = this.y
      this.sendPos()
    }
  }

  /**
   * Проверка столкновения с активными блоками
   * */
  this.checkCollision = function () {
    for (var i = 0; i < this.level.activeCells.length; i++) {
      if (this.level.cellIsVisible(this.level.activeCells[i])) this.level.activeCells[i].check(this)
    }
  }

  /**
   * Установка уровня
   * @param {Level} lvl уровень
   * */
  this.setLevel = function (lvl) {
    this.velX = 0
    this.velY = 0
    this.keys = []
    this.jumping = false
    this.grounded = false
    this.level = lvl
    this.x = this.level.playerPos[0]
    this.y = this.level.playerPos[1]
    this.canRender = true
  }

  /**
   * Победа на карте
   * */
  this.win = function () {
    this.socket.send('iWon')
  }

  /**
   * Поражение на карте
   * */
  this.lose = function () {
    this.level.onLose(this.name)
  }

  /**
   * Рендеринг игрока
   * */
  this.render = function () {
    if (this.canRender) {
      this.move()
      this._render()
    }
  }

  /**
   * Соединение с сервером
   * @param {String} url адресс ws сервера
   * @param {Room} room комната
   * @param {String} lvl уровень
   * @param {Function} cb callback
   * */
  this.connect = function (url, room, lvl, cb) {
    var th = this
    this.room = room
    this.socket = new WSClient(url, th)
    this.socket.on('connect', function () {
      th.socket.send('newPlayer', { name: th.name, level: lvl })
      th.socket.on('init', function (data) {
        th.id = data.id
        cb(data.level, data.shadows, data.matrixChanges, data.room_is_paused)
      })
    })
  }

  /**
   * Отправка координат на сервер
   * */
  this.sendPos = function () {
    var time = Date.now()
    if (this.canBroadcast && time - this.recieveTime >= this.recieveDelta) {
      this.recieveTime = time
      this.socket.send('coors', {
        x: this.x,
        y: this.y,
      })
    }
  }

  /**
   * Изменение матрицы уровня
   * @param {Cell} cell ячейка
   * @param {Number} value значение
   * */
  this.changeMatrix = function (cell, value) {
    this.socket.send('changeMatrix', {
      cell: cell.getData(),
      value,
    })
  }

  /**
   * Включаем управление, добавляем в рендеринг движение и отрисовку игрока
   * */
  this.keyControls()
}
