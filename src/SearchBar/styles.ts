import styled from 'styled-components';

const textColor = '#3D3D3D';
const textSize = '17px';
const sidePadding = '19px';

const Wrapper = styled.div`
    padding: 20px;
    color: ${textColor};
`;

const InputBlock = styled.div`
    display: flex;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1), 0px 0px 4px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 6px 6px 6px ${sidePadding};
    background-color: white;
    height: 52px;
    box-sizing: border-box;
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: ${textSize};
`;

const ClearInputButton = styled.button`
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
    width: 40px;
    cursor: pointer;
`;

const SearchButton = styled.button`
    width: 126px;
    background: linear-gradient(225.1deg, #458EFF 0%, #6B3DFF 100%);
    border-radius: 2px;
    color: white;
    border: none;
    cursor: pointer;
`;

const SuggestMenu = styled.div`
    margin-top: 8px;
    background: white;
    border-radius: 4px;
`;

const SuggestItem = styled.a`
    display: flex;
    color: ${textColor};
    text-decoration: none;
    font-size: ${textSize};
    padding: 8px ${sidePadding};
    background: ${(props: { selected: boolean }) => props.selected ? '#EBEEF1' : 'transparent'}

    &:first-child {
        margin-top: 8px;
    }

    &:last-child {
        margin-botton: 8px;
    }
`;

export {
    Wrapper,
    InputBlock,
    SearchInput,
    ClearInputButton,
    SearchButton,
    SuggestMenu,
    SuggestItem
}
