"use client";

import React, { useState } from 'react';
import { Button, Checkbox, Popover } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

/**
 * ColumnVisibilityDropdown - Dropdown checkbox to toggle column visibility
 * 
 * Props:
 *   columns       - full columns array (with key & title)
 *   hiddenKeys    - Set or array of hidden column keys
 *   onChange       - (hiddenKeys: string[]) => void
 *   alwaysVisible - array of keys that cannot be hidden (default: ['index', 'stt', 'action'])
 */
const ColumnVisibilityDropdown = ({ columns, hiddenKeys = [], onChange, alwaysVisible = ['index', 'stt', 'action'] }) =>
{
    const [open, setOpen] = useState(false);

    const toggleableColumns = columns.filter(col => !alwaysVisible.includes(col.key));

    const handleCheck = (key, checked) =>
    {
        const currentHidden = new Set(hiddenKeys);
        if (checked)
        {
            currentHidden.delete(key);
        } else
        {
            currentHidden.add(key);
        }
        onChange([...currentHidden]);
    };

    const content = (
        <div style={{ maxHeight: 300, overflowY: 'auto', minWidth: 180 }}>
            {toggleableColumns.map(col => (
                <div key={col.key} style={{ padding: '4px 0' }}>
                    <Checkbox
                        checked={!hiddenKeys.includes(col.key)}
                        onChange={(e) => handleCheck(col.key, e.target.checked)}
                    >
                        {col.title}
                    </Checkbox>
                </div>
            ))}
        </div>
    );

    return (
        <Popover
            content={content}
            title="Cột hiển thị"
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
        >
            <Button icon={<SettingOutlined />}>
                Cột hiển thị
            </Button>
        </Popover>
    );
};

export default ColumnVisibilityDropdown;
