import React, { useState } from 'react';

const style = {
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
};

const selectAll = {
  fontWeight: 'bold',
  marginBottom: 10,
};

const ListSelector = ({
  items,
  onSubmit = () => {},
  groupName,
  submitLabel = 'Submit',
}) => {
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isChecked, setIsChecked] = useState([]);

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsChecked([...isChecked, id]);
    if (!checked) {
      setIsChecked(isChecked.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);
    setIsChecked(list.map((item) => item.props.children[0].props.id));
    if (isCheckAll) {
      setIsChecked([]);
    }
  };

  const _onSubmit = (e) => {
    e.preventDefault();
    onSubmit(isChecked);
  };

  const list = items.map((item) => {
    const { name, id } = item;
    return (
      <span key={`${id}-key`}>
        <input
          id={id}
          type="checkbox"
          name={groupName}
          value={id}
          onChange={handleClick}
          checked={isChecked.includes(id)}
        />
        <label htmlFor={id}>{name}</label>
      </span>
    );
  });

  return (
    <div style={style}>
      <span style={selectAll}>
        <input
          id="selectAll"
          type="checkbox"
          name="selectAll"
          onChange={handleSelectAll}
          checked={isCheckAll}
        />
        <label htmlFor="selectAll">Select All</label>
      </span>
      <form style={style} onSubmit={_onSubmit}>
        {list}
        <input type="submit" value={submitLabel} />
      </form>
    </div>
  );
};

export default ListSelector;
