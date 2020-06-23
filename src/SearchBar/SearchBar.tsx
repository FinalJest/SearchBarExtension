import React, { useState, useCallback, SyntheticEvent, RefObject, useRef, useMemo } from 'react';
import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import styled from 'styled-components';

const Wrapper = styled.div`
    margin: 20px;
`;

const InputBlock = styled.div`
    display: flex;
`;

const SearchInput = styled.input`
    flex: 1;
`;

const SearchInputWrapper = React.forwardRef<HTMLInputElement>((props, ref) => {
    return <SearchInput ref={ref} {...props} />;
  });
  

// const items = [
//     {value: 'apple'},
//     {value: 'pear'},
//     {value: 'orange'},
//     {value: 'grape'},
//     {value: 'banana'},
// ]

interface SearchSuggestItem {
    value: string
}

export default function SearchBar(): React.ReactElement {
    const [items, setItems] = useState([]);
    const inputElement = useRef<HTMLInputElement>(null);

    const stateReducer = useMemo(() => (state: DownshiftState<SearchSuggestItem>, changes: StateChangeOptions<SearchSuggestItem>) => {
        switch (changes.type) {
          case Downshift.stateChangeTypes.changeInput: {
            const inputData = inputElement.current;

            if (inputData) {
                console.log(inputElement.current.value);
                fetch(`https://suggests.go.mail.ru/sg_ntp?ush=1&get_nvg=1&q=${inputElement.current.value}`)
                    .then((response) => response.json())
                    .then((data) => console.log(data));
            }

            return changes;
          }
          default:
            return changes
        }
      }, []);

    return (
        <Downshift
            onChange={selection =>
            alert(selection ? `You selected ${selection.value}` : 'Selection Cleared')
            }
            itemToString={item => (item ? item.value : '')}
            stateReducer={stateReducer}
        >
            {({
            getInputProps,
            getItemProps,
            getLabelProps,
            getMenuProps,
            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
            getRootProps,
            }) => (
                <div>
                    <Wrapper>
                        {/* <label {...getLabelProps()}>Enter a fruit</label> */}
                        <InputBlock>
                            <SearchInputWrapper ref={inputElement} {...getInputProps()} />
                        </InputBlock>
                        <ul {...getMenuProps()}>
                        {isOpen
                            ? items
                                .filter(item => !inputValue || item.value.includes(inputValue))
                                .map((item, index) => (
                                <li
                                    {...getItemProps({
                                    key: item.value,
                                    index,
                                    item,
                                    style: {
                                        backgroundColor:
                                        highlightedIndex === index ? 'lightgray' : 'white',
                                        fontWeight: selectedItem === item ? 'bold' : 'normal',
                                    },
                                    })}
                                >
                                    {item.value}
                                </li>
                                ))
                            : null}
                        </ul>
                    </Wrapper>
            </div>
            )}
        </Downshift>
    );
}
