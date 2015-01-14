/*global App:false */
import ajax from 'ic-ajax';
import AutocompleteView from 'app/views/autocomplete';

var FieldAutocompleteView = AutocompleteView.extend({
	uiEvents: ['change', 'select'],
  dictionary: null,
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

  select: function(event, payload) {
    this.get('parentView').set('nameTag', payload.item.name);
    payload.item.value = payload.item.name;
  },

  didInsertElement: function() {
    this._super();
  }
});

export default FieldAutocompleteView;
