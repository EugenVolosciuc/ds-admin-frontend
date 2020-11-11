import React, { useState } from 'react'
import { Input, Typography, Modal } from 'antd'

const SimpleTextareaModal = ({ visible, onCancel, title = null, okBtnTitle, onOk, text }) => {
    const [value, setValue] = useState('')

    return (
        <Modal
            destroyOnClose
            title={<span className="bold">{title}</span>}
            visible={visible}
            onCancel={onCancel}
            cancelText="Close"
            okText={okBtnTitle || title}
            onOk={() => onOk(value)}
        >
            {text && <Typography.Text>{text}</Typography.Text>}
            <Input.TextArea value={value} onChange={event => setValue(event.target.value)} style={text ? { marginTop: 8 } : {}} />
        </Modal>
    )
}

export default SimpleTextareaModal
