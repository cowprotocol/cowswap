/**
 * Created by Shoom on 13.05.15.
 */

if (typeof require !== 'undefined') {
  var Cell = require('./Cell.js')
}

const errorSound = typeof Audio === 'undefined' ? null : new Audio('sound/error.mp3')
const successSound = typeof Audio === 'undefined' ? null : new Audio('sound/success.mp3')

/**
 * Уровень в игре
 * @param {Array} matrix матрица уровня
 * @param {Object} cellConstructors конструкторы ячеек
 * @param {Object} sprites хеш спрайтов уровня
 * @param {Object} params дополнительные параметры
 * @param {Function} onload callback загрузки уровня
 * */
var Level = function (matrix, cellConstructors, sprites, params, onload) {
  //сцена
  this.scene = null
  //сокращение для 2d контекста
  this.ctx = null
  //Оригинальная матрица
  this.originalMatrix = matrix
  //открыты ли ворота выхода с уровня
  this.gateIsOpen = false
  //смещение сцены по X
  this.activeCells = []
  //фоновые ячейки
  this.passiveCells = []
  //Кол-во бонусов на карте
  this.bonusCount = 0
  //Стартовые координаты игрока
  this.playerPos = [0, 0]
  //Размер ячейки в матрице
  this.cellSize = params.cellSize
  //Ширина карты
  this.width = this.originalMatrix[0].length * this.cellSize
  //Высота карты
  this.height = this.originalMatrix.length * this.cellSize
  //Конструкторы для создания ячеек
  this.cellConstructors = cellConstructors
  //Спрайты уровня
  this.sprites = {}
  //Функции для рендеринга
  this.forRender = []
  //Победивший/проигравший игрок
  this.finalPlayer = null

  /**
   * Рендеринг игрока
   * */
  this.render = function () {
    for (var i = 0; i < this.forRender.length; i++) {
      this.forRender[i].apply(this)
    }
    return this
  }

  /**
   * Добавить функцию к рендерингу
   * @param {Function} func функция рендеринга
   * */
  this.addForRender = function (func) {
    this.removeForRender(func)
    this.forRender.push(func)
    return this
  }

  /**
   * Удаление функции из рендеринга
   * @param {Function} func функция рендеринга
   * */
  this.removeForRender = function (func) {
    this.forRender.remove(func)
    return this
  }

  /**
   * Перебор матрицы
   * @param {Function} func функция итерации
   * */
  this.eachMatrix = function (func) {
    for (var i = 0; i < this.originalMatrix.length; i++) {
      var row = this.originalMatrix[i]
      for (var v = 0; v < row.length; v++) {
        var cell = row[v]
        func.apply(this, [cell, row, v, i])
      }
    }
  }

  /**
   * Рисование матрицы
   * */
  this.drawMatrix = function () {
    for (var s = 0; s < this.passiveCells.length; s++) {
      var x = this.passiveCells[s][0]
      var y = this.passiveCells[s][1]
      if (this.cellIsVisible({ x, y })) {
        this.ctx.drawImage(this.sprites.passiveCells, x, y)
      }
    }
    for (var i = 0; i < this.activeCells.length; i++) {
      this.activeCells[i].render()
    }
  }

  /**
   * Нужно ли рисовать ячейку на карте (если она в зоне видимости)
   * @param cell {Object|Cell} ячейка
   * @return {Boolean} находится ли ячейка в зоне видимости
   * */
  this.cellIsVisible = function (cell) {
    return (
      cell.x + this.cellSize > this.scene.offsetX &&
      cell.x < this.scene.offsetX + this.scene.width &&
      cell.y + this.cellSize > this.scene.offsetY &&
      cell.y < this.scene.offsetY + this.scene.height
    )
  }

  /**
   * Открытие ворот к выходу
   * */
  this.openGate = function () {
    this.gateIsOpen = true
  }

  /**
   * Заставка конца игры
   * */
  this.endScreen = function (text, fill) {
    this.ctx.fillStyle = fill
    this.ctx.fillRect(0, 0, this.scene.width + this.scene.offsetX, this.scene.height + this.scene.offsetY)
    this.ctx.font = '32px Arial'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(text, this.scene.offsetX + this.scene.width / 2, this.scene.offsetY + this.scene.height / 2)
  }

  /**
   * Инициализация матрицы и загрузка уровня
   * */
  this.load = function () {
    this.gateIsOpen = false
    this.activeCells = []
    this.passiveCells = []
    this.bonusCount = 0
    this.playerPos = [0, 0]

    for (var v in this.cellConstructors) {
      if (this.cellConstructors.hasOwnProperty(v)) {
        this.cellConstructors[v].sprite = this.sprites[this.cellConstructors[v].name]
      }
    }

    this.eachMatrix(function (cell, row, v, i) {
      if (this.cellConstructors[cell]) {
        if (this.cellConstructors[cell] === 'player') {
          this.playerPos[0] = this.cellSize * v
          this.playerPos[1] = this.cellSize * i
          this.passiveCells.push([this.cellSize * v, this.cellSize * i])
        } else {
          this.passiveCells.push([this.cellSize * v, this.cellSize * i])
          this.activeCells.push(new Cell(i, v, this.cellSize, this.cellSize, this, this.cellConstructors[cell]))
        }
      } else {
        this.passiveCells.push([this.cellSize * v, this.cellSize * i])
      }
    })

    return this
  }

  /**
   * При победе на уровне
   * @param {Player} player победивший игрок
   * */
  this.onWin = function (player) {
    this.finalPlayer = player
    this.addForRender(this.winPic)
    this.afterWin()
    successSound && successSound.play()
  }

  /**
   * При поражении на уровне
   * @param {Player} player проигравший игрок
   * */
  this.onLose = function (player) {
    this.finalPlayer = player
    this.addForRender(this.losePic)
    this.afterLose()
    errorSound && errorSound.play()
  }

  //Заставка победы
  this.winPic = function () {
    this.endScreen('[' + this.finalPlayer + ']' + ' says moo-o-o-o-o!', '#1051b2')
  }

  //Заставка поражения
  this.losePic = function () {
    this.endScreen('[' + this.finalPlayer + ']' + ' got a sandwich!', '#b51717')
  }

  /**
   * Изменение матрицы
   * @param {Player} player игрок инициатор изменения
   * @param {Number} row строка
   * @param {Number} col столбец
   * @param {Number} value значение
   * @param {Boolean} silent уведомлять ли сервер об изменении матрицы
   * */
  this.changeMatrix = function (player, row, col, value, silent) {
    for (var i = 0; i < this.activeCells.length; i++) {
      if (this.activeCells[i].row === row && this.activeCells[i].col === col) {
        this.activeCells[i].check(player, silent && value !== this.activeCells[i].val())
        if (value === 0) {
          this.activeCells.remove(this.activeCells[i])
          this.passiveCells.push([col * this.cellSize, row * this.cellSize])
        }
      }
    }
    this.originalMatrix[row][col] = value
  }

  if (onload) {
    //закрузка спрайтов
    this.spritesInLoad = 0

    var th = this
    for (var v in sprites) {
      if (sprites.hasOwnProperty(v)) {
        this.spritesInLoad++
        new Sprite(sprites[v], v, function () {
          th.spritesInLoad--
          th.sprites[this.name] = this.img
          //После загрузки всех спрайтов загружаем уровень и вызываем callback
          if (th.spritesInLoad === 0) {
            th.load()
            onload.apply(th)
          }
        })
      }
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = Level
}
