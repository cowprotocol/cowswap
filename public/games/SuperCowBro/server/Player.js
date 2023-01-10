/**
 * Created by Shoom on 17.05.15.
 */

/**
 * Игрок
 * @param {String} name имя игрока
 * @param {Object} socket ws соединение
 * */
var Player = function (name, socket) {
  //id
  this.id = 0
  //имя
  this.name = name
  //соединение
  this.socket = socket
  //комната
  this.room = null
  //x
  this.x = 0.1
  //y
  this.y = 0.1

  //назначаем соединению модель игрока
  socket.player = this

  /**
   * Изменение координат игрока
   * @param {Object} coors координаты
   * */
  this.setCoors = function (coors) {
    this.x = coors.x
    this.y = coors.y
    this.room.newCoors(this)
    return this
  }

  /**
   * Инициализация игрока
   * */
  this.init = function () {
    this.socket.sendText(
      JSON.stringify({
        command: 'init',
        data: {
          id: this.id,
          level: this.room.levelName,
          shadows: this.room.getShadows(this),
          matrixChanges: this.room.matrixChanges(),
          room_is_paused: this.room.paused,
        },
      })
    )
    return this
  }
}

module.exports = Player
