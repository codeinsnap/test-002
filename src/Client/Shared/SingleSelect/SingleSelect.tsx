import React, { useEffect, useRef, useState } from "react";

const Icon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20">
      <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
    </svg>
  );
};

const SingleSelect = ({
  name,
  placeHolder,
  options,
  handleFieldChange
}: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>();
  const inputRef = useRef<any>();

  useEffect(() => {
    const handler = (e:any) => {
      if (inputRef.current && !inputRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("click", handler);
    };
  });
  const handleInputClick = (e: any) => {
    setShowMenu(!showMenu);
  };

  const getDisplay = () => {
    if (!selectedValue || selectedValue.length === 0) {
      return placeHolder;
    }
    return (
      <div className="dropdown-tags">
        <div className="dropdown-tag-item">
          {selectedValue}
        </div>
      </div>
    );
  };

  const onItemClick = (option: any) => {
    setSelectedValue(option.label);
  };

  const isSelected = (option: any) => {
    return selectedValue?.value === option.value;
  };

  useEffect(() => {
    handleFieldChange(name, selectedValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  return (
    <div className="dropdown-container">
      <div ref={inputRef} onClick={handleInputClick} className="dropdown-input">
        <div className="dropdown-selected-value">{getDisplay()}</div>
        <div className="dropdown-tools">
          <div className="dropdown-tool">
            <Icon />
          </div>
        </div>
      </div>
      {showMenu && (
        <div className="dropdown-menu">
          {options?.map((option: any) => (
            <div
              onClick={() => onItemClick(option)}
              key={option.value}
              className={`dropdown-item ${isSelected(option) && "selected"}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
