export default Ember.View.extend({
  templateName: 'filters/views/dictionary-select',
  oldSelectedItem:'',
  selectedItem:'',
  dictName: '',
  filtersDictionary: Em.A(),
  filter: null,
  initialization: false,
  hideAlert: true,

  selectedItemObserver: function() {
    if (!this.get('initialization')) {
      var selectedItem = this.get('selectedItem');
      var flr = this.get('filter');
      var arr = [{
        name: 'name',
        value: selectedItem
      }];
      if ((flr.get('subcriterias') != null || !flr.isLinkedFilterExist(arr,null)) && selectedItem != null && selectedItem !== '') {
        var oldTextField = flr.get('textFields');
        if (arr[0].value !== oldTextField[0].value) {
          flr.set('textFields', arr);
          flr.validate();
          if (!flr.get('isValid'))
          {
            this.set('selectedItem', this.get('oldSelectedItem'));
            flr.set('textFields', oldTextField);
          } else {
            this.set('oldSelectedItem',selectedItem);
            var filterMode = flr.get('filterMode');
            if (filterMode != null && filterMode !== 'off'){
              this.get('controller').send('filterApplied', flr);
            } else {
              this.get('controller').send('filterModeUpdated', flr);
            }
          }
        }
      } else {
        this.set('selectedItem', this.get('oldSelectedItem'));
      }
    } else {
      this.set('initialization',false);
    }
  }.observes('selectedItem'),

  isValidObserver: function() {
    if (!this.get('filter.isValid'))
    {
      this.set('hideAlert',false);
      Em.run.later(this, function() {
          this.set('hideAlert',true);
      }, 2000);
    }
  }.observes('filter.isValid'),

  dictNameObserver: function() {
    var flr = this.get('filter');
    var rec = this.get('controller.dictionaries.' + this.get('dictName'));
    this.set('filtersDictionary', rec);
    this.rerender();
    if (flr.get('textFields')[0]['value'] != null) {
      var id = flr.get('textFields')[0]['value'];
      this.set('initialization',true);
      this.set('selectedItem', id);
      this.set('oldSelectedItem',id);
    }
  }.observes('dictName').on('init'),
  textFieldsObserver: function(){
    var textFields = this.get('filter.textFields');
    var emptyTextFields = (textFields[0].name !== null && textFields[0].name !== '') && (textFields[0].value === null || textFields[0].value === "");
    if (emptyTextFields){
      this.set('oldSelectedItem', undefined);
      this.set('selectedItem', undefined);
    }
    if (!emptyTextFields && !this.get('selectedItem')){
      this.set('selectedItem',textFields[0].value);
    }
  }.observes('filter.textFields')
});
