import React, { useState, useCallback, useRef, Ref } from 'react';
import Downshift, { StateChangeOptions } from 'downshift';
import styled from 'styled-components';

const Wrapper = styled.div`
    padding: 20px;
`;

const InputBlock = styled.div`
    display: flex;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1), 0px 0px 4px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 6px;
    background-color: white;
    height: 52px;
    box-sizing: border-box;
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
`;

const SearchButton = styled.button`
    width: 126px;
    background: linear-gradient(225.1deg, #458EFF 0%, #6B3DFF 100%);
    border-radius: 2px;
    color: white;
    border: none;
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

function openSearchTab(value: string): void {
    chrome.tabs.update({ 
        url: `https://go.mail.ru/search?q=${value}`
    });
};

function searchSuggestItemToString(item: ISearchSuggestItem): string {
    return item ? item.value : '';
}

export default function SearchBar(): React.ReactElement {
    const [items, setItems] = useState<ISearchSuggestItem[]>([]);
    const [currentValue, setCurrentValue] = useState<ISearchSuggestItem>(null);
    const inputElement = useRef<HTMLInputElement>(null);

    const onInputKeyDown = useCallback((e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            openSearchTab(currentValue.value);
        }
    }, [currentValue]);
    const onSearchButtonClick = useCallback((): void => {
        openSearchTab(currentValue.value);
    }, [currentValue]);

    const handleStateChange = useCallback((changes: StateChangeOptions<any>): void => {
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

                break;
            }
            case Downshift.stateChangeTypes.keyDownEnter:
            case Downshift.stateChangeTypes.clickItem:
                openSearchTab(changes.selectedItem.value);

                break;
            case Downshift.stateChangeTypes.itemMouseEnter:
            case Downshift.stateChangeTypes.keyDownArrowUp:
            case Downshift.stateChangeTypes.keyDownArrowDown:
                setCurrentValue(items[changes.highlightedIndex]);

                break;
        }
    }, [items]);

    return (
        <Downshift
            selectedItem={currentValue}
            itemToString={searchSuggestItemToString}
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
                                onKeyDown: onInputKeyDown,
                                ref: inputElement,
                                isOpen,
                                placeholder: 'Enter Search Query'
                            }) as IntrinsicInput}
                        />
                        <SearchButton 
                            onClick={onSearchButtonClick}
                        >
                            Search
                        </SearchButton>
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
