/*global App:false */
import ajax from 'ic-ajax';
import AutocompleteView from 'app/views/autocomplete';

var DictAutocompleteView = AutocompleteView.extend({
	uiEvents: ['change', 'select'],
  dictionary: null,
  filter: null,
  textField: null,

  init: function () {
    this._super();
    var _this = this;

    var source = function(req, res){
      var url = App.basePath + 'api/autocomplete/';
      var dictionary = _this.get('dictionary');
      if (dictionary) {
        url = url + dictionary + '/';
        ajax(url + encodeURIComponent(req.term)).then(function(result){
          res(result[dictionary]);
        });
      }
    };
    this.set('source', source);

    var itemTemplate = function(ul, item){
      return $( "<li>" )
      .append( "<a>" + item.name + "</a>" )
      .appendTo( ul );
    };
    this.set('itemTemplate', itemTemplate);
  },

  change: function(event, payload) {
    var filter = this.get('filter');
    this.get('targetObject').send('goAction', filter);
  },

  select: function(event, payload) {
    var arr = [{ "name": "name", "value": payload.item.name }];
    var flr = this.get('filter');
    if (!flr.isLinkedFilterExist(arr)) {
      flr.set('textFields', arr);
      payload.item.value = payload.item.name;
      this.change();
    }
  },

  textFieldsObserver: function() {
    if (!this.get('filter.textFields.0.value')) {
      this.set('value', '');
    }
  }.observes('filter.textFields'),

  didInsertElement: function() {
    this._super();
    var filter = this.get('filter');
    if (filter) {
      this.set('value', filter.get('textFields.0.value'));
    }
  }
});

export default DictAutocompleteView;
