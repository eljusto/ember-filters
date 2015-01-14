/*global moment:false */
export default Ember.View.extend({
  templateName: 'filters/views/bytime',
  filter: null,
  init:function () {
    this._super();
    var textFields = this.get('filter').get('textFields');
    this.set('dateFrom',textFields[0]['value']);
    this.set('dateTo',textFields[1]['value']);
  },
  actions: {
    periodSwitch: function(type) {
      var datePickerArray = this.$(".ember-view");
      for (var i=0;i<datePickerArray.length;i++){
        var pickmeup = datePickerArray[i].pickmeup;
        var className = pickmeup[0].className;
        this.$(".period-switch a").removeClass('period-active');
        switch(type) {
          case 'month':
            this.$(".month-period").addClass('period-active');
            pickmeup.removeClass(className).addClass("pickmeup pmu-view-months");
          break;
          case 'quarter':
            this.$(".quarter-period").addClass('period-active');
            pickmeup.removeClass(className).addClass("pickmeup pmu-view-quarters");
          break;
          case 'year':
            this.$(".year-period").addClass('period-active');
            pickmeup.removeClass(className).addClass("pickmeup pmu-view-years");
          break;
        }
        this.dateChanged();
        this.$('.date-picker-period').click();
      }
    },
    cleanByTime: function(){
      var filter = this.get('filter');
      filter.resetFilter();
      var controller = this.get('controller');
      var appliedFilters = controller.get('displayedCriterias.filters');
      appliedFilters.removeObject(filter);
      if (appliedFilters.length === 0) {
        controller.set('flagAppliedFilterRemoved',true);
      }
      controller.reloadData();
    }
  },

  getDateMode: function(){
    var textFields = this.get('filter.textFields');
    if (textFields){
      var obj = textFields.findBy('name','mode');
      if (obj) {
        if (!obj.hasOwnProperty('value') || obj.value === undefined || obj.value === '' ) {
          obj.value = 'month';
        }
        return obj.value+'s';
      }
    }
    return 'months';
  }.property('textFields'),

  dateModeMonth: function(){
    var textFields = this.get('filter.textFields');
    if (textFields){
      if (textFields.findBy('value','quarter') || textFields.findBy('value','year')) {
        return false;
      }
    }
      return true;
  }.property('filter.textFields'),

  dateModeQuarter: function(){
    var textFields = this.get('filter.textFields');
    if (textFields){
      if (textFields.findBy('value','quarter')) {
        return true;
      }
    }
      return false;
  }.property('filter.textFields'),

  dateModeYear: function(){
    var textFields = this.get('filter.textFields');
    if (textFields){
      if (textFields.findBy('value','year')) {
        return true;
      }
    }
      return false;
  }.property('filter.textFields'),

  textFieldsObserver: function(){
    var textFields = this.get('filter.textFields');
    if (textFields[0].value !== null && textFields[0].value !== "") {
      var datePicker = this.$('.date-picker-period');
      var typePeriod = this.$(".period-active").text();
      var gte = datePicker[0].value;
      var mode;
      switch (typePeriod){
        case 'M':
          mode = 'month';
        break;
        case 'Q':
          mode = 'quarter';
        break;
        case 'Y':
          mode = 'year';
        break;
      }
      var gteEquals = (textFields[0].value && textFields[0].value === gte) || (!textFields[0].value.length && gte === '');
      if (gteEquals && textFields[2].value && textFields[2].value === mode) {
      } else {
        datePicker[0].value = textFields[0].value ? textFields[0].value : '';
        var type = textFields[2].value ? textFields[2].value : 'month';
        this.send('periodSwitch', type);
      }
    }
    else
    {
      this.set('dateFrom',"");
      this.$(".period-value").text('');
    }
  }.observes('filter.textFields'),

  dateChanged: function(){
      var datePicker = this.$('.date-picker-period');
      var typePeriod = this.$(".period-active").text();
      var gte = datePicker[0].value;
      if (!gte) { return; }
      var lte, mode, res;
      switch (typePeriod){
        case 'M':
        lte = moment.utc(gte).endOf('month').format('YYYY-MM-DD');
        mode = 'month';
        res = moment.utc(gte).format('MMM YYYY');
        break;
      case 'Q':
        gte = moment.utc(gte).startOf('quarter').format('YYYY-MM-DD');
        lte = moment.utc(gte).add('month', 2).endOf('month').format('YYYY-MM-DD');
        mode = 'quarter';
        res = 'Q'+moment.utc(gte).format('Q YYYY');
        break;
      case 'Y':
        gte = moment.utc(gte).startOf('year').format('YYYY-MM-DD');
        lte = moment.utc(gte).add('month', 11).endOf('month').format('YYYY-MM-DD');
        mode = 'year';
        res = moment.utc(gte).format('YYYY');
        break;
      }
      var arr = [
        { name: 'gte',  value: gte  },
        { name: 'lte',  value: lte  },
        { name: 'mode', value: mode }
      ];
      this.$('.period-value').text(res);
      this.get('filter').set('textFields',arr);
      this.set('filter.filterMode', 'include');
      this.get('controller').send('filterApplied', this.get('filter'));
  },

  didInsertElement: function() {
    this._super();
    var self = this;
    var inputs = $(".filter-bytime .date-picker-period");
    inputs.on('change', function() {
      Em.run( function() {
        self.dateChanged();
      });
    });

  }
});
