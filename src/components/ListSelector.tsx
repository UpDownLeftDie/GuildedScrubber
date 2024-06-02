import React, { useReducer } from "react";
import { Button, Checkbox } from "../atoms";

const style = {
  textAlign: "left",
};

const selectAllStyles = {
  fontWeight: "bold",
  marginBottom: 5,
};

const selectionListStyles = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 20,
};

const selectionBoxStyles = {
  marginLeft: 15,
};

const ACTION_TYPE = {
  SINGLE: "SINGLE",
  ALL: "ALL",
  SINGLE_ENTRY: "SINGLE_ENTRY",
};

const checkedReducer = (prevState, action) => {
  const { checked, id, sectionName, selectableList, type } = action;
  const { sections } = selectableList;
  const section = sections.find((section) => section.name === sectionName);
  const state = new Map(prevState.entries());
  let sectionState = state.get(sectionName);
  switch (type) {
    case ACTION_TYPE.SINGLE:
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
        sectionSet = new Set(section.items?.keys());
      }
      state.set(section.name, sectionSet);
      break;

    case ACTION_TYPE.SINGLE_ENTRY:
      sectionState.delete("_self");
      if (checked) sectionState.add("_self");
      state.set(sectionName, sectionState);
      return state;

    default:
      return prevState;
  }

  sectionState = state.get(sectionName);
  sectionState.delete("_all");
  if (checked && sectionState.size === section.items?.size) {
    sectionState.add("_all");
    state.set(sectionName, sectionState);
  }

  return state;
};

const ListSelector = ({
  selectableList,
  onSubmit = () => {},
  submitLabel = "Submit",
  listName = "",
  isLoading,
  forFrom = "from",
  flavor,
}) => {
  const [isChecked, dispatchCheck] = useReducer(checkedReducer, selectableList.isChecked);

  const checkedCount = getCheckedCount();
  function getCheckedCount() {
    let checkedTotal = 0;
    for (const section of isChecked.values()) {
      checkedTotal += section.size;
      if (section.has("_all")) checkedTotal--;
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
      const selectAllName = `selectAll-${sectionName.split(" ").join("")}`;
      const isSingleEntry = items ? false : true;
      const selectAllLabel = `${isSingleEntry ? "" : "Select All - "}${sectionName}`;
      const selectAllChecked =
        isChecked.get(sectionName)?.has?.("_all") || isChecked.get(sectionName)?.has?.("_self");

      const selectAll = (
        <div key={selectAllName} style={selectAllStyles}>
          <Checkbox
            id={selectAllName}
            label={selectAllLabel}
            onChange={(e) =>
              handleCheck({
                e,
                sectionName,
                type: isSingleEntry ? ACTION_TYPE.SINGLE_ENTRY : ACTION_TYPE.ALL,
              })
            }
            checked={selectAllChecked}
          />
        </div>
      );

      const sectionItems = [];
      items?.forEach((item) => {
        const { name: itemName, id } = item;
        sectionItems.push(
          <span key={id} style={selectionBoxStyles}>
            <Checkbox
              id={id}
              label={itemName}
              onChange={(e) =>
                handleCheck({
                  e,
                  sectionName,
                  type: ACTION_TYPE.SINGLE,
                })
              }
              checked={isChecked.get(sectionName).has(id)}
            />
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
          text={`${submitLabel} ${forFrom} ${checkedCount} ${checkedCount > 1 ? `${listName}s` : listName}`}
          flavor={flavor}
        />
      </form>
    </div>
  );
};

export default ListSelector;
