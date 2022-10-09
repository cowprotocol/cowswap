/**
 * Created by Shoom on 14.05.15.
 */

/**
 * Клиент websocket сервера
 * @param {String} url адрес сервера
 * @param {Player} player игрок
 * */
var WSClient = function (url, player) {
    var th = this;

    //игрок
    this.player = player;
    //события
    this.events = {};
    //ws сокет
    this.socket = new WebSocket(url);

    //при открытии соединения
    this.socket.onopen = function () {
        th.trigger('connect');
    };

    //при закрытии соединения
    this.socket.onclose = function (event) {
        th.trigger('close', event);
    };

    /**
     * При получении данных
     * по стандарту обмен между сервером и клиентом проходит в виде json объекта
     * от сервера к клиенту:
     * {command: 'command_name', data: {d: 1, a: 2...}}
     * */
    this.socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        //при получении данных
        if (data.command) {
            th.trigger(data.command, data.data);
        } else {
            th.trigger('message', event.data);
        }
    };

    /**
     * При ошибке соединения
     * */
    this.socket.onerror = function (error) {
        th.trigger('error', error);
    };

    /**
     * Отправка данных на сервер
     * от клиента к серверу:
     * {command: 'command_name', room: 'room_name', player: 'player_id', data: {d: 1, a: 2...}}
     * */
    this.send = function (command, data) {
        this.socket.send((typeof data === 'string') ? data : JSON.stringify({
            command: command,
            room: this.player.room,
            player: this.player.id,
            data: data || null
        }));
    };

    /**
     * Биндинг события
     * @param {String} command название события
     * @param {Function} callback callback
     * */
    this.on = function (command, callback) {
        if (!this.events[command]) this.events[command] = [];
        this.events[command].push(callback);
        return this;
    };

    /**
     * Сниятие биндинга события
     * @param {String} command название события
     * @param {Function} callback callback
     * */
    this.off = function (command, callback) {
        if (this.events[command]) {
            this.events[command].remove(callback);
        }
        return this;
    };

    /**
     * Вызов обработчиков события
     * @param {String} command название события
     * @param {Object} data параметры события
     * */
    this.trigger = function (command, data) {
        if (this.events[command]) {
            for (var i = 0; i < this.events[command].length; i++) {
                this.events[command][i](data);
            }
        }
    };
};