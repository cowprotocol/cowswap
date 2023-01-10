/**
 * Created by Shoom on 17.05.15.
 */

/**
 * Комната
 * @param {String} name название комнаты
 * @param {Player} owner владелец комнаты
 * @param {String} start_level стартовый уровень
 * @param {Array} levels массив названий уровней
 * */
var Room = function (name, owner, start_level, levels) {
  //название комнаты
  this.name = name
  //владелец комнаты
  this.owner = owner
  //игроки в комнате
  this.players = []
  //название уровня
  this.levelName = ''
  //уровень
  this.level = null
  //массив названий уровней
  this.levels = levels
  //комната на паузе
  this.paused = false
  //изменения матрицы
  this.matrixChanges = function () {
    return this.level.originalMatrix
  }

  /**
   * Добавление игрока в комнату
   * @param {Player} player игрок
   * */
  this.addPlayer = function (player) {
    this.players.push(player)
    player.room = this
    player.id = this.players.length - 1
    player.x = this.level.playerPos[0]
    player.y = this.level.playerPos[1]
    this.broadcast('newPlayer', { player: [player.id, player.name, player.x, player.y] }, player)
    return this
  }

  /**
   * Удаление игрока из комнаты
   * @param {Player} player игрок
   * */
  this.removePlayer = function (player) {
    this.players.remove(player)
    this.broadcast('leavePlayer', { player: player.id })
    player = null
    return this
  }

  /**
   * Перебор игроков
   * @param {Function} func обработчик итерации
   * */
  this.eachPlayers = function (func) {
    for (var i = 0; i < this.players.length; i++) {
      func.apply(this, [this.players[i]])
    }
    return this
  }

  /**
   * Оповещение игроков
   * @param {String} command имя команды
   * @param {Object} data данные
   * @param {Player} plr игрок от которого исходит оповещение (его самого не обовещает)
   * */
  this.broadcast = function (command, data, plr) {
    this.eachPlayers(function (player) {
      if (!plr || plr.id !== player.id) {
        player.socket.sendText(
          JSON.stringify({
            command,
            data,
          })
        )
      }
    })
    return this
  }

  /**
   * Изменение координат игрока
   * @param {Player} player игрок у которого изменились координаты
   * */
  this.newCoors = function (player) {
    this.broadcast(
      'coors',
      {
        shadow: player.id,
        x: player.x,
        y: player.y,
      },
      player
    )
    return this
  }

  /**
   * Получение списка игроков
   * @param {Player} plr игрок который получает список
   * */
  this.getShadows = function (plr) {
    var res = []
    this.eachPlayers(function (player) {
      if (player.id !== plr.id) {
        res.push([player.id, player.name, player.x, player.y])
      }
    })
    return res
  }

  /**
   * Смена уровня на следующий
   * */
  this.nextLevel = function () {
    var next_level = this.levelName
    if (this.levels) {
      next_level = this.levels[this.levels.indexOf(this.levelName) + 1] || this.levels[0]
    }
    this.loadLevel(next_level)
    return this
  }

  /**
   * Загрузка уровня
   * @param {String} level_name название уровня
   * */
  this.loadLevel = function (level_name) {
    console.log('Level of room `' + this.name + '` changed to `' + level_name + '`')
    this.levelName = level_name
    this.level = require('../levels/' + level_name + '.js')
      .init()
      .load()
    return this
  }

  /**
   * Удаление комнаты
   * */
  this.destroy = function () {
    this.broadcast('roomOff')
  }

  //Загрузка уровня
  this.loadLevel(start_level)
}

module.exports = Room
