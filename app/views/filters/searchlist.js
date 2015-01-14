  export default Ember.View.extend({
  templateName: 'filters/views/searchlist',
  dictionaryName: '',
  dictionaryClass: '',
  findValue: '',
  selectedItem: '',
  filterDictionary: Em.A(),
  filter: null,
  popup: false,
  result: null,
  topRecords: Em.A(),
  subscriber: undefined,

  actions: {

    showPopup: function() {
      var controller = this.get('controller');
      if (!controller.get('popupOpened')) {
        controller.set('popupOpened',true);
        this.set ('popup', true);
        var self = this;
        setTimeout (function () {
          self.$ ('.ember-text-field').focus ();
        }, 0);
      }
    },

    hidePopup: function() {
      this.set('popup', false);
      this.get('controller').set('popupOpened',false);
    },

    selectItem: function(item) {
      this.send('hidePopup');
      var selectedItem = item.id;
      var flr = this.get('filter');
      var arr = [{
        name: 'name',
        value: selectedItem
      }];
      if ((flr.get('subcriterias') != null || !flr.isLinkedFilterExist(arr,null)) && item != null) {
        var oldTextField = flr.get('textFields');
        flr.set('textFields', arr);
        flr.validate();
        if (!flr.get('isValid')) {
          flr.set('textFields', oldTextField);
        }	else {
          this.set('selectedItem',item.name);
          var filterMode = flr.get('filterMode');
          if (filterMode != null && filterMode !== 'off'){
            this.get('controller').send('filterApplied', flr);
          } else {
            this.get('controller').send('filterModeUpdated', flr);
          }
        }
      }
    },
  },

  findValueObserver:function() {
    var searchString = this.get('findValue');
    var res = [];
    if (searchString !== '') {
      var records = this.get('filterDictionary');
      records.forEach(function (item) {
        if (new RegExp(searchString.toLowerCase()).test(item.name.toLowerCase())) {
          res.push(item);
        }
      });
    }
    this.set('result',res);
  }.observes('findValue'),

  dictionaryNameObserver: function() {
    var dictionaryName = this.get('dictionaryName');
    var rec = this.get('controller.dictionaries.' + dictionaryName);
    var sortRec = rec.sortBy(['name']);
    var flr = this.get('filter');
    if (flr.get('textFields')[0]['value'] != null) {
      var id = flr.get('textFields')[0]['value'];
      var selectedObject = sortRec.findBy('id', id);
      if (selectedObject) {
        this.set('selectedItem', selectedObject.name);
      }
    }
    this.set('topRecords',sortRec);
    this.set('filterDictionary', sortRec);
    this.set('dictionaryClass', dictionaryName + '-toggle');
    this.rerender();
  }.observes('dictionaryName').on('init'),
  textFieldsObserver: function(){
    var textFields = this.get('filter.textFields');
    var emptyTextFields = (textFields[0].name !== null && textFields[0].name !== '') && (textFields[0].value === null || textFields[0].value === "");
    if (emptyTextFields){
      this.set('oldSelectedItem', undefined);
      this.set('selectedItem', undefined);
    }
    if (!emptyTextFields && !this.get('selectedItem')){
      var dictionaryName = this.get('dictionaryName');
      var rec = this.get('controller.dictionaries.' + dictionaryName);
      var flr = this.get('filter');
      var id = flr.get('textFields')[0]['value'];
      var selectedObject = rec.findBy('id', id);
      if (selectedObject) {
        this.set('selectedItem', selectedObject.name);
      }
    }
  }.observes('filter.textFields'),

  click: function(e){
    if (this.get('popup')) {
      e.stopPropagation();
    }
  },
  didInsertElement: function() {
    var that = this;
    var subscriber = Ember.Instrumentation.subscribe('windowClicked', {
      before: function (name, timestamp, payload) {},
      after: function (name, timestamp, payload) {
        if (that.get('popup')) {
          that.send ('hidePopup');
        }
      }});
    this.set('subscriber', subscriber);
  },
  willDestroyElement: function() {
    Ember.Instrumentation.unsubscribe(this.get('subscriber'));
  }
});
