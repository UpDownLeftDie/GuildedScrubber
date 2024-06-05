import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { useRef } from "react";
import { CheckListItems, CheckListName } from "./MultiListSelector";

enum CheckAllState {
  NONE,
  SOME,
  ALL,
}
interface props {
  listItems: string[];
  listName: string;
  checkedItems: string[];
  handleValueChange: (listName: CheckListName, checkedItems: CheckListItems) => void;
}

const ListSelector = (props: props) => {
  const { listName, listItems, checkedItems } = props;
  let checkAllState = useRef(CheckAllState.NONE);

  const handleValueChange = (newCheckedItems: CheckListItems) => {
    props.handleValueChange(listName, newCheckedItems);
  };

  function _toggleCheckAll(isSelected: boolean) {
    let newCheckedItems: string[] = [];
    if (isSelected) {
      checkAllState.current = CheckAllState.ALL;
      newCheckedItems = listItems;
    } else {
      checkAllState.current = CheckAllState.NONE;
    }
    handleValueChange(newCheckedItems);
  }

  function _handleValueChange(newCheckedItems: string[]) {
    let newState = CheckAllState.NONE;
    if (newCheckedItems.length === listItems.length) {
      newState = CheckAllState.ALL;
    } else if (newCheckedItems.length > 0) {
      newState = CheckAllState.SOME;
    }
    checkAllState.current = newState;
    handleValueChange(newCheckedItems);
  }

  function getCheckBoxes() {
    return listItems.map((item) => {
      return (
        <Checkbox key={item} value={item}>
          {item}
        </Checkbox>
      );
    });
  }

  console.log({ checkedItems });

  const Checkboxes = getCheckBoxes();
  return (
    <>
      <Checkbox
        onValueChange={_toggleCheckAll}
        value={"all"}
        checked={checkAllState.current === CheckAllState.ALL}
        isIndeterminate={checkAllState.current === CheckAllState.SOME}
      >
        Check All - {listName}
      </Checkbox>
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
