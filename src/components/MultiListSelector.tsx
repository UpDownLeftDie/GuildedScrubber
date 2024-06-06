import Button, { FlavorsKey } from "@/atoms/Button";
import { useRef, useState } from "react";
import ListSelector from "./ListSelector";

export type CheckListName = string;
export type CheckListItems = string[];
export type CheckItemsLists = Map<CheckListName, CheckListItems>;

interface props {
  submitLabel: string;
  listsName: string;
  checkItemsLists: CheckItemsLists;
  onSubmit: (selectedListsItems: CheckItemsLists) => Promise<void>;
  isLoading?: boolean;
  flavor?: FlavorsKey;
}

function MultiListSelector(props: props) {
  const { submitLabel, flavor, checkItemsLists } = props;
  const [checkedListItems, setCheckedListItems] = useState<CheckItemsLists>(new Map());
  const totalSelected = useRef(0);

  function onSubmit() {
    props.onSubmit(checkedListItems);
  }

  function handleValueChange(listName: CheckListName, checkedItems: CheckListItems) {
    setCheckedListItems((currentLists) => {
      const newMap = new Map(currentLists.set(listName, checkedItems));
      totalSelected.current = [...newMap.values()].reduce((count, checkListItems) => {
        count += checkListItems.length;
        return count;
      }, 0);
      return newMap;
    });
  }

  const lists: JSX.Element[] = [];
  for (const [name, options] of checkItemsLists.entries()) {
    const checkedItems = checkedListItems.get(name) || [];
    lists.push(
      <ListSelector
        key={name}
        listName={name}
        listItems={options}
        checkedItems={checkedItems}
        handleValueChange={handleValueChange}
      />,
    );
  }

  return (
    <>
      {lists}
      <Button onClick={onSubmit} disabled={!totalSelected} text={submitLabel} flavor={flavor} />
    </>
  );
}

export default MultiListSelector;
