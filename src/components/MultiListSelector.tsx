import { GSButton } from "@/atoms";
import { Divider } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import ListSelector from "./ListSelector";

export type CheckboxItemKey = string;
export type CheckboxItemValue = string;
export type CheckListItems = Map<CheckboxItemKey, CheckboxItemValue>;
export type CheckListName = string;
export type CheckLists = Map<CheckListName, CheckListItems>;

interface props {
  submitLabel: string;
  listsName: string;
  checkLists: CheckLists;
  onSubmit: (selectedListsItems: CheckLists) => Promise<void>;
  isLoading?: boolean;
  flavor?: "gold" | "goldSolid";
  size?: "md" | "lg" | "xl";
  additionalSelectedCount?: number;
}

function MultiListSelector(props: props) {
  const { submitLabel, flavor, size, isLoading, checkLists, additionalSelectedCount = 0 } = props;
  const [checkedListsItems, setCheckedListsItems] = useState<CheckLists>(new Map());
  const totalSelected = useRef(0);

  function onSubmit() {
    props.onSubmit(checkedListsItems);
  }

  useEffect(() => {
    handleValueChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalSelectedCount]);

  function handleValueChange(listName?: CheckListName, checkedItemKeys?: CheckboxItemKey[]) {
    setCheckedListsItems((currentLists) => {
      let newMap = new Map(currentLists);

      if (listName && checkedItemKeys) {
        const currentList = checkLists.get(listName) ?? new Map();
        const listCheckedItems: CheckListItems = checkedItemKeys.reduce((acc, key) => {
          const isChecked = currentList.get(key);
          if (isChecked) {
            acc.set(key, isChecked);
          }
          return new Map(acc);
        }, new Map() as CheckListItems);
        newMap = new Map(currentLists.set(listName, listCheckedItems));
      }

      const checkedCount = [...newMap.values()].reduce((count, checkListItems) => {
        count += checkListItems.size;
        return count;
      }, 0);
      totalSelected.current = checkedCount + additionalSelectedCount;
      return newMap;
    });
  }

  const lists: JSX.Element[] = [];
  for (const [name, options] of checkLists.entries()) {
    const checkedList = checkedListsItems.get(name) ?? new Map();
    const checkedItems = [...checkedList.keys()];
    lists.push(
      <>
        <ListSelector
          key={name}
          listName={name}
          listItems={options}
          checkedItems={checkedItems}
          handleValueChange={handleValueChange}
        />
        <Divider className="my-4" />
      </>,
    );
  }

  return (
    <>
      {lists}
      <GSButton
        type="submit"
        onClick={onSubmit}
        isLoading={isLoading}
        isDisabled={!totalSelected.current}
        color={flavor}
        size={size}
      >
        {submitLabel}
      </GSButton>
    </>
  );
}

export default MultiListSelector;
