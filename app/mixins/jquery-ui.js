/*global jQuery:false */
export default Em.Mixin.create({

// Based on Luke Melia E Using Ember.js with jQuery UI
// http://www.lukemelia.com/blog/archives/2012/03/10/using-ember-js-with-jquery-ui/

  didInsertElement: function() {
    var options = this._gatherOptions();
    this._gatherEvents(options);
    var ui = jQuery.ui[this.get('uiType')];
  if (typeof ui === 'function'){
  ui = ui(options, this.get('element'));
  } else {
    ui = (this.$())[this.get('uiType')];
    this.$().datepicker(options);
  }
  ui._renderItem = this.get('itemTemplate');
  this.set('ui', ui);
  },

  willDestroyElement: function() {
    var ui = this.get('ui');
    if (ui) {
      var observers = this._observers;
      for (var prop in observers) {
        if (observers.hasOwnProperty(prop)) {
          this.removeObserver(prop, observers[prop]);
        }
      }
      ui._destroy();
    }
  },

  _gatherOptions: function() {
    var uiOptions = this.get('uiOptions'), options = {};
    uiOptions.forEach(function(key) {
      options[key] = this.get(key);
      var observer = function() {
        var value = this.get(key);
        this.get('ui')._setOption(key, value);
      };
      this.addObserver(key, observer);
      this._observers = this._observers || {};
      this._observers[key] = observer;
    }, this);
    return options;
  },

  _gatherEvents: function(options) {
    var uiEvents = this.get('uiEvents') || [], self = this;
    uiEvents.forEach(function(event) {
      var callback = self[event];
      if (callback) {
        options[event] = function(event, ui) { callback.call(self, event, ui); };
      }
    });
  }
});
