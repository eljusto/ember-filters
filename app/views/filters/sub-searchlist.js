export default Ember.View.extend({
	templateName: 'filters/views/sub-searchlist',
	dictionaryName: '',
	dictionaryClass: '',
	findValue: '',
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
			var relations = {};
			relations[this.get('dictionaryName')] =  {id: item.id, briefName: item.briefName};
			var flr = this.get('filter');
      this.send('hidePopup');
      if ((flr.get('subcriterias') != null || !flr.isLinkedFilterExist(null, relations)) &&  (item != null)){
				var oldRel = flr.get('relations');
				flr.set('relations',relations);
				var filterMode = flr.get('filterMode');
        if (!flr.get('textFields') && (filterMode === null || filterMode === 'off')) {
          this.get('controller').send('filterModeUpdated',flr);
        }
				if (filterMode != null && filterMode !== 'off'){
					flr.validate();
					if (!flr.get('isValid')){
						flr.set('relations',oldRel);
					}	else {
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
		var sortRec = rec.sortBy(['weight']);
		var topRecords = [];
		for(var i = 0;i < 5;i++) {
			topRecords.push(sortRec[i]);
		}
		this.set('topRecords',topRecords);
		this.set('filterDictionary', sortRec);
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
        if (that.get('popup') === true ) {
          that.send ('hidePopup');
        }
      }});
    this.set('subscriber', subscriber);
  },
  willDestroyElement: function() {
    Ember.Instrumentation.unsubscribe(this.get('subscriber'));
  }
});
