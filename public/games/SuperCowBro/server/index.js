/**
 * Created by Shoom on 14.05.15.
 */
Array.prototype.remove = function (i) {
  this.splice(this.indexOf(i), 1)
  return this
}

var App = require('./App.js')

var app = new App(8801)
app.createServer()

console.log('Server started!')
