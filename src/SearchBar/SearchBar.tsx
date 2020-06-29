import React, { useState, useCallback, Ref } from 'react';
import Downshift, { StateChangeOptions } from 'downshift';

import {
    Wrapper,
    InputBlock,
    SearchInput,
    SearchButton,
    ClearInputButton,
    SuggestMenu,
    SuggestItem
} from './styles';

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

function getSearchUrl(query: string): string {
    return `https://go.mail.ru/search?q=${query}`;
}

function openSearchTab(value: string): void {
    chrome.tabs.update({ 
        url: getSearchUrl(value)
    });
};

function searchSuggestItemToString(item: ISearchSuggestItem): string {
    return item ? item.value : '';
}

export default function SearchBar(): React.ReactElement {
    const [items, setItems] = useState<ISearchSuggestItem[]>([]);
    const [currentValue, setCurrentValue] = useState<ISearchSuggestItem>(null);

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
                getRootProps,
                clearSelection
            }) => (
                <Wrapper {...getRootProps()}>
                    <InputBlock>
                        <SearchInput 
                            {...getInputProps({
                                onKeyDown: onInputKeyDown,
                                placeholder: 'Enter Search Query'
                            }) as IntrinsicInput}
                        />
                        <ClearInputButton
                            onClick={() => clearSelection()}
                        >
                            <img src="../../images/clear.svg" />
                        </ClearInputButton>
                        <SearchButton 
                            onClick={onSearchButtonClick}
                        >
                            Search
                        </SearchButton>
                    </InputBlock>
                    <SuggestMenu {...getMenuProps()}>
                    {isOpen
                        ? items
                            .map((item, index) => (
                            <SuggestItem
                                {...getItemProps({
                                key: item.value,
                                index,
                                selected: highlightedIndex === index,
                                item,
                                href: getSearchUrl(item.value)
                                })}
                            >
                                {item.value}
                            </SuggestItem>
                            ))
                        : null}
                    </SuggestMenu>
                </Wrapper>
            )}
        </Downshift>
    );
}
