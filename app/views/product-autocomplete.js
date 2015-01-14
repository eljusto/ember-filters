/*global App:false */
import ajax from 'ic-ajax';
import AutocompleteView from 'app/views/autocomplete';

var ProductAutocompleteView = AutocompleteView.extend({
	uiEvents: ['select','change'],
  attributeBindings: ['placeholder'],
  placeholder: 'Search',
  init: function () {
    var controller = this.get('controller');
    this._super();
    var source = function(req, res){
      var search = [{
        'text' : req.term,
        'searchBy' : controller.get('currentSearchType') || 'all'
      }];
      var url = App.basePath + 'api/autocomplete/';
        ajax({
          type: "POST",
          url: url,
          data: {'search': JSON.stringify(search)}
        }).then(function(result){
          if (result.status === "ok") {
            res(result.product);
          }
        });
      };
    this.set('source', source);
  },
  itemTemplate: function( ul, item ) {
        return $( "<li class=found-item>" )
        .append( "<a><img src='" + item.image + "' width='40' height='40'>" + item.title + "</a>" )
        .appendTo( ul );
    },
  select: function(event, payload) {
    this.get('targetObject').send('productSearchValueChanged', payload.item.sku);
    // this.get('parentView.controller').setTextList(payload.item.sku);
    payload.item.value = payload.item.sku;
  },
  keyUp: function(e){
    if (e.which === 13){
      this.get('targetObject').send('productSearchValueChanged', this.value);
      $('.found-item').parent().hide();
    }
  }
});

export default ProductAutocompleteView;
