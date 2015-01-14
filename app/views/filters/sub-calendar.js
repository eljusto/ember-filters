/*global moment:false */
var CalendarEditView = Ember.View.extend({
  templateName: 'filters/views/sub-calendar',
  filter: null,

  init: function () {
    this._super();
    var dateRange = this.get('filter').get('dateRange');
    var calendarType = this.get('filter').get('calendar');
    if (dateRange) {
      if (calendarType === 'range'){
        this.set('dateFrom', dateRange.gte);
        this.set('dateTo', dateRange.lte);
      }
      if (calendarType === 'single'){
        this.set('date', dateRange.gte);
      }
      if (calendarType === 'period'){
        this.set('datePeriod', dateRange.gte);
        this.set('datePeriodTo', dateRange.lte);
      }
    }
  },
  actions: {
    dateRangeReplace: function() {
      var flr = this.get('filter');
      var dateRange = {};
      var calendarType = flr.get('calendar');
      switch (calendarType){
        case "range":
          dateRange.gte = this.get('dateFrom');
          dateRange.lte = this.get('dateTo');
          if (dateRange.gte && dateRange.lte){
            flr.set('dateRange', dateRange);
          }
          break;
        case "single":
          dateRange.gte = this.get('date');
          dateRange.lte = undefined;
          if (dateRange.gte){
            flr.set('dateRange', dateRange);
          }
          break;
        case "period":
          dateRange.gte = this.get('datePeriod');
          var typePeriod = this.$(".period-active").text();
          switch (typePeriod){
            case 'M':
              dateRange.lte = moment.utc(dateRange.gte).endOf('month').format('YYYY-MM-DD');
              dateRange.mode = 'month';
              break;
            case 'Q':
              dateRange.lte = moment.utc(dateRange.gte).add('month',2).endOf('month').format('YYYY-MM-DD');
              dateRange.mode = 'quarter';
              break;
            case 'Y':
              dateRange.lte = moment.utc(dateRange.gte).add('month',11).endOf('month').format('YYYY-MM-DD');
              dateRange.mode = 'year';
              break;
          }
          if (dateRange.gte){
            flr.set('dateRange', dateRange);
          }
      }
      this._super();
      this.$('.calendar-block-edit').collapse('toggle');
      this.get('controller').send('filterApplied', flr);
    },
    periodSwitched: function(type) {
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
      }
    }
  },

  calendarRange: function(){
    var calendar = this.get('filter.calendar');
    if (calendar === 'range') {
      return true;
    }
    return false;
  }.property('filter.calendar'),

  calendarSingle: function(){
    var calendar = this.get('filter.calendar');
    if (calendar === 'single') {
      return true;
    }
    return false;
  }.property('filter.calendar'),

  calendarPeriod: function(){
    var calendar = this.get('filter.calendar');
    if (calendar === 'period') {
      return true;
    }
    return false;
  }.property('filter.calendar'),

  dateModeMonth: function(){
    var dateRange = this.get('filter.dateRange');
    if (dateRange){
      if (dateRange.mode !== 'month') {
        return false;
      }
    }
      return true;
  }.property('filter.dateRange'),

  dateModeQuarter: function(){
    var dateRange = this.get('filter.dateRange');
    if (dateRange){
      if (dateRange.mode === 'quarter') {
        return true;
      }
    }
    return false;
  }.property('filter.dateRange'),

  dateModeYear: function(){
    var dateRange = this.get('filter.dateRange');
    if (dateRange){
      if (dateRange.mode === 'year') {
        return true;
      }
    }
    return false;
  }.property('filter.dateRange'),

  getDateMode: function(){
    var dateRange = this.get('filter.dateRange');
    if (dateRange && dateRange.mode && dateRange.mode !== undefined && dateRange.mode !== ''){
      return dateRange.mode+'s';
    }
    return 'months';
  }.property('filter.textFields'),

  didInsertElement: function() {
    this._super();
    var self = this;
    this.$('.calendar-button').click(
      function() {
      self.$('.calendar-block-edit').collapse('toggle');
    });
  },
});
export default CalendarEditView;
