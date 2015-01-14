/* global _:false */
import ValidateMixin from 'app/mixins/validatemixin';

var FilterItem = DS.Model.extend(ValidateMixin,{

  //
  // Filter data structure
  //
  name: DS.attr(),
  title: DS.attr(),
  filterMode: DS.attr(), //off, include, exclude
  measureUnit: DS.attr(),
  textFields: DS.attr(),
  subcriterias: DS.attr(),
  dictionary: DS.attr(),
  inputTemplate: DS.attr(),
  relations: DS.attr(),
  dateRange: DS.attr(),
  calendar: DS.attr('string'),
  isPlural: DS.attr('boolean'),
  isGlobal: DS.attr('boolean'),
  isHidden: DS.attr('boolean'),
  sortOrder: DS.attr(), //off, asc, desc
  sorting: DS.attr(),
  validation: DS.attr(),

  filterSection: DS.belongsTo('Filter'),

  //
  // Linked filters implemention
  //
  parentFilter: DS.belongsTo('FilterItem', { inverse: 'linkedFilterItems' }),
  linkedFilterItems: DS.hasMany('FilterItem', { inverse: 'parentFilter' }),

  addLinkedFilter: function(textFields, keys) {
    if (!keys) {
      keys = {};
    }
    var parentFilter = this;
    if (this.get('parentFilter')) {
      parentFilter = this.get('parentFilter');
    }
    var lf = {
      name: this.get('name'),
      title: this.get('title'),
      dictionary: this.get('dictionary'),
      isSearchable: this.get('isSearchable'),
      measureUnit: this.get('measureUnit'),
      parentFilter: parentFilter,
      filterMode: 'off',
      calendar: this.get('calendar'),
      subcriterias: this.get('subcriterias'),
      relations: keys.relations,
      dateRange: keys.dateRange,
      inputTemplate: this.get('inputTemplate')
    };
    var sorting = this.get('sorting');
    if (sorting){
      lf.sorting = sorting;
      lf.sortOrder = keys.sortOrder;
    }
    if (textFields) {
      lf.textFields = textFields;
    } else {
      lf.textFields = Em.copy(this.get('textFields'), true);
      if (lf.textFields) {
        lf.textFields.forEach(function (item) {
          delete item.value;
        });
      }
    }

    lf.id = Em.guidFor(lf);
    var linkedFilter = this.store.createRecord('filter-item', lf);
    return linkedFilter;
  },

  hasEmptyLinkedFilters: function() {
    var parentFilter = this;
    if (this.get('parentFilter')) {
      parentFilter = this.get('parentFilter');
    }
    var hasEmptyLinkedFilters = false;
    parentFilter.get('linkedFilterItems.content').forEach(function (linkedFilter) {
      if (!linkedFilter.isFilled()) {
        hasEmptyLinkedFilters = true;
      }
    });
    return hasEmptyLinkedFilters;
  },

  isLinkedFilterExist: function(textFields, relations) {
    var parentFilter = this;
    if (this.get('parentFilter')) {
      parentFilter = this.get('parentFilter');
    }
    var filters = [parentFilter].concat(parentFilter.get('linkedFilterItems.content'));
    var isMatch = _.any(filters, function(filter) {
      var filterRelations  = Em.copy(filter.get('relations')); // we need to use Em.copy() to clean objects from internal Ember properties
      var filterTextFields = filter.get('textFields');
      return (_.isEqual(filterRelations, relations) && _.isEqual(filterTextFields, textFields));
    });
    return isMatch;
  },

  deleteLinkedFilter: function(record){
    this.store.deleteRecord(record);
  },

  //
  // Display representations
  //
  relationTitles: function(){
    var relations = this.get('relations');
    if (!relations) { return []; }
    var relationTitles = Em.A();
    for (var prop in relations) {
      if (relations.hasOwnProperty(prop)) {
        var relationName = relations[prop].hasOwnProperty('briefName') ? relations[prop].briefName : relations[prop].id;
        relationTitles.pushObject(relationName);
      }
    }
    return relationTitles;
  }.property('relations'),

  getDisplayObject: function(dictionary) {
    var df = {
      id: this.id,
      title: this.getFullTitle(dictionary) + ' ' + this.get('relationTitles').join(' '),
      name: this.get('name'),
      textFields: this.get('textFields'),
      mode: this.get('filterMode')
    };
    if (this.get('sorting')){
      df.sorting = this.get('sorting');
      df.sortOrder = this.get('sortOrder');
    }
    if (this.get('parentFilter')) {
      df.id = this.get('parentFilter').id;
      df.linkedFilterId = this.id;
    }
    return df;
  },

  getFullTitle: function(dictionary) {
    var title = this.get('title');
    var textFields = this.get('textFields');
    if (!textFields) { return title; }

    if (this.get('inputTemplate') === 'hierarchy') {
      title += ' ';
      for (var i = 0; i < textFields.length; i++)
      {
        title += textFields[i].value + ',';
      }
      title = title.substr(0,title.length-1);
      return title;
    }

    if (this.get('inputTemplate') === 'bytime') {
      //e.g. By time month: [2014-01-01; 2014-01-31]"
      return title + ' ' + textFields[2].value + ': [' + textFields[0].value + '; ' + textFields[1].value + ']';
    }

    switch (textFields.length) {
      case 0:
        return title;
      case 1:
        var value = textFields[0].value;
        if (!value) {
          value = '';
        } else if (dictionary) {
          var dictionaryItem = dictionary.findBy('id', textFields[0].value);
          if (dictionaryItem) {
            value = (dictionaryItem.hasOwnProperty('name')) ? dictionaryItem.name : dictionaryItem.id;
          }
        }
        return title + " '" + value + "'";
      case 2:
        var ge = textFields[0].value;
        var le = textFields[1].value;
        if (ge && le) {
          title = ge + ' < ' + title + ' < ' + le;
        } else if (ge) {
          title = title + ' > ' + ge;
        } else if (le) {
          title = title + ' < ' + le;
        }
        return title;
      default:
        return title;
    }
  },

  //
  // Validation
  //
  isEnabled: function(){
    var filterMode = this.get('filterMode');
    var isSwitchedOn = (filterMode && filterMode !== 'off');
    var isFilled = this.isFilled();
    return isSwitchedOn && isFilled;
  },

  isFilled:function () {
    var textFields = this.get('textFields');
    if (!textFields) {
      return true;
    }
    return _.any(textFields, function (textField) {
      return textField.value;
    });
  },

  isChecked: function(){
    var filterMode = this.get('filterMode');
    if (filterMode && filterMode !== 'off') {
      return true;
    }
    return false;
  }.property('filterMode'),

  sanitizeTextFields: function () {
    var textFields = this.get('textFields');
    if (textFields && textFields.length > 0) {
      textFields.forEach(function (textField) {
        if (textField.value) {
          Em.set(textField, 'value', textField.value.trim());
        }
      });
    }
  },

  validate: function () {
    var result = true;
    var txtField = this.get('textFields');
    if (this.get('validation') && txtField && txtField.length > 0) {
      var type = this.get('validation.type');
      if (type === 'number') {
        var minValue = this.get('validation.minValue');
        var maxValue = this.get('validation.maxValue');
        txtField.forEach(function (textField) {
          if (textField.value) {
            var valNumber = parseFloat(textField.value);
            var isNumber = !isNaN(valNumber) && isFinite(textField.value);
            if ( !isNumber ) {
              result = false;
            } else {
              if (minValue && valNumber < minValue) {
                result = false;
              }
              if (maxValue && valNumber > maxValue) {
                result = false;
              }
            }
          }
        });
        if (result && txtField.findBy('name','gte') && txtField.findBy('name','lte')) {
          if (txtField[0].value && txtField[1].value && parseFloat(txtField[0].value) > parseFloat(txtField[1].value)) {
            result = false;
          }
        }
      }
    }
    if (this.get('name') === "invStatus")
    {
      this.set('isValid',true); //Force observer
      var relations = this.get('relations');
      var rel = {};
      for (var key in relations)
      {
        rel[key] =  {id: relations[key].id, briefName: relations[key].briefName};
      }
      var textFields = [{
        name: txtField[0].name,
        value: txtField[0].value,
      }];
      this.set('textFields',[{name:'',value:''}]);
      this.set('relations',{});
      result = !this.isLinkedFilterExist(textFields,rel);
      this.set('relations',relations);
      this.set('textFields',txtField);
    }
    this.set('isValid',result);
  },


  //
  // Identification of filter template
  //
  getInputTemplate: function() {
    var template = this.get('inputTemplate');
    if (template) {
      return 'filters/' + template;
    } else if (this.get('textFields')) {
      switch (this.get('textFields').length) {
        case 0:
          return 'filters/empty';
        case 1:
          return 'filters/onefieldfilter';
        case 2:
          return 'filters/twofieldsfilter';
        default:
          return 'filters/empty';
      }
    }
    return 'filters/empty';
  }.property('textFields', 'inputTemplate'),

  //
  // State change
  //
  switchFilterMode: function(){
    var currentMode = this.get('filterMode');
    switch (currentMode) {
      case 'include':
        currentMode = 'exclude';
        break;
      case 'exclude':
        currentMode = 'off';
        break;
      default:
        currentMode = 'include';
    }
    this.set('filterMode', currentMode);
  },

  switchsortOrder: function(){
    var currentsortOrder = this.get('sortOrder');
    switch (currentsortOrder) {
      case 'asc':
        currentsortOrder = 'desc';
        break;
      case 'desc':
        currentsortOrder = 'off';
        break;
      default:
        currentsortOrder = 'asc';
    }
    this.set('sortOrder', currentsortOrder);
  },

  resetFilter: function(removeSubfilters) {
    var textFields = Em.copy(this.get('textFields'));
    if (textFields) {
      textFields.forEach(function(tf){
        if (typeof tf.set === 'function') {
          tf.set('value', '');
        } else {
          Em.set(tf, 'value', '');
        }
      });
    }
    this.set('textFields', textFields); //need to force textFields observers
    this.set('filterMode', 'off');
    this.set('dateRange', undefined);
    this.set('relations', undefined);
    if (removeSubfilters) {
      var sf = this.get('linkedFilterItems');
      sf.content.forEach(function(item){
        Em.run.once(this, function(){
          item.deleteRecord();
        });
      });
    }
  }
});

export default FilterItem;
