import React, { useState, useCallback, Ref, SyntheticEvent, RefObject, useRef, useMemo } from 'react';
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
    const onInputChange = useMemo(() => () => {
        const inputData = inputElement.current ? inputElement.current.value : null;

            if (inputData) {
                fetch(`https://suggests.go.mail.ru/sg_ntp?ush=1&get_nvg=1&q=${inputData}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const newItems = data.items.map((item: any) => ({ value: item.text }));

                        console.log(newItems);
                        setItems(newItems);
                    });
            } else {
                setItems([]);
            }
    }, []);

    return (
        <Downshift
            itemToString={item => (item ? item.value : '')}
        >
            {({
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            highlightedIndex,
            selectedItem,
            getRootProps,
            }) => (
                <Wrapper {...getRootProps()}>
                    <InputBlock>
                        <SearchInputWrapper {...getInputProps({
                            onChange: onInputChange,
                            ref: inputElement
                        })} />
                    </InputBlock>
                    <ul {...getMenuProps()}>
                    {isOpen
                        ? items
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
            )}
        </Downshift>
    );
}
