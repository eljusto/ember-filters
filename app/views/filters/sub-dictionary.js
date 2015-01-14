export default Ember.View.extend({
  templateName: 'filters/views/sub-dictionary',
  selectedItem:'',
  filterName: '',
  dictionaryName: '',
  dictionaryClass: '',
  filterDictionary: Em.A(),
  filter: null,
  linkedFilter: false,
  popup: false,
  subscriber: undefined,

  actions: {
    showPopup: function() {
      var controller = this.get('controller');
      if (!controller.get('popupOpened')) {
        controller.set('popupOpened',true);
        this.set('popup', true);
      }
    },
    hidePopup: function() {
      this.get('controller').set('popupOpened',false);
      this.set('popup', false);
    },
    addAction: function() {
      var flr = this.get('filter');
      this.send('hidePopup');
      if (flr.isFilled() && !flr.hasEmptyLinkedFilters() && this.selectedItem !== '' && !flr.isLinkedFilterExist(null, this.selectedItem['relations']))
      {
        var linkFilter = flr.addLinkedFilter(null, {relations:this.selectedItem['relations']});
        linkFilter.set('linkedFilter',true);
      }
    },
    goAction: function() {
      var flr = this.get('filter');
      this.send('hidePopup');
      if ((flr.get('subcriterias') != null || !flr.isLinkedFilterExist(null, this.selectedItem['relations'])) &&  (this.get('selectedItem')['item_id'] !== ''))
      {
        var oldRel = flr.get('relations');
        flr.set('relations',this.selectedItem['relations']);
        var filterMode = flr.get('filterMode');
        if (filterMode != null && filterMode !== 'off')
        {
          flr.validate();
          if (!flr.get('isValid'))
          {
            flr.set('relations',oldRel);
          }
          else
          {
            this.get('controller').send('filterApplied', flr);
          }
        }
        var controller = this.get('controller');
        var currentSort = controller.get('currentSort');
        if (currentSort){
          var filterName = flr.get('name');
          switch(filterName){
            case 'salesByQty':
              filterName = 'sales';
              break;
            case 'returnPercent':
              filterName = 'returns';
              break;
            case 'invAvailable':
              filterName = 'available';
              break;
          }
          if (currentSort.type === filterName) {
            controller.set('currentSort', '');
          }
        }
      }
    },

    dictionaryItemSelected: function(item){
      this.get('filterDictionary').forEach(function (i) {
        Ember.set(i, "isSelected", false);
      });
      Ember.set(item, "isSelected", true);
      var ar = {
        item_id: item.id,
        item_name : item.name,
        relations: {},
      };
      ar['relations'][this.get('dictionaryName')] =  {id: item.id, briefName: item.briefName};
      this.selectedItem = ar;
    },
  },

  dictionaryNameObserver: function() {
    var flr = this.get('filter');
    if (flr.get('parentFilter') != null)
    {
      this.set('linkedFilter',true);
    }
    var dictionaryName = this.get('dictionaryName');
    var rec = this.get('controller.dictionaries.' + dictionaryName);
    rec.forEach(function (item) {
      Ember.set(item, "isSelected", false);
    });
    this.set('filterDictionary', rec);
    this.set('dictionaryClass', dictionaryName + '-toggle');
    this.rerender();
  }.observes('dictionaryName').on('init'),

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
