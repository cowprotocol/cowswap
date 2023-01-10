/**
 * Created by Shoom on 16.05.15.
 */

var ws = require('nodejs-websocket')
var Room = require('./Room.js')
var Player = require('./Player.js')

/**
 * Сервер-приложение
 * @param {Number} port порт на котором работает сервер
 * */
var App = function (port) {
  //комнаты
  this.rooms = {}
  //ws сервер
  this.server = null

  /**
   * Создание ws сервера
   * */
  this.createServer = function () {
    var th = this
    this.server = ws.createServer(function (socket) {
      //при получении данных от клиента, вызываем соответствующую команду
      socket.on('text', function (str) {
        var info = JSON.parse(str)
        var command = info.command

        if (th.commands[command]) {
          var room = info.room && th.rooms[info.room] ? th.rooms[info.room] : null
          var player = room && typeof info.player !== 'undefined' ? room.players[info.player] : null
          th.commands[command].apply(th, [socket, room, player, info])
        }
      })

      //при закрытии соединения удаляем игрока
      socket.on('close', function () {
        var room = socket.player.room
        var player = socket.player
        if (room) {
          console.log('Player `' + player.name + '` is disconnected from the room `' + room.name + '`')
          room.removePlayer(player)
          //Если игрок был овнером комнаты, то и комнату удаляем
          if (room.owner.id === player.id) {
            console.log('Room `' + room.name + '` destroyed!')
            room.destroy()
            delete th.rooms[room.name]
          }
        }
      })

      //если не вешать слушатель на это событие, приложение падает в ошибку
      socket.on('error', function () {})
    })

    this.server.listen(port)
    return this
  }

  /**
   * Команды которые может вызывать игрок
   * обработчик команды обычно принимает 4 параметра (socket, room, name, data)
   * */
  this.commands = {
    /**
     * Вход нового игрока в комнату
     * @param {Object} socket соединение
     * @param {Room} room комната
     * @param {Player} player игрок
     * @param {Object} params данные
     * */
    newPlayer(socket, room, player, params) {
      var new_player = new Player(params.data.name, socket)

      if (!room) {
        this.rooms[params.room] = new Room(params.room, new_player, params.data.level, ['level1', 'level2', 'level3'])
        console.log('Room `' + params.room + '` created! Owner - ' + new_player.name + '.')
      }

      console.log('Player `' + new_player.name + '` is connected to the room `' + this.rooms[params.room].name + '`')
      this.rooms[params.room].addPlayer(new_player)
      new_player.init()
      return this
    },
    /**
     * Вход нового игрока в комнату
     * @param {Object} socket соединение
     * @param {Room} room комната
     * @param {Player} player игрок
     * @param {Object} params данные
     * */
    coors(socket, room, player, params) {
      if (room) {
        player.setCoors(params.data)
      }
      return this
    },
    /**
     * Вход нового игрока в комнату
     * @param {Object} socket соединение
     * @param {Room} room комната
     * @param {Player} player игрок
     * @param {Object} params данные
     * */
    changeMatrix(socket, room, player, params) {
      if (room) {
        var data = params.data
        var cells = room.level.activeCells
        for (var i = 0; i < cells.length; i++) {
          if (cells[i].row === data.cell.row && cells[i].col === data.cell.col && cells[i].val() !== data.value) {
            cells[i].val(data.value)
            room.broadcast(
              'matrixChange',
              {
                row: data.cell.row,
                col: data.cell.col,
                value: data.value,
              },
              player
            )
          }
        }
      }
    },
    /**
     * Вход нового игрока в комнату
     * @param {Object} socket соединение
     * @param {Room} room комната
     * @param {Player} player игрок
     * */
    iWon(socket, room, player) {
      if (room && !room.paused) {
        room.broadcast('level_passed', { player: player.name })
        room.paused = true
        setTimeout(function () {
          room.nextLevel()
          room.broadcast('change_level', { level: room.levelName })
          room.paused = false
        }, 10000)
      }
    },
  }
}

module.exports = App
