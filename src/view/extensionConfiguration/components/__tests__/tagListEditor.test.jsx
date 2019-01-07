/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

import { mount } from 'enzyme';
import React from 'react';
import Button from '@react/react-spectrum/Button';
import Textfield from '@react/react-spectrum/Textfield';
import { DataElementSelectorButton } from '../dataElementSelectorButton';

import TagListEditor from '../tagListEditor';

const getReactComponents = (wrapper) => {
  const valueTextfield = wrapper.find(Textfield);
  const valueButton = wrapper.find(Button).at(0);
  const addButton = wrapper.find(Button).at(1);

  return {
    valueTextfield,
    valueButton,
    addButton
  };
};

describe('tag list editor', () => {
  let instance;
  let onChangeSpy;

  beforeEach(() => {
    onChangeSpy = jasmine.createSpy('onChange');

    const props = {
      value: [],
      onChange: onChangeSpy,
      meta: {
        touched: false,
        error: null
      }
    };

    instance = mount(<TagListEditor { ...props } />);
  });

  beforeEach(() => {
    onChangeSpy.calls.reset();
    window.extensionBridge = {};
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it('opens the data element selector from data element button', () => {
    const { valueButton } = getReactComponents(instance);

    window.extensionBridge.openDataElementSelector = jasmine.createSpy('openDataElementSelector')
      .and.callFake(() => {
        return {
          then(resolve) {
            resolve('%foo%');
          }
        };
      });

    valueButton.props().onClick();

    expect(window.extensionBridge.openDataElementSelector).toHaveBeenCalled();
  });

  it('adds a new tag after selecting a data element from the modal', () => {
    const { valueButton } = getReactComponents(instance);

    window.extensionBridge.openDataElementSelector = jasmine.createSpy('openDataElementSelector')
      .and.callFake(() => {
        return {
          then(resolve) {
            resolve('%foo%');
          }
        };
      });

    valueButton.props().onClick();

    expect(onChangeSpy).toHaveBeenCalledWith(['%foo%']);
  });

  it('adds a new tag when the add button is clicked', () => {
    const {
      addButton,
      valueTextfield
    } = getReactComponents(instance);

    valueTextfield.props().onChange('somevalue');
    addButton.props().onClick();

    expect(onChangeSpy).toHaveBeenCalledWith(['somevalue']);
  });


  it('adds a new tag when the enter key is pressed', () => {
    const {
      valueTextfield
    } = getReactComponents(instance);

    valueTextfield.props().onChange({
      target: {
        value: 'somevalue'
      }
    });

    valueTextfield.props().onKeyPress({ key: 'Enter', keyCode: 13, which: 13 });
    expect(onChangeSpy).toHaveBeenCalledWith(['somevalue']);
  });
});
