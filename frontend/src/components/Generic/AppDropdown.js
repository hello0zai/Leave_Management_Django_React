import React from 'react';
import { Select , Form } from 'antd';

const { Option } = Select;

const AppDropdown = ({ label, name, options, placeholder, rules ,labelKey, onChange, ...props  }) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[ ...(rules || [])]}
    >
      <Select placeholder={placeholder} onChange={onChange} {...props}>
        {options.map((option) => (
          <Option key={option.id} value={option.id}>
            {labelKey ? option[labelKey] : option.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default AppDropdown;





