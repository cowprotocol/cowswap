/**
 * Created by Shoom on 14.05.15.
 */

/**
 * Спрайт
 * @param {String} src адрес картинки
 * @param {String} name название спрайта
 * @param {Function} onload callback загрузки картинки
 * */
var Sprite = function (src, name, onload) {
    this.img = new Image();
    this.img.src = src;
    this.name = name;
    var th = this;
    this.img.addEventListener('load', function () {
        if (onload) onload.apply(th);
    });
};