import React, { useState } from 'react'
import { DatePicker, Typography, Modal, Form, Checkbox } from 'antd'

const OutOfUsePeriodModal = ({ visible, onCancel, title = null, okBtnTitle, onOk, text }) => {
    const [undefinedPeriod, setUndefinedPeriod] = useState(false)
    const [form] = Form.useForm()

    return (
        <Modal
            destroyOnClose
            title={<span className="bold">{title}</span>}
            visible={visible}
            onCancel={onCancel}
            cancelText="Close"
            okText={okBtnTitle || title}
            onOk={() => form.validateFields().then(values => onOk(values.period))}
        >
            {text && <Typography.Text>{text}</Typography.Text>}
            <Form
                form={form}
                name="periodForm"
                layout="vertical"
            >
                <Form.Item
                    name="period"
                    label="Period"
                    style={text ? { marginTop: 16 } : {}}
                    rules={[{ required: !undefinedPeriod, message: 'Please provide a period or set as undefined period' }]}
                >
                    <DatePicker.RangePicker
                        showTime
                        className="w-full"
                        format="YYYY-MM-DD HH:mm"
                        minuteStep={10}
                        disabled={undefinedPeriod}
                    />
                </Form.Item>
                <Form.Item name="undefinedPeriod">
                    <Checkbox checked={undefinedPeriod} onChange={event => setUndefinedPeriod(event.target.checked)}>
                        Undefined period
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OutOfUsePeriodModal
