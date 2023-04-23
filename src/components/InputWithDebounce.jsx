import React,{useState,useEffect} from 'react';
import useDebounce from '../hooks/useDebounce';

function InputWithDebounce({ onChange, delay, ...props }) {
    const [inputValue, setInputValue] = useState('');
    const debouncedValue = useDebounce(inputValue, delay);
  
    useEffect(() => {
      onChange(debouncedValue);
    }, [debouncedValue, onChange]);
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };
  
    return <input {...props} value={inputValue} onChange={handleInputChange} autocomplete='off'/>;
}

export default InputWithDebounce;