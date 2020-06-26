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

const SearchButton = styled.button`

`;

interface ISearchSuggestItem {
    value: string
}

interface IRichData {
    name?: string;
    source?: string;
    value?: number | any;
    day_temp?: string;
    local_url?: string; // TODO: Типизировать на урл?
    height?: number; // TODO: Понять зачем нужно
    width?: number; // TODOL Понять зачем нужно
}

interface ISuggestApiResponseItem {
    text: string;
    type: 'lite' | string; // TODO: Типизировать на enum и понять смысл
    textMarked: string; // TODO: Нужно понять, зачем это поле

    rich_category?: string; // TODO: Типизировать на enum и понять, зачем нужно
    rich_data?: IRichData;
}

interface ISuggestApiResponse {
    csrf_token: string;
    items: ISuggestApiResponseItem[];
    qid: string;
    sites: any[]; // TODO: Нужно понять, зачем это и что там
    terms: { query: string }; // TODO: Понять что тут может быть и при необходимости вынести в отдельный интерфейс
}

// Нужно чтобы работали тайпинги между styled-components и downshift
type IntrinsicInput = JSX.IntrinsicElements['input'] & { ref?: Ref<HTMLInputElement> };

export default function SearchBar(): React.ReactElement {
    const [items, setItems] = useState([]);
    const [currentValue, setCurrentValue] = useState<ISearchSuggestItem>(null);
    const inputElement = useRef<HTMLInputElement>(null);

    const openSearchTab = useCallback((value: string) => {
        chrome.tabs.update({ 
            url: `https://go.mail.ru/search?q=${value}`
        });
    }, [currentValue]);
    const onInputKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            openSearchTab(currentValue.value);
        }
    }, [currentValue]);
    const onSearchButtonClick = useCallback(() => {
        openSearchTab(currentValue.value);
    }, [currentValue]);

    const handleStateChange = useCallback((changes: StateChangeOptions<any>) => {
        switch (changes.type) {
            case Downshift.stateChangeTypes.changeInput: {
                setCurrentValue({ value: changes.inputValue });

                if (changes.inputValue !== '') {
                    fetch(`https://suggests.go.mail.ru/sg_ntp?ush=1&get_nvg=1&q=${changes.inputValue}`)
                        .then((response) => response.json())
                        .then((data: ISuggestApiResponse) => {
                            setItems(data.items.map((item) => ({ value: item.text })));
                        });
                } else {
                    setItems([]);
                }

                return;
            }
            case Downshift.stateChangeTypes.keyDownEnter:
            case Downshift.stateChangeTypes.clickItem:
                openSearchTab(changes.selectedItem.value);

                return;
        }
    }, []);

    const onInputChange = useCallback(() => {
        const inputData = inputElement.current ? inputElement.current.value : null;

            if (inputData) {
                fetch(`https://suggests.go.mail.ru/sg_ntp?ush=1&get_nvg=1&q=${inputData}`)
                    .then((response) => response.json())
                    .then((data: ISuggestApiResponse) => {
                        const newItems = data.items.map((item) => ({ value: item.text }));

                        setItems(newItems);
                    });
            } else {
                setItems([]);
            }
    }, []);

    return (
        <Downshift
            selectedItem={currentValue}
            itemToString={item => (item ? item.value : '')}
            onStateChange={handleStateChange}
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
                        <SearchInput 
                            {...getInputProps({
                                onChange: onInputChange,
                                onKeyDown: onInputKeyDown,
                                ref: inputElement,
                                isOpen,
                                placeholder: 'Enter Search Query'
                            }) as IntrinsicInput}
                        />
                        <SearchButton onClick={onSearchButtonClick}>Search</SearchButton>
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
