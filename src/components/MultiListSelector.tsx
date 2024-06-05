import Button, { FlavorsKey } from "@/atoms/Button";
import { useState } from "react";
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

  function onSubmit() {
    props.onSubmit(checkedListItems);
  }

  function handleValueChange(listName: CheckListName, checkedItems: CheckListItems) {
    setCheckedListItems((currentLists) => new Map(currentLists.set(listName, checkedItems)));
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
      <Button onClick={onSubmit} text={submitLabel} flavor={flavor} />
    </>
  );
}

export default MultiListSelector;
