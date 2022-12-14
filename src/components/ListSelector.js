import React, { useState } from 'react';

const style = {
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
};

const selectAllStyles = {
  fontWeight: 'bold',
  marginBottom: 10,
};

const ListSelector = ({
  itemCollectionsArray,
  onSubmit = () => {},
  submitLabel = 'Submit',
}) => {
  const [isAllChecked, setIsAllChecked] = useState(new Set());
  const [isChecked, setIsChecked] = useState(() => {
    let sections = {};
    itemCollectionsArray.forEach(
      (collection) => (sections[collection.section] = new Set()),
    );
    return sections;
  });

  const handleSelectAll = (section) => {
    if (!isAllChecked.has(section)) {
      const { items } = itemCollectionsArray.find(
        (collection) => collection.section === section,
      );
      items.forEach((item) => isChecked[section].add(item.id));
      isAllChecked.add(section);
    } else {
      isChecked[section].clear();
      isAllChecked.delete(section);
    }

    setIsChecked({ ...isChecked });
    setIsAllChecked(new Set(Array.from(isAllChecked)));
  };

  const handleClick = (e, section) => {
    const { id, checked } = e.target;

    if (!checked) {
      isChecked[section].delete(id);
    } else {
      isChecked[section].add(id);
    }

    setIsChecked({ ...isChecked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(isChecked);
  };

  function convertCollectionArray() {
    const list = itemCollectionsArray.reduce((list, collection) => {
      const { section, items } = collection;

      const selectAll = (
        <span key={`selectAll-${section}`} style={selectAllStyles}>
          <input
            id="selectAll"
            type="checkbox"
            name={`selectAll-${section}`}
            onChange={() => handleSelectAll(section)}
            checked={setIsAllChecked[section]}
          />
          <label htmlFor="selectAll">Select All {section}</label>
        </span>
      );

      const sectionList = items.map((item) => {
        const { name, id } = item;

        return (
          <span key={`${id}-key`}>
            <input
              id={id}
              type="checkbox"
              name={section}
              value={id}
              onChange={(e) => handleClick(e, section)}
              checked={isChecked[section].has(id)}
            />
            <label htmlFor={id}>{name}</label>
          </span>
        );
      });

      return [...list, selectAll, ...sectionList];
    }, []);

    return list;
  }

  let list = convertCollectionArray();
  return (
    <div style={style}>
      <form style={style} onSubmit={handleSubmit}>
        {list}
        <input type="submit" value={submitLabel} />
      </form>
    </div>
  );
};

export default ListSelector;
