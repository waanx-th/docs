import styled from 'styled-components';

const Button = styled.button`
  background-color: #0052FC;
  color: #FFFFFF;
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #003AA0;
  }
`;

export default Button;
