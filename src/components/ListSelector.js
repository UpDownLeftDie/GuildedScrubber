import React, { useReducer } from 'react';
import { Button } from '../atoms';

const style = {
  textAlign: 'left',
};

const selectAllStyles = {
  fontWeight: 'bold',
  marginBottom: 5,
};

const selectionListStyles = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 20,
};

const selectionBoxStyles = {
  marginLeft: 15,
};

const ACTION_TYPE = {
  SINGLE: 'SINGLE',
  ALL: 'ALL',
};

const checkedReducer = (prevState, action) => {
  const { checked, id, sectionName, selectableList, type } = action;
  const { sections } = selectableList;
  const section = sections.find((section) => section.name === sectionName);
  console.log({ prevState, checked, selectableList });
  const state = new Map(prevState.entries());
  switch (type) {
    case ACTION_TYPE.SINGLE:
      const sectionState = state.get(sectionName);
      if (checked) {
        sectionState.add(id);
      } else {
        sectionState.delete(id);
      }
      state.set(sectionName, sectionState);
      break;

    case ACTION_TYPE.ALL:
      let sectionSet = new Set();
      if (checked) {
        sectionSet = new Set(section.items.keys());
      }
      state.set(section.name, sectionSet);
      break;

    default:
      return prevState;
  }

  const sectionState = state.get(sectionName);
  sectionState.delete('_all');
  if (sectionState.size === section.items.size) {
    sectionState.add('_all');
    state.set(sectionName, sectionState);
  }

  return state;
};

const ListSelector = ({
  selectableList,
  onSubmit = () => {},
  submitLabel = 'Submit',
  listName = '',
  isLoading,
  forFrom = 'from',
  flavor,
}) => {
  const [isChecked, dispatchCheck] = useReducer(
    checkedReducer,
    selectableList.isChecked,
  );

  const checkedCount = getCheckedCount();
  function getCheckedCount() {
    let checkedTotal = 0;
    for (const section of isChecked.values()) {
      checkedTotal += section.size;
      if (section.has('_all')) checkedTotal--;
    }
    return checkedTotal;
  }

  const handleCheck = ({ e, sectionName, type }) => {
    const { id, checked } = e.target;
    dispatchCheck({
      type,
      id,
      checked,
      sectionName,
      selectableList,
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    onSubmit(isChecked);
  };

  function convertCollectionArray() {
    const list = selectableList.sections.reduce((list, section) => {
      const { name: sectionName, items } = section;
      const selectAllName = `selectAll-${sectionName.split(' ').join('')}`;
      const selectAll = (
        <div key={selectAllName} style={selectAllStyles}>
          <input
            type="checkbox"
            name={selectAllName}
            onChange={(e) =>
              handleCheck({
                e,
                sectionName,
                type: ACTION_TYPE.ALL,
              })
            }
            checked={isChecked.get(sectionName).has('_all')}
          />
          <label htmlFor={selectAllName}>Select All - {sectionName}</label>
        </div>
      );

      const sectionItems = [];
      items.forEach((item) => {
        const { name: itemName, id } = item;
        sectionItems.push(
          <span key={id} style={selectionBoxStyles}>
            <input
              id={id}
              type="checkbox"
              name={itemName}
              value={id}
              onChange={(e) =>
                handleCheck({
                  e,
                  sectionName,
                  type: ACTION_TYPE.SINGLE,
                })
              }
              checked={isChecked.get(sectionName).has(id)}
            />
            <label htmlFor={id}>{itemName}</label>
          </span>,
        );
      });
      const selectionList = (
        <div key={sectionName} style={selectionListStyles}>
          {sectionItems}
        </div>
      );

      return [...list, selectAll, selectionList];
    }, []);

    return list;
  }

  let list = convertCollectionArray();
  return (
    <div style={style}>
      <form style={style} onSubmit={handleOnSubmit}>
        {list}
        <Button
          disabled={isLoading || checkedCount < 1}
          type="submit"
          text={`${submitLabel} ${forFrom} ${checkedCount} ${
            checkedCount > 1 ? `${listName}s` : listName
          }`}
          flavor={flavor}
        />
      </form>
    </div>
  );
};

export default ListSelector;
