import React, { useState, useEffect } from 'react';
import { SelectableList } from '../classes';
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

const ListSelector = ({
  itemCollectionsArray,
  onSubmit = () => {},
  submitLabel = 'Submit',
  listName = '',
  isLoading,
  forFrom = 'from',
  flavor,
}) => {
  const [isAllChecked, setIsAllChecked] = useState(new Set());
  const [isChecked, setIsChecked] = useState(() => {
    let sections = {};
    itemCollectionsArray.forEach(
      (collection) => (sections[collection.sectionName] = new Set()),
    );
    return sections;
  });
  const [checkedCount, setCheckedCount] = useState(0);

  const handleSelectAll = (sectionName) => {
    if (!isAllChecked.has(sectionName)) {
      const { items } = itemCollectionsArray.find(
        (collection) => collection.sectionName === sectionName,
      );
      items.forEach((item) => isChecked[sectionName].add(item.id));
      isAllChecked.add(sectionName);
    } else {
      isChecked[sectionName].clear();
      isAllChecked.delete(sectionName);
    }

    setIsChecked({ ...isChecked });
    setIsAllChecked(new Set(Array.from(isAllChecked)));
  };

  const handleClick = (e, sectionName) => {
    const { id, checked } = e.target;

    if (!checked) {
      isChecked[sectionName].delete(id);
    } else {
      isChecked[sectionName].add(id);
    }

    setIsChecked({ ...isChecked });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    onSubmit(convertCheckedToObjects(isChecked));
  };
  const convertCheckedToObjects = (isChecked) => {
    const checkedArray = [];
    Object.entries(isChecked).forEach(([sectionName, ids]) => {
      const section = itemCollectionsArray.find(
        (collection) => collection.sectionName === sectionName,
      );
      ids.forEach((id) => {
        const item = section.items.find((item) => item.id === id);
        item.parentName = sectionName;
        checkedArray.push(item);
      });
    });
    return checkedArray;
  };

  useEffect(() => {
    let checkedTotal = 0;
    Object.values(isChecked).forEach((checkedSet) => {
      checkedTotal += checkedSet.size;
    });

    setCheckedCount(checkedTotal);
  }, [isChecked]);

  function convertCollectionArray() {
    const list = itemCollectionsArray.reduce((list, collection) => {
      const { sectionName, items } = collection;
      const name = `${sectionName.split(' ').join('')}`;
      const selectAllName = `selectAll-${name}`;
      const selectAll = (
        <div key={selectAllName} style={selectAllStyles}>
          <input
            type="checkbox"
            name={selectAllName}
            onChange={() => handleSelectAll(sectionName)}
            checked={setIsAllChecked[sectionName]}
          />
          <label htmlFor={selectAllName}>Select All - {sectionName}</label>
        </div>
      );

      const sectionListItems = items.map((item) => {
        const { name, id } = item;
        return (
          <span key={id} style={selectionBoxStyles}>
            <input
              id={id}
              type="checkbox"
              name={sectionName}
              value={id}
              onChange={(e) => handleClick(e, sectionName)}
              checked={isChecked[sectionName].has(id)}
            />
            <label htmlFor={id}>{name}</label>
          </span>
        );
      });
      const selectionList = (
        <div key={name} style={selectionListStyles}>
          {sectionListItems}
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
