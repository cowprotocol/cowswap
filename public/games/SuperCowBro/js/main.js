window.addEventListener('load', function () {
  var serverUrl = 'ws://dev.angelrf.com:8801';

  //сцена
  var scene = new Scene({
    canvas: 'scene',
    view: {
      width: 840,
      height: 480
    }
  });

  var started = false;
  //При клике на кнопку "присоединиться"
  $('#connect_to_room').click(function () {
    if (!started) {
      started = true;
      //Игрок
      var player = new Player(scene, {
        radius: 16,
        offsetX: 32,
        offsetY: 32,
        width: 32,
        height: 32,
        name: $('#my_name').val(),
        controls: {
          jump: 38, // 87
          right: 39, // 68
          left: 37 // 65
        }
      });

      //коннектимся к серверу
      player.connect(serverUrl, $('#room_name').val(), $('#map').val(), function (lvl, shadows, matrixChanges, room_is_paused) {
        window.game = new Game(scene, player);

        game.getLevel(lvl, function () {
          game.initConnection(lvl, player, shadows, matrixChanges, room_is_paused);
        });
      });
    }
  });
});
