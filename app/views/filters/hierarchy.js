var FilterHierarchyView = Ember.View.extend({
  templateName: 'filters/views/hierarchy',
  dictionaryName: '',
  popup: false,
  filter: null,
  subscriber: undefined,
  actions: {
    showPopup: function() {
      var controller = this.get('controller');
      if (!controller.get('popupOpened')) {
        controller.set ('popupOpened', true);
        var _this = this;
        _this.set ('popup', true);
        setTimeout (function () {
          _this.openFirstDropdown();
        }, 50);
      }
    },
    hidePopup: function() {
      this.set('popup', false);
      this.get('controller').set('popupOpened',false);
      var arr = [];
      var hierarchyItem = this.$().find('.hierarchy-item li');
      hierarchyItem.each(function (item) {
        arr.push({
          name: $(this).attr('data-name'),
          value: $(this).attr('data-value'),
        });
      });
      if (arr.length) {
        var ftr = this.get('filter');
        ftr.set('textFields', arr);
      }
    },
    goAction: function() {
      this.send('hidePopup');
      var flr = this.get('filter');
      var filterMode = flr.get('filterMode');
      var selectedOption = this.$().find('.selected');
      var value = selectedOption.attr('data-value');
      if (value && value === '-1') { return; }
      if (filterMode != null && filterMode !== 'off') {
        this.get('controller').send('filterApplied', flr);
      } else {
        this.get('controller').send('filterModeUpdated', flr);
      }
    },
  },
  openFirstDropdown: function() {
    var firstDropdownToggle = this.$('.hierarchy-dropdown-toggle')[0];
    firstDropdownToggle.click();
  },
  textFieldsObserver: function(){
    var textFields = this.get('filter.textFields');
    var hierarchyItems = this.$().find('.hierarchy-item li');
    var valuesChanged = false;
    if (textFields.length !== hierarchyItems.length) {
      valuesChanged = true;
    } else {
      for (var i = 0, l= textFields.length; i < l; i ++) {
        var tf = textFields[i];
        var hi = hierarchyItems[i];
        var name = $(hi).attr('data-name');
        var value = $(hi).attr('data-value');
        valuesChanged = valuesChanged || (name !== tf.name) || (value !== tf.value);
        if (valuesChanged) { break; }
      }
    }
    if (valuesChanged) {
    this.rebuildHierarchy();
    }
  }.observes('filter.textFields'),

rebuildHierarchy: function() {
  var _this = this;
  var hierarchyItem = this.$().find('.hierarchy-item');
  hierarchyItem.empty();
  this.$().find('.hierarchy-select').empty();
  var dictionaryName = this.get('dictionaryName');
  var textFields = this.get('filter').get('textFields');
  var values = [];
  for (var i = 0, l = textFields.length; i < l; i ++) {
    var v = textFields[i];
    if (v.value && v.value !== '') {
      values.push(v.value);
    } else {
      break;
    }
  }
  if (!values.length) {
    values = [0];
  }
  var h = this.get('controller.dictionaries.' + dictionaryName);
  this.$().find('.hierarchy-select').hierarchySelect({
    'hierarchy': h,
    'values': values,
    'onChange': function(selectValues){
      hierarchyItem.empty();
      selectValues.forEach(function(item){
        var val = item.value + ':' + item.valueName;
        hierarchyItem.append(
          $('<li>').addClass('hierarchy-list-li').attr('title', val).attr('data-name',item.categoryId).attr('data-value',item.value).text(val)
        );
        _this.set('value', item.value + ':' + item.valueName);
      });
    }
  });
  var hierarchySelect = this.$().find('.hierarchy-select .dropdown-menu');
  hierarchySelect.each(function (item) {
    var selected_option = $(this).find('.selected');
    var value = selected_option.attr('data-value');
    if (value && value !== '-1')
      {
        var categoryId = $(this).attr('name');
        var text = selected_option.attr('data-id') + ':' + selected_option.text();
        hierarchyItem.append(
          $('<li>').addClass('hierarchy-list-li').attr('data-name',categoryId).attr('data-value',value).text(text)
        );
      }
  });
},
didInsertElement: function() {
  var that = this;
  this._super();
  this.rebuildHierarchy();
  var subscriber = Ember.Instrumentation.subscribe('windowClicked', {
    before: function (name, timestamp, payload) {},
    after: function (name, timestamp, payload) {
      //don't close popup if click was inside of this view
      if ( $(payload).parents("#" + that.$().attr('id')).length > 0) { return; }

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

export default FilterHierarchyView;
