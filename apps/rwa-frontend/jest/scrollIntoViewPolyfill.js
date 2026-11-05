// jsdom has no layout, so it doesn't implement scrollIntoView, which Select calls on the active option
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = function scrollIntoView() {}
