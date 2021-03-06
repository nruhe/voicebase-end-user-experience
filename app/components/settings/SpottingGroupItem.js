import React, { PropTypes } from 'react'
import {Col, Button, ListGroupItem, Label, Collapse} from 'react-bootstrap'
import classnames from 'classnames'
import Spinner from '../Spinner'
import SpottingGroupItemForm from './SpottingGroupItemForm'
import { parseReactSelectValues } from '../../common/Common'

export class SpottingGroupItem extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    group: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  };

  toggleItem = () => {
    if (this.props.isActive) {
      this.collapseForm();
    }
    else {
      this.props.actions.setActiveGroup(this.props.group.id);
    }
  };

  collapseForm = () => {
    this.props.actions.clearActiveGroup();
  };

  deleteGroup = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.actions.deleteGroup(this.props.token, this.props.group.id, this.props.group.name);
  };

  editGroup = (values) => {
    const { actions, token, group } = this.props;
    let keywords = parseReactSelectValues(values.keywords);

    let newGroup = {
      name: values.name,
      keywords
    };
    this.collapseForm();
    const isEditName = newGroup.name !== group.name;
    if (isEditName) {
      actions.editGroupName(token, group.id, newGroup);
    }
    else {
      actions.editGroup(token, group.id, newGroup);  
    }    
  };

  render() {
    let group = this.props.group;

    let listItemClasses = classnames('list-group-item__section', {'collapsed': !this.props.isActive});

    let keywords = group.keywordIds.map(id => group.keywords[id]);
    let initialValue = {
      name: group.name,
      description: group.description,
      isDefault: group.isDefault,
      keywords: keywords
    };
    let keywordsSelectValue = keywords.map(word => {
      return {
        value: word,
        label: word
      }
    });

    return (
      <section className={listItemClasses}>
        <ListGroupItem href="javascript:void(0)" onClick={this.toggleItem}>
          <Col sm={4}>
            <h4 className="list-group-item-heading">
              {group.name}
              {group.isDefault && <Label bsStyle="primary">Default</Label>}
            </h4>
          </Col>
          <Col sm={7} className="overflow-hidden">
            <p className="list-group-item-labels">
              {group.keywordIds.map(keywordId => {
                let keywordName = group.keywords[keywordId];
                let key = 'group__keyword-label-' + keywordName;
                return <Label key={key} className="label-bordered">{keywordName}</Label>
              })}
            </p>
          </Col>
          {(group.isDeletePending || group.isEditPending) && <Spinner isSmallItem />}
          {!group.isDeletePending && !group.isEditPending &&
            <Button bsStyle="link" className="btn-delete" onClick={this.deleteGroup}>
              <i className="fa fa-trash" />
            </Button>
          }
        </ListGroupItem>

        <Collapse id={'group-form' + group.id} in={this.props.isActive}>
          <div>
            <SpottingGroupItemForm
              formKey={'group' + group.id}
              keywordsSelectValue={keywordsSelectValue}
              initialValues={initialValue}
              onSubmit={this.editGroup}
              onCancel={this.collapseForm}
            />
          </div>
        </Collapse>
      </section>
    )
  }
}

export default SpottingGroupItem
