import React from 'react';
import { shallowRender } from '../../app/common/Test'

import { SearchForm } from '../../app/components/SearchForm'
import { initialState } from '../../app/redux/modules/search'
import { FormControl } from 'react-bootstrap'
import DatePicker from '../../app/components/DatePicker'
import DropdownList from '../../app/components/DropdownList'

describe('SearchForm component', function () {
  let component;

  let options = {
    state: initialState,
    onSearch: function (){},
    actions: {
      applyDate: function (dateObj){},
      filterByDate: function (dateFrom, dateTo){},
      clearDate: function (){},
      selectOrder: function (orderId){},
      setSearchString: function (searchString){}
    }
  };

  const getComponent = function (_options = {}) {
    let props = {
      ...options,
      ..._options
    };
    return shallowRender(
      <SearchForm state={props.state}
                  onSearch={props.onSearch}
                  actions={props.actions}
      />
    );
  };

  beforeEach(function () {
    component = getComponent();
  });

  it('Check root element', function() {
    assert.equal(component.type, 'form');
    assert.equal(component.props.className, 'form--filters');
  });

  describe('Check Search Input', function() {
    let input;

    const getInputGroup = function () {
      return component
        .props.children
        .props.children[0]
        .props.children
        .props.children[1]
        .props.children
    };

    const getInput = function () {
      return getInputGroup()
        .props.children[0]
    };

    const getSeacrhBtn = function () {
      return getInputGroup()
        .props.children[1]
        .props.children;
    };

    beforeEach(function () {
      input = getInput();
    });

    it('Check root element', function() {
      assert.equal(input.type, FormControl);
    });

    it('Check value from initialState', function() {
      assert.equal(input.props.value, initialState.get('searchString'));
    });

    it('Check value from non-initialState', function() {
      component = getComponent({
        ...options,
        state: initialState.set('searchString', 'test')
      });
      input = getInput();
      assert.equal(input.props.value, 'test');
    });

    it('Check search button in default state', function() {
      let btn = getSeacrhBtn();
      assert.equal(btn.props.bsStyle, 'primary');
      assert.equal(btn.props.disabled, false);
      assert.equal(btn.props.children, 'Search');
    });

    it('Check search button if searching', function() {
      component = getComponent({
        ...options,
        state: initialState.set('isSearching', true)
      });
      let btn = getSeacrhBtn();
      assert.equal(btn.props.disabled, true);
      assert.equal(btn.props.children, 'Searching...');
    });

    it('Check click on search button', function() {
      const search = sinon.spy();
      component = getComponent({
        ...options,
        onSearch: search
      });
      let btn = getSeacrhBtn();
      btn.props.onClick();
      assert.isTrue(search.calledOnce);
    });

    it('Check onKeyPress for search input', function() {
      const search = sinon.spy();
      component = getComponent({
        ...options,
        onSearch: search
      });
      input = getInput();
      input.props.onKeyPress({
        key: 'Enter',
        preventDefault: function(){}
      });
      assert.isTrue(search.calledOnce);
    });

    it('Check onChange for search input', function() {
      const changeString = sinon.spy();
      component = getComponent({
        ...options,
        actions: {
          ...options.actions,
          setSearchString: changeString
        }
      });
      input = getInput();
      input.props.onChange({target: {value: 'test'}});
      assert.isTrue(changeString.calledOnce);
    });

  });

  if (initialState.getIn(['view', 'datePickerEnabled'])) {
    describe('Check DatePicker', function() {
      let datePicker;

      const getDatePicker = function () {
        return component
          .props.children
          .props.children[1]
          .props.children
      };

      beforeEach(function () {
        datePicker = getDatePicker();
      });

      it('Check root element', function() {
        assert.equal(datePicker.type, DatePicker);
      });

      it('Check default dateFrom and dateTo', function() {
        assert.equal(datePicker.props.dateFrom, '');
        assert.equal(datePicker.props.dateTo, '');
      });

      it('Check custom dateFrom and dateTo', function() {
        component = getComponent({
          ...options,
          state: initialState
            .set('dateFrom', '03/16/2016 0:00')
            .set('dateTo', '03/25/2016 0:00')
        });
        datePicker = getDatePicker();
        assert.equal(datePicker.props.dateFrom, '03/16/2016 0:00');
        assert.equal(datePicker.props.dateTo, '03/25/2016 0:00');
      });

      it('Check applyDate for DatePicker', function() {
        const applyDate = sinon.spy();
        const filterByDate = sinon.spy();
        component = getComponent({
          ...options,
          actions: {
            ...options.actions,
            applyDate: applyDate,
            filterByDate
          }
        });
        datePicker = getDatePicker();
        datePicker.props.applyDate();
        assert.isTrue(applyDate.calledOnce);
        assert.isTrue(filterByDate.calledOnce);
      });

      it('Check clearDate for DatePicker', function() {
        const clearDate = sinon.spy();
        const filterByDate = sinon.spy();
        component = getComponent({
          ...options,
          actions: {
            ...options.actions,
            clearDate: clearDate,
            filterByDate
          }
        });
        datePicker = getDatePicker();
        datePicker.props.clearDate();
        assert.isTrue(clearDate.calledOnce);
        assert.isTrue(filterByDate.calledOnce);
      });

    });
  }

  if (initialState.getIn(['view', 'orderEnabled'])) {
    describe('Check DropdownList', function() {
      let dropdown;

      const getDropdownList = function () {
        return component
          .props.children
          .props.children[2]
          .props.children
          .props.children
      };

      beforeEach(function () {
        dropdown = getDropdownList();
      });

      it('Check root element', function() {
        assert.equal(dropdown.type, DropdownList);
        assert.equal(dropdown.props.dropdownKey, 'sort-list-dropdown');
      });

      it('Check order items', function() {
        expect(dropdown.props.items).to.eql(initialState.get('order').toJS());
      });

      it('Check active order', function() {
        expect(dropdown.props.activeItemId).to.eql(initialState.get('selectedOrderId'));
      });

      it('Check onSelect for order dropdown', function() {
        const onSelect = sinon.spy();
        component = getComponent({
          ...options,
          actions: {
            ...options.actions,
            selectOrder: onSelect
          }
        });
        dropdown = getDropdownList();
        dropdown.props.onSelect('2');
        assert.isTrue(onSelect.calledOnce);
      });

    });
  }
});
