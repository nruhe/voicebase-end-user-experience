import { createAction, handleActions } from 'redux-actions'
import { normalize } from '../../common/Normalize'
import { fromJS } from 'immutable';
import GroupsApi from '../../api/groupsApi'

/*
 * Constants
 * */
export const GET_GROUPS = 'GET_GROUPS';
export const DELETE_GROUP = 'DELETE_GROUP';
export const EDIT_GROUP = 'EDIT_GROUP';
export const ADD_GROUP = 'ADD_GROUP';
export const SET_ACTIVE_GROUP = 'SET_ACTIVE_GROUP';
export const CLEAR_ACTIVE_GROUP = 'CLEAR_ACTIVE_GROUP';

/*
 * Actions
 * */
export const getGroups = createAction(GET_GROUPS, (token) => {
  return {
    promise: GroupsApi.getGroups(token)
  }
});

export const deleteGroup = createAction(DELETE_GROUP, (token, groupId, groupName) => {
  return {
    data: {
      token,
      groupId
    },
    promise: GroupsApi.deleteGroup(token, groupId, groupName)
  }
});

export const editGroup = createAction(EDIT_GROUP, (token, groupId, newGroup) => {
  return {
    data: {
      token,
      groupId
    },
    promise: GroupsApi.createGroup(token, groupId, newGroup)
  }
});

export const editGroupName = (token, groupId, newGroup) => {
  return (dispatch, getState) => {
    const oldGroupName = getState().settings.groups.getIn(['groups', groupId, 'name']);
    dispatch({type: EDIT_GROUP + '_PENDING', payload: {groupId}});
    GroupsApi.createGroup(token, groupId, newGroup)
      .then((response) => {
        dispatch(deleteGroup(token, groupId, oldGroupName)).then(() => {
          dispatch({type: ADD_GROUP + '_FULFILLED', payload: {data: response.data}})
        })
      })
      .catch((error) => {
        dispatch({type: EDIT_GROUP + '_REJECTED', payload: {groupId, error}});
      });
  };
};

export const addGroup = createAction(ADD_GROUP, (token, newGroup) => {
  return {
    data: {
      token
    },
    promise: GroupsApi.createGroup(token, null, newGroup)
  }
});

export const setActiveGroup = createAction(SET_ACTIVE_GROUP, (groupId) => groupId);
export const clearActiveGroup = createAction(CLEAR_ACTIVE_GROUP);

export const actions = {
  getGroups,
  deleteGroup,
  editGroup,
  editGroupName,
  addGroup,
  setActiveGroup,
  clearActiveGroup
};

/*
 * State
 * */
export const initialState = fromJS({
  view: {
    title: 'Phrase Groups',
    addButtonLabel: 'Add phrase group',
    isExpandList: false,
    isExpandCreateForm: false
  },
  activeGroup: null,
  groupIds: [],
  groups: {},
  isGetPending: false,
  isAddPending: false,
  errorMessage: ''
});

/*
 * Reducers
 * */
export default handleActions({
  [GET_GROUPS + '_PENDING']: (state, { payload }) => {
    return state.merge({
      isGetPending: true,
      errorMessage: ''
    });
  },

  [GET_GROUPS + '_REJECTED']: (state, { payload }) => {
    return state.merge({
      isGetPending: false,
      errorMessage: payload.error
    });
  },

  [GET_GROUPS + '_FULFILLED']: (state, { payload: response }) => {
    let groupsResult = normalize(response.groups, (group, i) => {
      let result = normalize(group.keywords);
      return {
        name: group.name,
        keywordIds: result.ids,
        keywords: result.entities,
        id: i.toString()
      }
    });

    return state.merge({
      groupIds: groupsResult.ids,
      groups: groupsResult.entities,
      isGetPending: false,
      errorMessage: ''
    });
  },

  [DELETE_GROUP + '_PENDING']: (state, { payload }) => {
    return state.setIn(['groups', payload.groupId, 'isDeletePending'], true);
  },

  [DELETE_GROUP + '_REJECTED']: (state, { payload }) => {
    return state.mergeIn(['groups', payload.groupId], {
      isDeletePending: false,
      deleteError: payload.error
    });
  },

  [DELETE_GROUP + '_FULFILLED']: (state, { payload }) => {
    let groupIds = state.get('groupIds').filter(groupId => payload.groupId !== groupId);
    return state
      .set('groupIds', groupIds)
      .deleteIn(['groups', payload.groupId]);
  },

  [EDIT_GROUP + '_PENDING']: (state, { payload }) => {
    return state.mergeIn(['groups', payload.groupId], {
      isEditPending: true,
      editError: ''
    });
  },

  [EDIT_GROUP + '_REJECTED']: (state, { payload }) => {
    return state.mergeIn(['groups', payload.groupId], {
      isEditPending: false,
      editError: payload.error
    });
  },

  [EDIT_GROUP + '_FULFILLED']: (state, { payload }) => {
    let result = normalize(payload.data.keywords);

    return state.mergeIn(['groups', payload.groupId], {
      name: payload.data.name,
      keywordIds: result.ids,
      keywords: result.entities,
      isEditPending: false,
      editError: ''
    });
  },

  [ADD_GROUP + '_PENDING']: (state, { payload }) => {
    return state.set('isAddPending', true);
  },

  [ADD_GROUP + '_REJECTED']: (state, { payload }) => {
    return state.merge({
      isAddPending: false,
      addError: payload.error
    });
  },

  [ADD_GROUP + '_FULFILLED']: (state, { payload }) => {
    let id = new Date().getTime().toString();
    let result = normalize(payload.data.keywords);

    let groupIds = state.get('groupIds').concat(id);
    return state
      .merge({
        isAddPending: false,
        addError: '',
        groupIds
      })
      .mergeIn(['groups', id], {
        id,
        name: payload.data.name,
        keywordIds: result.ids,
        keywords: result.entities
      });
  },

  [SET_ACTIVE_GROUP]: (state, { payload: groupId }) => {
    let id = (state.get('activeGroup') !== groupId) ? groupId : null;
    return state.set('activeGroup', id);
  },

  [CLEAR_ACTIVE_GROUP]: (state) => {
    return state.set('activeGroup', null);
  }

}, initialState);
