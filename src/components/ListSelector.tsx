import { GSCheckbox } from "@/atoms";
import { CheckboxGroup } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { CheckListName, CheckboxItemKey, CheckboxItemValue } from "./MultiListSelector";

enum CheckAllState {
  NONE,
  SOME,
  ALL,
}
interface props {
  listItems: Map<CheckboxItemKey, CheckboxItemValue>;
  listName: string;
  checkedItems: CheckboxItemKey[];
  handleValueChange: (listName: CheckListName, checkedItems: CheckboxItemKey[]) => void;
}

const ListSelector = (props: props) => {
  const { listName, listItems, checkedItems } = props;
  let [checkAllState, setCheckAllState] = useState(CheckAllState.NONE);

  useEffect(() => {
    const newState = getCheckAllState(checkedItems);
    console.log(checkedItems.length, newState);
    setCheckAllState(newState);

    function getCheckAllState(checkedItems: CheckboxItemKey[]) {
      let checkAllState = CheckAllState.NONE;
      if (checkedItems.length === listItems.size) {
        checkAllState = CheckAllState.ALL;
      } else if (checkedItems.length > 0) {
        checkAllState = CheckAllState.SOME;
      }
      return checkAllState;
    }
  }, [checkedItems, listItems.size]);

  function toggleCheckAll() {
    let newCheckedItems: CheckboxItemKey[] = [];
    if (checkAllState !== CheckAllState.ALL) {
      newCheckedItems = [...listItems.keys()];
    }
    handleValueChange(newCheckedItems);
  }

  const handleValueChange = (newCheckedItems: CheckboxItemKey[]) => {
    props.handleValueChange(listName, newCheckedItems);
  };

  function _handleValueChange(newCheckedItems: CheckboxItemKey[]) {
    handleValueChange(newCheckedItems);
  }

  function getCheckBoxes() {
    return [...listItems.entries()].map(([key, value]) => {
      return (
        <GSCheckbox key={key} value={key} color="warning">
          {value}
        </GSCheckbox>
      );
    });
  }

  const Checkboxes = getCheckBoxes();
  return (
    <>
      <GSCheckbox
        onValueChange={toggleCheckAll}
        isSelected={checkAllState === CheckAllState.ALL}
        isIndeterminate={checkAllState === CheckAllState.SOME}
      >
        Check All - {listName}
      </GSCheckbox>
      <CheckboxGroup
        style={{ paddingLeft: "25px" }}
        value={checkedItems}
        onValueChange={_handleValueChange}
      >
        {Checkboxes}
      </CheckboxGroup>
    </>
  );
};

export default ListSelector;
