import React, { memo, useEffect, useRef, useState } from 'react';
import { multiSelectStyle } from './mult_select_tailwind';

function MultiSelect(props: any) {
    const { name, option, placeholder, handleChange, handleSelectDeselectAll, showCount, count, searchable, ignoreCase, getMultiSelectApis } = props;
    const [expanded, setExpanded] = useState(false);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [searchText, setSearchText] = useState('')
    const [list, setList] = useState<any[]>([...option]);

    useEffect(()=>{
        if(getMultiSelectApis){
            getMultiSelectApis({
                setExpanded
            })
        }
    },[])

    const handleSearch = (e: any) => {
        let txt = e.target.value;
        setSearchText(txt);
    };

    const filterOptions = (filterTxt:string) => {
        if (searchText !== '') {
            let tempList = [...option];
            setList(tempList.filter((obj) => ignoreCase ? obj.name.toLowerCase().indexOf(filterTxt.toLowerCase()) != -1 : obj.name.indexOf(filterTxt) != -1));
        } else {
            setList([...option]);
        }
    }
    useEffect(() => {
        filterOptions(searchText);
        let tempList = [...option];
        const isAllSelected = tempList.length > 0 ? tempList.reduce((a, b) => a && b.checked, true) : false;
        setIsAllSelected(isAllSelected);
    }, [searchText, option]);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const isOptionSelected = list.some((item) => item.checked);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (!dropdownRef.current) {
            return;
          }
          const clickedInsideCurrent = dropdownRef.current.contains(event.target as Node);
          const clickedInsideAnotherDropdown = (event.target as Element).closest('.dropdown') !== null;
          if (!clickedInsideCurrent) {
            if (!clickedInsideAnotherDropdown || !isOptionSelected) {
              setExpanded(false);
            }
          }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
      }, [dropdownRef, isOptionSelected]);
    // window.addEventListener('click', () => {
    //     setExpanded(false)
    // })

    return (
        <div className={multiSelectStyle.wrapper}>
            <div className={multiSelectStyle.expand} key={name} onClick={(e: any) => { e.stopPropagation(); setExpanded(!expanded) }}>
                {showCount && (
                    <div className={multiSelectStyle.all}>{count}</div>
                )}
                <div className={multiSelectStyle.placeholder}>{placeholder}</div>
                {!expanded ? (
                    <div></div>
                ) : (
                    <div className='cursor-pointer'>X</div>
                )}
            </div>

            {expanded && (
                <>
                    <div className={`${multiSelectStyle.option} dropdown`} ref={dropdownRef}>
                        {searchable &&
                            <label>
                                <input name={`search_${name}`}
                                    className={multiSelectStyle.searchInput}
                                    value={searchText}
                                    onChange={handleSearch}
                                >
                                </input>
                            </label>
                        }
                        {/* Select All or DeselectAll */}
                        <label>
                            <input
                                name={name}
                                className={multiSelectStyle.input}
                                type="checkbox" //true flase 
                                // value={isAllSelected}
                                checked={isAllSelected}
                                onChange={(e) => {
                                    setIsAllSelected(!isAllSelected)
                                    handleSelectDeselectAll(e, name)
                                }}
                            />
                            All
                        </label>
                        {list.map((item: any) =>
                            <label key={item.val}>
                                <input
                                    name={name}
                                    className={multiSelectStyle.input}
                                    type="checkbox" //true flase 
                                    value={item.val}
                                    checked={item.checked}
                                    onChange={(e) => handleChange(e, name)}
                                />
                                {item.name ?? item.val}
                            </label>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default memo(MultiSelect);
